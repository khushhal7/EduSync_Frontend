// src/pages/CreateAssessmentPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createAssessment } from '../services/assessmentService';
import { getCourseById } from '../services/courseService';

// Helper to generate option values (A, B, C, D...)
const getOptionLetter = (index) => String.fromCharCode(65 + index);

const newOption = (index = 0) => ({ 
  id: Date.now() + Math.random() * 1000, // More unique ID for options
  text: '', 
  value: getOptionLetter(index) // Auto-assign A, B, C...
});

const defaultQuestionStructure = () => ({
  id: Date.now() + Math.random() * 1000, // Unique ID for the question
  questionText: '',
  type: 'multiple-choice',
  options: [newOption(0), newOption(1), newOption(2), newOption(3)], // Start with FOUR options for MC
  correctAnswerValue: '', 
  points: 10,
});


function CreateAssessmentPage() {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([defaultQuestionStructure()]);
  
  const [courseName, setCourseName] = useState('');
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    if (!courseId) {
      setPageError("Course ID is missing."); setIsLoadingCourse(false); return;
    }
    if (!currentUser || currentUser.role !== 'Instructor') {
      setPageError("Access Denied: You must be an Instructor to create assessments."); setIsLoadingCourse(false); return;
    }
    const verifyCourseAndOwnership = async () => {
      setIsLoadingCourse(true);
      try {
        const courseData = await getCourseById(courseId);
        if (courseData.instructorId !== currentUser.userId) {
          setPageError("Access Denied: You can only add assessments to your own courses.");
        } else {
          setCourseName(courseData.title);
        }
      } catch (err) {
        setPageError("Failed to load course details. Ensure the course exists and you have permission.");
      } finally {
        setIsLoadingCourse(false);
      }
    };
    verifyCourseAndOwnership();
  }, [courseId, currentUser, navigate]);

  const handleAddQuestion = () => {
    setQuestions([...questions, defaultQuestionStructure()]);
  };

  const handleRemoveQuestion = (questionIndexToRemove) => {
    setQuestions(questions.filter((_, index) => index !== questionIndexToRemove));
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    const updatedQuestions = questions.map((q, i) => 
      i === questionIndex ? { ...q, [field]: value } : q
    );
    setQuestions(updatedQuestions);
  };
  
  const handleQuestionTypeChange = (questionIndex, newType) => {
    const updatedQuestions = questions.map((q, i) => {
      if (i === questionIndex) {
        const newQ = { ...q, type: newType, options: [], correctAnswerValue: '' }; // Reset options and correct answer
        if (newType === 'multiple-choice') {
          newQ.options = [newOption(0), newOption(1), newOption(2), newOption(3)]; // Default to 4 options
        } else if (newType === 'true-false') {
          newQ.options = [
            { id: Date.now() + Math.random() * 1000 + 1, text: 'True', value: 'true' },
            { id: Date.now() + Math.random() * 1000 + 2, text: 'False', value: 'false' }
          ];
        }
        return newQ;
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  const handleAddOption = (questionIndex) => {
    const updatedQuestions = questions.map((q, i) => {
      if (i === questionIndex && q.type === 'multiple-choice') {
        const options = Array.isArray(q.options) ? q.options : [];
        if (options.length < 6) { // Example: limit to 6 options
            return { ...q, options: [...options, newOption(options.length)] };
        }
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  const handleRemoveOption = (questionIndex, optionIndexToRemove) => {
    const updatedQuestions = questions.map((q, i) => {
      if (i === questionIndex) {
        const newOptions = q.options.filter((_, optIdx) => optIdx !== optionIndexToRemove);
        const revaluedOptions = newOptions.map((opt, idx) => ({ ...opt, value: getOptionLetter(idx)}));
        
        let newCorrectAnswerValue = q.correctAnswerValue;
        if (!revaluedOptions.some(opt => opt.value === q.correctAnswerValue)) {
            newCorrectAnswerValue = revaluedOptions.length > 0 ? revaluedOptions[0].value : '';
        }

        return { ...q, options: revaluedOptions, correctAnswerValue: newCorrectAnswerValue };
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  const handleOptionTextChange = (questionIndex, optionIndex, newText) => {
    const updatedQuestions = questions.map((q, i) => {
      if (i === questionIndex) {
        const updatedOptions = q.options.map((opt, optIdx) => 
          optIdx === optionIndex ? { ...opt, text: newText } : opt
        );
        return { ...q, options: updatedOptions };
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  const calculatedMaxScore = React.useMemo(() => {
    return questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  }, [questions]);


  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); setPageError(''); setIsSubmitting(true);

    if (!title || questions.length === 0) {
      setError('Title and at least one question are required.');
      setIsSubmitting(false); return;
    }

    for (const q of questions) {
      if (!q.questionText.trim()) { setError('All questions must have text.'); setIsSubmitting(false); return; }
      if (q.type === 'multiple-choice' && (!Array.isArray(q.options) || q.options.length < 2)) {
        setError(`Question "${q.questionText || 'Untitled'}" (multiple-choice) must have at least two options.`); setIsSubmitting(false); return;
      }
      if (q.type === 'true-false' && (!Array.isArray(q.options) || q.options.length !== 2)) {
        setError(`Question "${q.questionText || 'Untitled'}" (true/false) must have exactly two options.`); setIsSubmitting(false); return;
      }
      for (const opt of q.options) {
          if(q.type === 'multiple-choice' && !opt.text.trim()){ 
              setError(`All options for multiple-choice question "${q.questionText || 'Untitled'}" must have text.`); setIsSubmitting(false); return;
          }
      }
      if (!q.correctAnswerValue) { 
        setError(`A correct answer must be selected for question "${q.questionText || 'Untitled'}".`); setIsSubmitting(false); return;
      }
      if (isNaN(parseInt(q.points, 10)) || parseInt(q.points, 10) < 0) { // Allow 0 points
        setError(`Points for question "${q.questionText || 'Untitled'}" must be a non-negative number.`); setIsSubmitting(false); return;
      }
    }
    
    const finalMaxScore = calculatedMaxScore;

    const preparedQuestions = questions.map(q => {
        const { id, ...restOfQuestion } = q; 
        const preparedOptions = q.options.map(opt => {
            const { id: optionId, ...restOfOption } = opt; 
            return restOfOption;
        });
        return { ...restOfQuestion, options: preparedOptions };
    });

    const questionsString = JSON.stringify(preparedQuestions);

    const assessmentData = {
      courseId, title, questions: questionsString, maxScore: finalMaxScore,
    };

    try {
      const newAssessment = await createAssessment(assessmentData);
      alert(`Assessment "${newAssessment.title}" (Max Score: ${finalMaxScore}) created successfully for course "${courseName}"!`);
      navigate(`/courses/${courseId}`);
    } catch (err) {
      setIsSubmitting(false); console.error("Create assessment page error:", err);
      if (err && typeof err === 'string') { setError(err);
      } else if (err && err.message) { setError(err.message);
      } else if (err && err.title) { setError(err.title || 'Failed to create assessment.');
      } else { setError('Failed to create assessment. Please try again later.'); }
    } finally {
        setIsSubmitting(false);
    }
  };
  
  if (isLoadingCourse) { return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>; }
  if (pageError) { return <div className="container mt-4"><div className="alert alert-danger">{pageError}<div className="mt-3"><Link to={courseId ? `/courses/${courseId}` : "/courses"} className="btn btn-secondary">Back</Link></div></div></div>; }

  return (
    <div className="container mt-4 mb-5"> {/* This is the main page container */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/courses">Courses</Link></li>
          <li className="breadcrumb-item">
            <Link to={`/courses/${courseId}`}>{courseName || 'Course Details'}</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">Create New Assessment</li>
        </ol>
      </nav>

      <div className="row justify-content-center">
        {/* Changed col-xl-8 to col-xl-10 to make the form card wider on extra large screens */}
        {/* You can even use col-lg-12 if you want it to take full width of the container on large screens */}
        <div className="col-lg-12 col-xl-10"> 
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h1 className="mb-0 h3">Create New Assessment for "{courseName}"</h1>
            </div>
            <div className="card-body p-4">
              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="titleInput" className="form-label fw-semibold">Assessment Title</label>
                    <input
                        type="text" className="form-control" id="titleInput"
                        placeholder="e.g., Chapter 1 Quiz" value={title}
                        onChange={(e) => setTitle(e.target.value)} disabled={isSubmitting} required 
                    />
                </div>
                <div className="mb-4"> 
                    <span className="form-label fw-semibold">Calculated Max Score: </span>
                    <span className="badge bg-info fs-5 p-2">{calculatedMaxScore}</span> 
                </div>
                <hr />

                <h4 className="mb-3">Questions</h4>
                {questions.map((question, questionIndex) => (
                  <div 
                    key={question.id} 
                    className="card mb-4 p-3 bg-white border" // Changed background to white for better contrast
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3"> 
                      <h5 className="mb-0">Question {questionIndex + 1}</h5>
                      <button 
                        type="button" className="btn btn-sm btn-danger d-flex align-items-center" 
                        onClick={() => handleRemoveQuestion(questionIndex)}
                        disabled={isSubmitting || questions.length <= 1}
                        title="Remove Question"
                      >
                        <i className="bi bi-trash-fill me-1"></i> 
                        Remove
                      </button>
                    </div>

                    <div className="mb-3">
                      <label htmlFor={`questionText-${question.id}`} className="form-label fw-semibold">Question Text</label>
                      <textarea
                        className="form-control" id={`questionText-${question.id}`} rows="3" 
                        placeholder="Enter question text" value={question.questionText}
                        onChange={(e) => handleQuestionChange(questionIndex, 'questionText', e.target.value)}
                        disabled={isSubmitting} required
                      />
                    </div>

                    <div className="row g-3 align-items-center"> 
                        <div className="col-md-7 mb-3">
                            <label htmlFor={`questionType-${question.id}`} className="form-label fw-semibold">Type</label>
                            <select 
                                className="form-select" id={`questionType-${question.id}`}
                                value={question.type} 
                                onChange={(e) => handleQuestionTypeChange(questionIndex, e.target.value)}
                                disabled={isSubmitting}
                            >
                                <option value="multiple-choice">Multiple Choice</option>
                                <option value="true-false">True/False</option>
                            </select>
                        </div>
                        <div className="col-md-5 mb-3">
                            <label htmlFor={`questionPoints-${question.id}`} className="form-label fw-semibold">Points</label>
                            <input 
                                type="number" className="form-control" id={`questionPoints-${question.id}`}
                                value={question.points} min="0" 
                                onChange={(e) => handleQuestionChange(questionIndex, 'points', parseInt(e.target.value, 10) || 0)}
                                disabled={isSubmitting} required
                            />
                        </div>
                    </div>

                    {(question.type === 'multiple-choice' || question.type === 'true-false') && (
                      <div className="mb-1 mt-2 p-3 border rounded bg-light"> {/* Options in a lighter box for contrast */}
                        <label className="form-label d-block mb-2 fw-semibold">Options & Correct Answer:</label>
                        {Array.isArray(question.options) && question.options.map((option, optionIndex) => (
                          <div 
                            key={option.id} 
                            className={`input-group mb-2 p-2 rounded ${question.correctAnswerValue === option.value ? 'bg-success-subtle text-success-emphasis border border-2 border-success shadow-sm' : 'border'}`}
                          >
                            <div className="input-group-text bg-transparent border-0 me-2">
                              <input 
                                className="form-check-input fs-5 mt-0" type="radio" 
                                name={`correctAnswer-${question.id}`} value={option.value}
                                checked={question.correctAnswerValue === option.value}
                                onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswerValue', e.target.value)}
                                disabled={isSubmitting}
                                aria-label={`Mark option ${option.value} as correct for question ${questionIndex + 1}`}
                              />
                            </div>
                            <input 
                              type="text" className="form-control" placeholder={`Option ${option.value} Text`}
                              value={option.text}
                              onChange={(e) => handleOptionTextChange(questionIndex, optionIndex, e.target.value)}
                              disabled={isSubmitting || question.type === 'true-false'}
                              required={question.type === 'multiple-choice'}
                            />
                            {question.type === 'multiple-choice' && (
                              <button 
                                type="button" 
                                className="btn btn-link text-danger p-0 ms-2 d-flex align-items-center" // More minimal button
                                onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                                disabled={isSubmitting || question.options.length <= 2}
                                title="Remove Option"
                                style={{ textDecoration: 'none' }} // Remove underline from btn-link
                              >
                                <i className="bi bi-x-square-fill" style={{ fontSize: '1.4rem' }}></i> {/* Changed to filled square x, larger */}
                              </button>
                            )}
                          </div>
                        ))}
                        {question.type === 'multiple-choice' && (
                          <button 
                            type="button" className="btn btn-sm btn-outline-secondary mt-2"
                            onClick={() => handleAddOption(questionIndex)}
                            disabled={isSubmitting || (question.options && question.options.length >= 6)} 
                          >
                            <i className="bi bi-plus-circle me-1"></i> Add Option
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                <button 
                  type="button" className="btn btn-outline-primary mb-3 mt-3" 
                  onClick={handleAddQuestion} disabled={isSubmitting}
                >
                  <i className="bi bi-plus-lg me-1"></i> Add Another Question
                </button>
                <hr />
                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                   <Link to={`/courses/${courseId}`} className="btn btn-outline-secondary me-md-2" type="button" disabled={isSubmitting}>
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-success btn-lg" disabled={isSubmitting}> 
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating Assessment...
                      </>
                    ) : (
                      'Create Assessment'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateAssessmentPage;
