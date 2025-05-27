// src/pages/ViewAssessmentResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCourseById } from '../services/courseService';
import { getAssessmentById } from '../services/assessmentService';
import { getResultsForAssessment } from '../services/resultService'; // Service to get results

function ViewAssessmentResultsPage() {
  const { courseId, assessmentId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [results, setResults] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    if (!courseId || !assessmentId) {
      setPageError("Course ID or Assessment ID is missing.");
      setIsLoading(false);
      return;
    }
    if (!currentUser || currentUser.role !== 'Instructor') {
      setPageError("Access Denied: You must be an Instructor to view assessment results.");
      setIsLoading(false);
      // navigate('/login'); // Or to an unauthorized page
      return;
    }

    const fetchDataAndVerify = async () => {
      setIsLoading(true);
      setPageError('');
      try {
        // 1. Fetch Course to verify ownership
        const courseData = await getCourseById(courseId);
        if (courseData.instructorId !== currentUser.userId) {
          setPageError("Access Denied: You can only view results for assessments in your own courses.");
          setIsLoading(false);
          return;
        }
        setCourse(courseData);

        // 2. Fetch Assessment details
        const assessmentData = await getAssessmentById(assessmentId);
        if (assessmentData.courseId !== courseId) {
          setPageError("Error: This assessment does not belong to the specified course.");
          setIsLoading(false);
          return;
        }
        setAssessment(assessmentData);

        // 3. Fetch Results for this Assessment
        const resultsData = await getResultsForAssessment(assessmentId);
        setResults(resultsData);

      } catch (err) {
        console.error("Failed to fetch data for viewing assessment results:", err);
        setPageError(err.message || "Failed to load data. Please ensure the course and assessment exist and you have permission.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataAndVerify();
  }, [courseId, assessmentId, currentUser, navigate]);


  if (isLoading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading results...</span>
          </div>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {pageError}
          <div className="mt-3">
            <Link to={courseId ? `/courses/${courseId}` : "/courses"} className="btn btn-secondary">
              Back to Course
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment || !course) {
    // This case should ideally be caught by pageError, but as a fallback
    return (
        <div className="container mt-4">
            <div className="alert alert-warning">Necessary data not found.</div>
             <Link to="/courses" className="btn btn-secondary mt-2">Back to Courses</Link>
        </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/courses">Courses</Link></li>
          <li className="breadcrumb-item">
            <Link to={`/courses/${courseId}`}>{course.title || 'Course Details'}</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">Results for: {assessment.title}</li>
        </ol>
      </nav>

      <div className="card shadow-sm">
        <div className="card-header bg-info text-white">
          <h1 className="mb-0 h3">Student Results for "{assessment.title}"</h1>
          <p className="mb-0 small">Course: {course.title} | Max Score: {assessment.maxScore}</p>
        </div>
        <div className="card-body p-0"> {/* p-0 to make table flush with card edges if desired */}
          {results.length === 0 ? (
            <div className="alert alert-light m-3 text-center" role="alert"> {/* Changed to alert-light for less prominence */}
              No results have been submitted for this assessment yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover mb-0">
                <thead className="thead-light">
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Student Name</th>
                    <th scope="col">Score</th>
                    <th scope="col">Percentage</th>
                    <th scope="col">Attempt Date</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={result.resultId}>
                      <th scope="row">{index + 1}</th>
                      <td>{result.userName || 'N/A'}</td>
                      <td>{result.score} / {assessment.maxScore}</td>
                      <td>
                        {assessment.maxScore > 0 
                          ? ((result.score / assessment.maxScore) * 100).toFixed(1) + '%' 
                          : 'N/A'}
                      </td>
                      <td>{new Date(result.attemptDate).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
         <div className="card-footer text-muted">
            Total Submissions: {results.length}
        </div>
      </div>
       <div className="mt-4">
        <Link to={`/courses/${courseId}`} className="btn btn-outline-secondary">
          &laquo; Back to Course Details
        </Link>
      </div>
    </div>
  );
}

export default ViewAssessmentResultsPage;
