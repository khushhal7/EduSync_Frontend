// src/pages/EditAssessmentPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAssessmentById, updateAssessment } from '../services/assessmentService';
import { getCourseById } from '../services/courseService'; // To verify course ownership

// Helper to generate option values (A, B, C, D...)
const getOptionLetter = (index) => String.fromCharCode(65 + index);

const newOption = (index = 0) => ({ 
  id: Date.now() + Math.random() * 1000,
  text: '', 
  value: getOptionLetter(index)
});

function EditAssessmentPage() {
  const { courseId, assessmentId } = useParams(); // Assuming assessmentId is in URL, and courseId for context/auth
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([]); // Array of question objects
  // MaxScore will be calculated from question points
  
  const [courseName, setCourseName] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Combined loading for initial data
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(''); // For form submission errors
  const [pageError, setPageError] = useState(''); // For initial load/auth errors

  // Fetch course and assessment data, and verify ownership
  useEffect(() => {
    if (!courseId || !assessmentId) {
      setPageError("Course ID or Assessment ID is missing.");
      setIsLoading(false);
      return;
    }
    if (!currentUser || currentUser.role !== 'Instructor') {
      setPageError("Access Denied: You must be an Instructor to edit assessments.");
      setIsLoading(false);
      return;
    }

    const loadDataAndVerifyOwnership = async () => {
      setIsLoading(true);
      try {
        const courseData = await getCourseById(courseId);
        if (courseData.instructorId !== currentUser.userId) {
          setPageError("Access Denied: You can only edit assessments for your own courses.");
          setIsLoading(false);
          return;
        }
        setCourseName(courseData.title);

        const assessmentData = await getAssessmentById(assessmentId);
        if (assessmentData.courseId !== courseId) { // Additional check
            setPageError("Error: Assessment does not belong to this course.");
            setIsLoading(false);
            return;
        }
        setTitle(assessmentData.title);
        // setMaxScore(assessmentData.maxScore); // Max score will be calculated
        try {
            const parsedQs = JSON.parse(assessmentData.questions);
            // Ensure each option has a unique client-side ID if not present from backend
            const questionsWithOptionIds = parsedQs.map(q => ({
                ...q,
                id: q.id || Date.now() + Math.random() * 1000, // Ensure question has an ID
                options: Array.isArray(q.options) ? q.options.map(opt => ({
                    ...opt,
                    id: opt.id || Date.now() + Math.random() * 1000 // Ensure option has an ID
                })) : []
            }));
            setQuestions(questionsWithOptionIds);
        } catch (e) {
            console.error("Failed to parse questions JSON for editing:", e);
            setPageError("Failed to load questions: Invalid format from server.");
            setQuestions([]);
        }

      } catch (err) {
        console.error("Failed to fetch data for assessment editing:", err);
        setPageError("Failed to load data. Ensure the course and assessment exist and you have permission.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDataAndVerifyOwnership();
  }, [courseId, assessmentId, currentUser, navigate]);


  const calculatedMaxScore = React.useMemo(() => {
    return questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  }, [questions]);

  // --- Question and Option Management Functions (similar to CreateAssessmentPage) ---
  const handleAddQuestion = () => {
    const newQ = {
        id: Date.now() + Math.random() * 1000, questionText: '', type: 'multiple-choice',
        options: [newOption(0), newOption(1), newOption(2), newOption(3)], 
        correctAnswerValue: '', points: 10,
    };
    setQuestions([...questions, newQ]);
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
        const newQ = { ...q, type: newType, options: [], correctAnswerValue: '' };
        if (newType === 'multiple-choice') {
          newQ.options = [newOption(0), newOption(1), newOption(2), newOption(3)];
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
        if (options.length < 6) {
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
  // --- End Question and Option Management ---


  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); setPageError(''); setIsUpdating(true);

    if (!title || questions.length === 0) {
      setError('Title and at least one question are required.');
      setIsUpdating(false); return;
    }
    // --- Enhanced Validation (same as CreateAssessmentPage) ---
    for (const q of questions) { /* ... validation logic ... */ 
        if (!q.questionText.trim()) { setError('All questions must have text.'); setIsUpdating(false); return; }
        if (q.type === 'multiple-choice' && (!Array.isArray(q.options) || q.options.length < 2)) {
            setError(`Question "${q.questionText || 'Untitled'}" (multiple-choice) must have at least two options.`); setIsUpdating(false); return;
        }
        if (q.type === 'true-false' && (!Array.isArray(q.options) || q.options.length !== 2)) {
            setError(`Question "${q.questionText || 'Untitled'}" (true/false) must have exactly two options.`); setIsUpdating(false); return;
        }
        for (const opt of q.options) {
            if(q.type === 'multiple-choice' && !opt.text.trim()){ 
                setError(`All options for multiple-choice question "${q.questionText || 'Untitled'}" must have text.`); setIsUpdating(false); return;
            }
        }
        if (!q.correctAnswerValue) { 
            setError(`A correct answer must be selected for question "${q.questionText || 'Untitled'}".`); setIsUpdating(false); return;
        }
        if (isNaN(parseInt(q.points, 10)) || parseInt(q.points, 10) < 0) {
            setError(`Points for question "${q.questionText || 'Untitled'}" must be a non-negative number.`); setIsUpdating(false); return;
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

    // For update, we only send title, questions, and maxScore as per AssessmentForUpdateDto
    const assessmentUpdateData = {
      title,
      questions: questionsString,
      maxScore: finalMaxScore,
    };

    try {
      await updateAssessment(assessmentId, assessmentUpdateData);
      setIsUpdating(false);
      alert(`Assessment "${title}" updated successfully!`);
      navigate(`/courses/${courseId}`); // Navigate back to the course detail page
    } catch (err) {
      setIsUpdating(false); console.error("Edit assessment page error:", err);
      if (err && typeof err === 'string') { setError(err);
      } else if (err && err.message) { setError(err.message);
      } else if (err && err.title) { setError(err.title || 'Failed to update assessment.');
      } else { setError('Failed to update assessment. Please try again later.'); }
    }
  };
  
  if (isLoading) { return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>; }
  if (pageError) { return <div className="container mt-4"><div className="alert alert-danger">{pageError}<div className="mt-3"><Link to={courseId ? `/courses/${courseId}` : "/courses"} className="btn btn-secondary">Back</Link></div></div></div>; }

  return (
    <div className="container mt-4 mb-5">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/courses">Courses</Link></li>
          <li className="breadcrumb-item">
            <Link to={`/courses/${courseId}`}>{courseName || 'Course Details'}</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">Edit Assessment: {title || "Loading..."}</li>
        </ol>
      </nav>

      <div className="row justify-content-center">
        <div className="col-lg-10 col-xl-8">
          <div className="card shadow-sm">
            <div className="card-header bg-warning text-dark"> {/* Changed color for edit */}
              <h1 className="mb-0 h3">Edit Assessment for "{courseName}"</h1>
            </div>
            <div className="card-body p-4">
              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="titleInput" className="form-label fw-semibold">Assessment Title</label>
                    <input
                        type="text" className="form-control" id="titleInput"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)} disabled={isUpdating} required 
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
                    className="card mb-4 p-3 bg-white border" 
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3"> 
                      <h5 className="mb-0">Question {questionIndex + 1}</h5>
                      <button 
                        type="button" className="btn btn-sm btn-danger d-flex align-items-center" 
                        onClick={() => handleRemoveQuestion(questionIndex)}
                        disabled={isUpdating || questions.length <= 1}
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
                        disabled={isUpdating} required
                      />
                    </div>

                    <div className="row g-3 align-items-center"> 
                        <div className="col-md-7 mb-3">
                            <label htmlFor={`questionType-${question.id}`} className="form-label fw-semibold">Type</label>
                            <select 
                                className="form-select" id={`questionType-${question.id}`}
                                value={question.type} 
                                onChange={(e) => handleQuestionTypeChange(questionIndex, e.target.value)}
                                disabled={isUpdating}
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
                                disabled={isUpdating} required
                            />
                        </div>
                    </div>

                    {(question.type === 'multiple-choice' || question.type === 'true-false') && (
                      <div className="mb-1 mt-2 p-3 border rounded bg-light"> 
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
                                disabled={isUpdating}
                                aria-label={`Mark option ${option.value} as correct for question ${questionIndex + 1}`}
                              />
                            </div>
                            <input 
                              type="text" className="form-control" placeholder={`Option ${option.value} Text`}
                              value={option.text}
                              onChange={(e) => handleOptionTextChange(questionIndex, optionIndex, e.target.value)}
                              disabled={isUpdating || question.type === 'true-false'}
                              required={question.type === 'multiple-choice'}
                            />
                            {question.type === 'multiple-choice' && (
                              <button 
                                type="button" 
                                className="btn btn-link text-danger p-0 ms-2 d-flex align-items-center"
                                onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                                disabled={isUpdating || question.options.length <= 2}
                                title="Remove Option"
                                style={{ textDecoration: 'none' }} 
                              >
                                <i className="bi bi-x-square-fill" style={{ fontSize: '1.4rem' }}></i>
                              </button>
                            )}
                          </div>
                        ))}
                        {question.type === 'multiple-choice' && (
                          <button 
                            type="button" className="btn btn-sm btn-outline-secondary mt-2"
                            onClick={() => handleAddOption(questionIndex)}
                            disabled={isUpdating || (question.options && question.options.length >= 6)} 
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
                  onClick={handleAddQuestion} disabled={isUpdating}
                >
                  <i className="bi bi-plus-lg me-1"></i> Add Another Question
                </button>
                <hr />
                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                   <Link to={`/courses/${courseId}`} className="btn btn-outline-secondary me-md-2" type="button" disabled={isUpdating}>
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-warning" disabled={isUpdating}> {/* Changed to warning color for save */}
                    {isUpdating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving Changes...
                      </>
                    ) : (
                      'Save Changes'
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

export default EditAssessmentPage;
