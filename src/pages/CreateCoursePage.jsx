// src/pages/CreateCoursePage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createCourse } from '../services/courseService'; // Ensure this path is correct

function CreateCoursePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    if (!title || !description) {
      setError('Title and Description are required.');
      setIsLoading(false);
      return;
    }

    if (!currentUser || currentUser.role !== 'Instructor') {
      setError('You must be logged in as an Instructor to create a course.');
      setIsLoading(false);
      // Optionally redirect to login or show a more prominent error
      // navigate('/login');
      return;
    }

    const courseData = {
      title,
      description,
      instructorId: currentUser.userId, // Automatically use the logged-in instructor's ID
      mediaUrl: mediaUrl || null, // Send null if mediaUrl is empty
    };

    try {
      const newCourse = await createCourse(courseData);
      console.log('Course created successfully:', newCourse);
      setIsLoading(false);
      alert(`Course "${newCourse.title}" created successfully!`);
      // Navigate to the new course's detail page or the courses list
      navigate(`/courses/${newCourse.courseId}`); 
      // Or navigate('/courses'); 
    } catch (err) {
      setIsLoading(false);
      console.error("Create course page error:", err);
      if (err && typeof err === 'string') {
        setError(err);
      } else if (err && err.message) {
        setError(err.message);
      } else if (err && err.title) { 
        setError(err.title || 'Failed to create course. Please try again.');
      } else {
        setError('Failed to create course. Please try again later.');
      }
    }
  };

  // If user is not an instructor, ideally this page shouldn't even be reachable.
  // This is an additional check. Route protection should handle primary access control.
  if (!currentUser || currentUser.role !== 'Instructor') {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          Access Denied: Only instructors can create courses. Please <Link to="/login">login</Link> as an instructor.
        </div>
      </div>
    );
  }


  return (
    <div className="container mt-4 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h1 className="mb-0 h3">Create New Course</h1>
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
                    placeholder="e.g., Introduction to Web Development"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                    required 
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="descriptionInput" className="form-label fw-semibold">Course Description</label>
                  <textarea
                    className="form-control"
                    id="descriptionInput"
                    rows="5"
                    placeholder="Provide a detailed description of your course..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading}
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="mediaUrlInput" className="form-label fw-semibold">Media URL (Optional)</label>
                  <input
                    type="url"
                    className="form-control"
                    id="mediaUrlInput"
                    placeholder="e.g., https://example.com/course-video.mp4 or image URL"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    disabled={isLoading}
                  />
                  <div className="form-text">
                    Link to a primary video, image, or other media for the course.
                  </div>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                   <Link to="/courses" className="btn btn-outline-secondary me-md-2" type="button" disabled={isLoading}>
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating Course...
                      </>
                    ) : (
                      'Create Course'
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

export default CreateCoursePage;
