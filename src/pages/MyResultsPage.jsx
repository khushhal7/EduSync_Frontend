// src/pages/MyResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getResultsForUser } from '../services/resultService'; // Ensure this path is correct

function MyResultsPage() {
  const { currentUser } = useAuth();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser && currentUser.userId) {
      const fetchResults = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await getResultsForUser(currentUser.userId);
          setResults(data);
        } catch (err) {
          console.error("Failed to fetch user results:", err);
          setError(err.message || 'Failed to fetch your results. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchResults();
    } else {
      // Should not happen if this is a protected route, but good for safety
      setError("You must be logged in to view your results.");
      setIsLoading(false);
    }
  }, [currentUser]); // Re-fetch if currentUser changes (e.g., on login/logout, though usually navigated away)

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading your results...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">My Assessment Results</h1>
      {results.length === 0 ? (
        <div className="alert alert-info" role="alert">
          You have not attempted any assessments yet.
        </div>
      ) : (
        <div className="list-group shadow-sm">
          {results.map(result => (
            <div key={result.resultId} className="list-group-item list-group-item-action flex-column align-items-start mb-2 border rounded">
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">{result.assessmentTitle || 'N/A'}</h5>
                <small className="text-muted">
                  Attempted: {new Date(result.attemptDate).toLocaleDateString()}
                </small>
              </div>
              <p className="mb-1">
                Your Score: <strong className="text-primary">{result.score}</strong>
                {/* We might need to fetch assessment.maxScore if not already in result DTO */}
                {/* / {result.assessmentMaxScore || 'N/A'} */}
              </p>
              <small className="text-muted">Result ID: {result.resultId}</small>
              <div className="mt-2">
                <Link 
                  to={`/assessment/${result.assessmentId}/attempt`} 
                  className="btn btn-sm btn-outline-secondary me-2"
                  title="This would typically go to a review page or re-attempt if allowed"
                >
                  View Assessment
                </Link>
                {/* Link to the course this assessment belongs to, if courseId is available in result.assessment or similar */}
                {/* <Link to={`/courses/${result.assessment?.courseId}`} className="btn btn-sm btn-outline-info">View Course</Link> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyResultsPage;
