// src/pages/StudentPerformancePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllCourses } from '../services/courseService';
import { getAssessmentsForCourse } from '../services/assessmentService';
import { getResultsForAssessment } from '../services/resultService'; // <-- Import result service

function StudentPerformancePage() {
  const { currentUser } = useAuth();

  const [instructorCourses, setInstructorCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  
  const [results, setResults] = useState([]); // <-- State for results

  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false); // <-- State for loading results
  
  const [error, setError] = useState(''); // For general page/course loading errors
  const [assessmentsError, setAssessmentsError] = useState('');
  const [resultsError, setResultsError] = useState(''); // <-- State for results error


  // Fetch courses for the instructor
  useEffect(() => {
    if (currentUser && currentUser.role === 'Instructor') {
      const fetchInstructorCourses = async () => {
        setIsLoadingCourses(true);
        setError('');
        try {
          const allCourses = await getAllCourses();
          const filteredCourses = allCourses.filter(course => course.instructorId === currentUser.userId);
          setInstructorCourses(filteredCourses);
        } catch (err) {
          console.error("Failed to fetch courses for instructor:", err);
          setError(err.message || 'Failed to fetch your courses.');
        } finally {
          setIsLoadingCourses(false);
        }
      };
      fetchInstructorCourses();
    } else {
      setError("Access Denied: This page is for instructors only.");
      setIsLoadingCourses(false);
    }
  }, [currentUser]);

  // Fetch assessments when a course is selected
  useEffect(() => {
    if (selectedCourseId) {
      const fetchAssessments = async () => {
        setIsLoadingAssessments(true);
        setAssessmentsError('');
        setAssessments([]); 
        setSelectedAssessmentId(''); 
        setResults([]); // Clear results when course changes
        setResultsError('');
        try {
          const data = await getAssessmentsForCourse(selectedCourseId);
          setAssessments(data);
        } catch (err) {
          console.error("Failed to fetch assessments:", err);
          setAssessmentsError(err.message || 'Failed to fetch assessments for the selected course.');
        } finally {
          setIsLoadingAssessments(false);
        }
      };
      fetchAssessments();
    } else {
      setAssessments([]); 
      setSelectedAssessmentId('');
      setResults([]);
      setResultsError('');
    }
  }, [selectedCourseId]);

  const handleCourseChange = (event) => {
    const courseId = event.target.value;
    setSelectedCourseId(courseId);
    // Assessments will be fetched by the useEffect above
    // Resetting other dependent states
    setSelectedAssessmentId('');
    setResults([]); 
    setResultsError('');
  };

  const handleAssessmentChange = (event) => {
    setSelectedAssessmentId(event.target.value);
    setResults([]); // Clear previous results when assessment changes
    setResultsError('');
  };

  const handleApplyFilter = async () => {
    if (!selectedAssessmentId) {
      setResultsError("Please select an assessment first.");
      setResults([]);
      return;
    }
    setIsLoadingResults(true);
    setResultsError('');
    setResults([]);
    try {
      const data = await getResultsForAssessment(selectedAssessmentId);
      setResults(data);
    } catch (err) {
      console.error("Failed to fetch results:", err);
      setResultsError(err.message || 'Failed to fetch results for the selected assessment.');
    } finally {
      setIsLoadingResults(false);
    }
  };

  if (isLoadingCourses) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading courses...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) { // General error (e.g., fetching courses or access denied)
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mt-4 mb-5">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Student Performance</li>
        </ol>
      </nav>

      <h1 className="mb-4">View Student Performance</h1>

      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">Filters</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="courseSelect" className="form-label fw-semibold">Select Course</label>
              <select 
                id="courseSelect" 
                className="form-select" 
                value={selectedCourseId} 
                onChange={handleCourseChange}
                disabled={instructorCourses.length === 0 || isLoadingCourses}
              >
                <option value="">-- Select a Course --</option>
                {instructorCourses.map(course => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.title}
                  </option>
                ))}
              </select>
              {instructorCourses.length === 0 && !isLoadingCourses && (
                <div className="form-text text-warning">You have not created any courses yet.</div>
              )}
            </div>

            <div className="col-md-6">
              <label htmlFor="assessmentSelect" className="form-label fw-semibold">Select Quiz/Assessment</label>
              <select 
                id="assessmentSelect" 
                className="form-select" 
                value={selectedAssessmentId} 
                onChange={handleAssessmentChange}
                disabled={!selectedCourseId || isLoadingAssessments || (assessments.length === 0 && !assessmentsError)}
              >
                <option value="">-- Select a Quiz --</option>
                {isLoadingAssessments && <option value="" disabled>Loading assessments...</option>}
                {!isLoadingAssessments && assessments.map(assessment => (
                  <option key={assessment.assessmentId} value={assessment.assessmentId}>
                    {assessment.title}
                  </option>
                ))}
              </select>
              {selectedCourseId && !isLoadingAssessments && assessments.length === 0 && !assessmentsError && (
                <div className="form-text text-info">No assessments found for the selected course.</div>
              )}
              {assessmentsError && <div className="form-text text-danger mt-1">{assessmentsError}</div>}
            </div>
            
            <div className="col-12 text-end mt-3">
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleApplyFilter}
                disabled={!selectedCourseId || !selectedAssessmentId || isLoadingResults}
              >
                {isLoadingResults ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Loading Results...
                  </>
                ) : (
                  'Apply Filter'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section to display results table */}
      <div className="mt-4">
        <h3 className="mb-3">Results</h3>
        {isLoadingResults && (
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-secondary" role="status">
              <span className="visually-hidden">Loading results...</span>
            </div>
          </div>
        )}
        {!isLoadingResults && resultsError && (
          <div className="alert alert-danger" role="alert">
            <strong>Error loading results:</strong> {resultsError}
          </div>
        )}
        {!isLoadingResults && !resultsError && selectedAssessmentId && results.length === 0 && (
          <div className="alert alert-info" role="alert">
            No results submitted for this assessment yet.
          </div>
        )}
        {!isLoadingResults && !resultsError && results.length > 0 && (
          <div className="card shadow-sm">
            <div className="card-body p-0">
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
                        <td>{result.score} / {assessments.find(a=>a.assessmentId === selectedAssessmentId)?.maxScore || 'N/A'}</td>
                        <td>
                          {(() => {
                            const assessmentMaxScore = assessments.find(a=>a.assessmentId === selectedAssessmentId)?.maxScore;
                            if (assessmentMaxScore && assessmentMaxScore > 0) {
                              return ((result.score / assessmentMaxScore) * 100).toFixed(1) + '%';
                            }
                            return 'N/A';
                          })()}
                        </td>
                        <td>{new Date(result.attemptDate).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {!selectedAssessmentId && !isLoadingResults && !resultsError && (
             <p className="text-muted">Please select a course and an assessment, then click "Apply Filter" to view student performance.</p>
        )}
      </div>
    </div>
  );
}

export default StudentPerformancePage;
