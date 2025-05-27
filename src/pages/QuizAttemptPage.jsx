// src/pages/QuizAttemptPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { getAssessmentById } from '../services/assessmentService';
import { submitResult } from '../services/resultService'; // <-- Import submitResult
import { useAuth } from '../contexts/AuthContext';    // <-- Import useAuth

function QuizAttemptPage() {
  const { assessmentId } = useParams();
  const { currentUser } = useAuth(); // Get the logged-in user
  const navigate = useNavigate();    // For navigation after submission

  const [assessment, setAssessment] = useState(null);
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // General loading for assessment fetch
  const [error, setError] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});

  // State for submission process
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(null);


  useEffect(() => {
    const fetchAssessment = async () => {
      if (!assessmentId) {
        setError("Assessment ID is missing.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      setSubmissionError(null); // Reset submission error on new load
      setQuizSubmitted(false);  // Reset submission state
      setFinalScore(null);      // Reset final score

      try {
        const data = await getAssessmentById(assessmentId);
        setAssessment(data);
        if (data && data.questions) {
          try {
            const questions = JSON.parse(data.questions);
            setParsedQuestions(questions);
            const initialAnswers = {};
            questions.forEach((q, index) => {
              const questionIdentifier = q.id || `question-${index}`;
              initialAnswers[questionIdentifier] = null;
            });
            setUserAnswers(initialAnswers);
          } catch (parseError) {
            console.error("Failed to parse questions JSON:", parseError);
            setError("Failed to load questions: Invalid format.");
            setParsedQuestions([]);
          }
        } else {
          setParsedQuestions([]);
        }
      } catch (err) {
        console.error(`Failed to fetch assessment ${assessmentId}:`, err);
        setError(err.message || `Failed to fetch assessment. Please try again.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId]);

  const handleAnswerChange = (questionIdentifier, selectedValue) => {
    if (quizSubmitted) return; // Don't allow changes after submission
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionIdentifier]: selectedValue,
    }));
  };

  const handleSubmitQuiz = async (event) => {
    event.preventDefault();
    if (!currentUser) {
      setSubmissionError("You must be logged in to submit an assessment.");
      return;
    }
    if (Object.values(userAnswers).some(answer => answer === null)) {
        setSubmissionError("Please answer all questions before submitting.");
        return;
    }


    setIsSubmitting(true);
    setSubmissionError(null);

    let calculatedScore = 0;
    parsedQuestions.forEach((question, index) => {
      const questionIdentifier = question.id || `question-${index}`;
      if (userAnswers[questionIdentifier] === question.correctAnswerValue) {
        calculatedScore += (question.points || 0); // Add points if defined, else 0
      }
    });

    setFinalScore(calculatedScore); // Set final score for display

    const resultData = {
      assessmentId: assessmentId,
      userId: currentUser.userId, // Get userId from AuthContext
      score: calculatedScore,
    };

    try {
      const submittedResult = await submitResult(resultData);
      console.log("Result submitted successfully:", submittedResult);
      setQuizSubmitted(true); // Mark quiz as submitted
      // Optionally, navigate away or show a success message/summary
      // navigate(`/courses/${assessment?.courseId}`); // Example: back to course detail
    } catch (err) {
      console.error("Failed to submit result:", err);
      setSubmissionError(err.message || "Failed to submit your answers. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading assessment...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <strong>Error:</strong> {error}
        <div className="mt-2">
          {assessment && assessment.courseId && (
             <Link to={`/courses/${assessment.courseId}`} className="btn btn-sm btn-secondary me-2">Back to Course</Link>
          )}
          <Link to="/courses" className="btn btn-sm btn-info">Back to All Courses</Link>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="alert alert-warning" role="alert">
        Assessment not found.
         <div className="mt-2">
          <Link to="/courses" className="btn btn-sm btn-secondary">Back to Courses</Link>
        </div>
      </div>
    );
  }

  if (quizSubmitted) {
    return (
        <div className="container mt-4 text-center">
            <div className="alert alert-success">
                <h2>Quiz Submitted!</h2>
                <p className="fs-4">Your score: <strong>{finalScore} / {assessment.maxScore}</strong></p>
            </div>
            <Link to={`/courses/${assessment.courseId}`} className="btn btn-primary me-2">Back to Course Details</Link>
            <Link to="/courses" className="btn btn-secondary">View Other Courses</Link>
        </div>
    );
  }


  return (
    <div className="container mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/courses">Courses</Link></li>
          {assessment.courseId && (
             <li className="breadcrumb-item"><Link to={`/courses/${assessment.courseId}`}>Course Details</Link></li>
          )}
          <li className="breadcrumb-item active" aria-current="page">{assessment.title}</li>
        </ol>
      </nav>

      <h1 className="mb-3">{assessment.title}</h1>
      <p className="lead">Max Score: {assessment.maxScore}</p>
      <hr />

      {parsedQuestions.length > 0 ? (
        <form onSubmit={handleSubmitQuiz}> {/* Attach handleSubmitQuiz */}
          {submissionError && <div className="alert alert-danger" role="alert">{submissionError}</div>}
          {parsedQuestions.map((question, index) => {
            const questionIdentifier = question.id || `question-${index}`;
            return (
              <div key={questionIdentifier} className="card mb-4 shadow-sm">
                <div className="card-header">
                  <h5 className="mb-0">Question {index + 1}</h5>
                </div>
                <div className="card-body">
                  <p className="card-text fs-5">{question.questionText}</p>
                  {question.type === 'multiple-choice' && question.options && (
                    <div className="ms-3">
                      {question.options.map((option, optIndex) => {
                        const optionIdentifier = `q${questionIdentifier}_opt${optIndex}`;
                        return (
                          <div className="form-check mb-2" key={option.value || optIndex}>
                            <input
                              className="form-check-input"
                              type="radio"
                              name={`question_${questionIdentifier}`}
                              id={optionIdentifier}
                              value={option.value}
                              checked={userAnswers[questionIdentifier] === option.value}
                              onChange={() => handleAnswerChange(questionIdentifier, option.value)}
                              disabled={isSubmitting} // Disable inputs during submission
                            />
                            <label className="form-check-label" htmlFor={optionIdentifier}>
                              {option.text}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {question.type === 'true-false' && question.options && (
                     <div className="ms-3">
                      {question.options.map((option, optIndex) => {
                        const optionIdentifier = `q${questionIdentifier}_opt${optIndex}`;
                        return (
                          <div className="form-check form-check-inline mb-2" key={option.value || optIndex}>
                            <input
                              className="form-check-input"
                              type="radio"
                              name={`question_${questionIdentifier}`}
                              id={optionIdentifier}
                              value={option.value}
                              checked={userAnswers[questionIdentifier] === option.value}
                              onChange={() => handleAnswerChange(questionIdentifier, option.value)}
                              disabled={isSubmitting} // Disable inputs during submission
                            />
                            <label className="form-check-label" htmlFor={optionIdentifier}>
                              {option.text}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <p className="mt-2 mb-0"><small className="text-muted">Points: {question.points || 'N/A'}</small></p>
                </div>
              </div>
            );
          })}
          <div className="mt-4 mb-5">
            <button type="submit" className="btn btn-success btn-lg" disabled={isSubmitting || isLoading}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                'Submit Answers'
              )}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-muted">This assessment currently has no questions.</p>
      )}
    </div>
  );
}

export default QuizAttemptPage;
