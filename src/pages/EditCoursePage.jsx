// src/pages/EditCoursePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCourseById, updateCourse } from '../services/courseService'; // Ensure this path is correct

function EditCoursePage() {
  const { courseId } = useParams(); // Get courseId from URL parameters
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [originalInstructorId, setOriginalInstructorId] = useState(null); // To store the original instructor ID

  const [isLoading, setIsLoading] = useState(true); // For fetching initial course data
  const [isUpdating, setIsUpdating] = useState(false); // For the update process
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) {
        setFetchError("Course ID is missing.");
        setIsLoading(false);
        return;
      }
      if (!currentUser) {
        setFetchError("You must be logged in to edit a course.");
        setIsLoading(false);
        navigate('/login', { state: { from: location } }); // Redirect to login
        return;
      }

      setIsLoading(true);
      setFetchError('');
      try {
        const courseData = await getCourseById(courseId);
        if (courseData.instructorId !== currentUser.userId || currentUser.role !== 'Instructor') {
          setFetchError('Access Denied: You are not authorized to edit this course.');
          // Optionally redirect to courses page or show a more prominent error
          // navigate('/courses');
        } else {
          setTitle(courseData.title);
          setDescription(courseData.description);
          setMediaUrl(courseData.mediaUrl || '');
          setOriginalInstructorId(courseData.instructorId); // Store original instructorId
        }
      } catch (err) {
        console.error("Failed to fetch course for editing:", err);
        setFetchError(err.message || 'Failed to load course data for editing.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, currentUser, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsUpdating(true);

    if (!title || !description) {
      setError('Title and Description are required.');
      setIsUpdating(false);
      return;
    }

    // Ensure the current user is still the original instructor and has the Instructor role
    if (!currentUser || currentUser.role !== 'Instructor' || currentUser.userId !== originalInstructorId) {
      setError('Authorization error: You cannot update this course.');
      setIsUpdating(false);
      return;
    }

    const updatedCourseData = {
      title,
      description,
      instructorId: originalInstructorId, // Keep the original instructorId, or decide if it can be changed
      mediaUrl: mediaUrl || null,
    };

    try {
      await updateCourse(courseId, updatedCourseData);
      setIsUpdating(false);
      alert(`Course "${title}" updated successfully!`);
      navigate(`/courses/${courseId}`); // Navigate back to the course detail page
    } catch (err) {
      setIsUpdating(false);
      console.error("Edit course page error:", err);
      if (err && typeof err === 'string') {
        setError(err);
      } else if (err && err.message) {
        setError(err.message);
      } else if (err && err.title) {
        setError(err.title || 'Failed to update course. Please try again.');
      } else {
        setError('Failed to update course. Please try again later.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading course data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {fetchError}
          <div className="mt-3">
            <Link to="/courses" className="btn btn-secondary">Back to Courses</Link>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="container mt-4 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">
          <div className="card shadow-sm">
            <div className="card-header bg-secondary text-white"> {/* Changed color for edit */}
              <h1 className="mb-0 h3">Edit Course</h1>
            </div>
            <div className="card-body p-4">
              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="titleInput" className="form-label fw-semibold">Course Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="titleInput"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isUpdating}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="descriptionInput" className="form-label fw-semibold">Course Description</label>
                  <textarea
                    className="form-control"
                    id="descriptionInput"
                    rows="5"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isUpdating}
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="mediaUrlInput" className="form-label fw-semibold">Media URL (Optional)</label>
                  <input
                    type="url"
                    className="form-control"
                    id="mediaUrlInput"
                    placeholder="e.g., https://example.com/course-video.mp4"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    disabled={isUpdating}
                  />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">Instructor</label>
                    <input
                        type="text"
                        className="form-control"
                        value={currentUser?.name || 'Loading...'} // Display current user's name
                        disabled // Instructor ID is not changed via this form
                    />
                    <div className="form-text">
                        Course instructor cannot be changed through this form.
                    </div>
                </div>


                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                  <Link to={courseId ? `/courses/${courseId}` : "/courses"} className="btn btn-outline-secondary me-md-2" type="button" disabled={isUpdating}>
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-success" disabled={isUpdating}> {/* Changed to success color */}
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

export default EditCoursePage;
