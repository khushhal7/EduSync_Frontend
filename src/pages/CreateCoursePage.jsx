// src/pages/CreateCoursePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createCourse } from '../services/courseService';
import { uploadFile } from '../services/fileService';

function CreateCoursePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  // This state will now store the blobName after upload, or be empty
  const [mediaIdentifier, setMediaIdentifier] = useState(''); 
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'Instructor') {
      setPageError("Access Denied: You must be an Instructor to create courses.");
    }
  }, [currentUser]);


  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setPageError('');
    setIsLoading(true);

    if (!title || !description) {
      setError('Title and Description are required.');
      setIsLoading(false);
      return;
    }

    if (!currentUser || currentUser.role !== 'Instructor') {
        setError('Authorization error. Only instructors can create courses.');
        setIsLoading(false);
        return;
    }

    let finalMediaIdentifier = null; // Will store the blobName

    if (selectedFile) {
      try {
        // uploadFile service now returns { url, blobName }
        const uploadResponse = await uploadFile(selectedFile);
        if (uploadResponse && uploadResponse.blobName) {
          finalMediaIdentifier = uploadResponse.blobName; 
          // Optionally, you could also store uploadResponse.url if needed for immediate preview,
          // but finalMediaIdentifier (blobName) is what we save to the DB as MediaUrl.
          console.log('File uploaded. Blob Name:', finalMediaIdentifier, 'Public URL:', uploadResponse.url);
        } else {
          throw new Error("File uploaded, but blobName not returned from API.");
        }
      } catch (uploadError) {
        console.error("File upload error:", uploadError);
        setError(uploadError.message || 'File upload failed. Course not created.');
        setIsLoading(false);
        return;
      }
    }

    const courseData = {
      title,
      description,
      instructorId: currentUser.userId,
      mediaUrl: finalMediaIdentifier, // Send the blobName as mediaUrl
    };

    try {
      const newCourse = await createCourse(courseData);
      console.log('Course created successfully:', newCourse);
      alert(`Course "${newCourse.title}" created successfully!`);
      navigate(`/courses/${newCourse.courseId}`); 
    } catch (courseCreateError) {
      console.error("Create course error:", courseCreateError);
      if (courseCreateError && typeof courseCreateError === 'string') {
        setError(courseCreateError);
      } else if (courseCreateError && courseCreateError.message) {
        setError(courseCreateError.message);
      } else if (courseCreateError && courseCreateError.title) { 
        setError(courseCreateError.title || 'Failed to create course. Please try again.');
      } else {
        setError('Failed to create course. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (pageError) { 
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {pageError}
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
                  <label htmlFor="mediaFileInput" className="form-label fw-semibold">Course Media</label>
                  <input
                    type="file"
                    className="form-control"
                    id="mediaFileInput"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                  {selectedFile && <p className="form-text text-muted mt-1">Selected file: {selectedFile.name}</p>}
                </div>
                
                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                   <Link to="/courses" className="btn btn-outline-secondary me-md-2" type="button" disabled={isLoading}>
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
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
