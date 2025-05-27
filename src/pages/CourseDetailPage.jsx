// src/pages/CourseDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseById } from '../services/courseService';
import { getAssessmentsForCourse, deleteAssessment as deleteAssessmentService } from '../services/assessmentService'; // <-- Import deleteAssessment
import { useAuth } from '../contexts/AuthContext';

function CourseDetailPage() {
  const { courseId } = useParams(); 
  const { currentUser } = useAuth(); 
  
  const [course, setCourse] = useState(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [courseError, setCourseError] = useState(null);

  const [assessments, setAssessments] = useState([]);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(true);
  const [assessmentsError, setAssessmentsError] = useState(null);
  const [assessmentActionError, setAssessmentActionError] = useState(null); // For delete/edit errors

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) {
        setIsLoadingCourse(false);
        setCourseError("Course ID is missing.");
        return;
      }
      setIsLoadingCourse(true);
      setCourseError(null);
      try {
        const data = await getCourseById(courseId);
        setCourse(data);
      } catch (err) {
        console.error(`Failed to fetch course details for ID ${courseId}:`, err);
        setCourseError(err.message || `Failed to fetch course details. Please try again.`);
      } finally {
        setIsLoadingCourse(false);
      }
    };
    fetchCourseDetails();
  }, [courseId]);

  const fetchAssessmentsForCourse = async () => { // Made this a callable function
    if (course && course.courseId) { 
      setIsLoadingAssessments(true);
      setAssessmentsError(null);
      setAssessmentActionError(null); // Clear action errors on re-fetch
      try {
        const data = await getAssessmentsForCourse(course.courseId);
        setAssessments(data);
      } catch (err) {
        console.error(`Failed to fetch assessments for course ID ${course.courseId}:`, err);
        setAssessmentsError(err.message || 'Failed to fetch assessments.');
      } finally {
        setIsLoadingAssessments(false);
      }
    } else if (!isLoadingCourse && !course) {
        setIsLoadingAssessments(false);
    }
  };

  useEffect(() => {
    fetchAssessmentsForCourse();
  }, [course, isLoadingCourse]); // Re-run when course is loaded

  const isCourseOwner = currentUser && currentUser.role === 'Instructor' && course && course.instructorId === currentUser.userId;

  const handleDeleteAssessment = async (assessmentId, assessmentTitle) => {
    setAssessmentActionError(null);
    if (window.confirm(`Are you sure you want to delete the assessment "${assessmentTitle}"?`)) {
      try {
        await deleteAssessmentService(assessmentId);
        // Refetch assessments to update the list OR filter locally
        setAssessments(prevAssessments => prevAssessments.filter(asm => asm.assessmentId !== assessmentId));
        alert(`Assessment "${assessmentTitle}" deleted successfully.`);
      } catch (err) {
        console.error(`Failed to delete assessment ${assessmentId}:`, err);
        const errorMessage = err.message || `Failed to delete assessment "${assessmentTitle}". Please try again.`;
        setAssessmentActionError(errorMessage);
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  if (isLoadingCourse) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading course details...</span>
        </div>
      </div>
    );
  }

  if (courseError) {
    return (
      <div className="alert alert-danger" role="alert">
        <strong>Error loading course:</strong> {courseError}
      </div>
    );
  }

  if (!course) {
    return (
      <div className="alert alert-warning" role="alert">
        Course not found. It might have been removed or the ID is incorrect.
        <div className="mt-3">
          <Link to="/courses" className="btn btn-secondary">Back to Courses</Link>
        </div>
      </div>
    );
  }

  const renderAssessments = () => {
    if (isLoadingAssessments) {
      return (
        <div className="d-flex justify-content-center py-3">
          <div className="spinner-border spinner-border-sm text-secondary" role="status">
            <span className="visually-hidden">Loading assessments...</span>
          </div>
        </div>
      );
    }
    if (assessmentsError) {
      return <p className="text-danger px-3 py-2">Error loading assessments: {assessmentsError}</p>;
    }
    if (assessmentActionError) { // Display delete error specifically for assessments section
        return <div className="alert alert-danger mx-3" role="alert">Error: {assessmentActionError}</div>;
    }
    if (assessments.length === 0) {
      return <p className="text-muted px-3 py-2">No assessments available for this course yet.</p>;
    }
    return (
      <ul className="list-group list-group-flush">
        {assessments.map(assessment => (
          <li key={assessment.assessmentId} className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
            <div className="me-auto"> {/* Allow text to wrap */}
              <h6 className="mb-1">{assessment.title}</h6>
              <small className="text-muted">Max Score: {assessment.maxScore}</small>
            </div>
            <div className="btn-group mt-2 mt-sm-0" role="group" aria-label="Assessment Actions"> {/* mt-2 for small screens, mt-sm-0 for larger */}
              {isCourseOwner && (
                <>
                  <Link
                    to={`/courses/${courseId}/assessments/${assessment.assessmentId}/edit`}
                    className="btn btn-sm btn-outline-secondary"
                    title="Edit Assessment"
                  >
                    <i className="bi bi-pencil-fill me-1"></i>Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteAssessment(assessment.assessmentId, assessment.title)}
                    className="btn btn-sm btn-outline-danger"
                    title="Delete Assessment"
                  >
                    <i className="bi bi-trash-fill me-1"></i>Delete
                  </button>
                </>
              )}
              {currentUser && currentUser.role === 'Student' && (
                <Link 
                  to={`/assessment/${assessment.assessmentId}/attempt`} 
                  className="btn btn-sm btn-outline-success"
                >
                  Attempt Quiz
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="container mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/courses">Courses</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{course.title}</li>
        </ol>
      </nav>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h1 className="card-title mb-0 h2">{course.title}</h1>
          {/* TODO: Add Edit/Delete course buttons for course owner later */}
        </div>
        <div className="card-body">
          <p className="card-text"><strong>Instructor:</strong> {course.instructorName || 'N/A'}</p>
          <p className="card-text"><strong>Description:</strong> {course.description || 'No description provided.'}</p>
          
          {course.mediaUrl && (
            <div className="mb-3">
              <strong>Course Media:</strong>
              <p>
                <a href={course.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                  <i className="bi bi-link-45deg me-1"></i>{course.mediaUrl}
                </a>
              </p>
            </div>
          )}
        </div>
        <div className="card-footer text-muted">
          Course ID: {course.courseId}
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Assessments</h4>
          {isCourseOwner && (
            <Link 
              to={`/courses/${courseId}/assessments/create`} 
              className="btn btn-sm btn-success"
            >
              <i className="bi bi-plus-circle-fill me-1"></i>Create New Assessment
            </Link>
          )}
        </div>
        <div className="card-body p-0">
          {renderAssessments()}
        </div>
      </div>

      <div className="mt-4 mb-5">
        <Link to="/courses" className="btn btn-outline-secondary">
          &laquo; Back to All Courses
        </Link>
      </div>
    </div>
  );
}

export default CourseDetailPage;
