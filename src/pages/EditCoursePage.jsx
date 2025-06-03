// src/pages/EditCoursePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCourseById, updateCourse } from '../services/courseService';
import { uploadFile } from '../services/fileService'; // <-- Import file upload service

function EditCoursePage() {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currentMediaUrl, setCurrentMediaUrl] = useState(''); // To display the current media URL
  const [selectedFile, setSelectedFile] = useState(null);   // State for the new file to upload
  
  const [originalInstructorId, setOriginalInstructorId] = useState(null);

  const [isLoading, setIsLoading] = useState(true); 
  const [isUpdating, setIsUpdating] = useState(false); 
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) {
        setFetchError("Course ID is missing."); setIsLoading(false); return;
      }
      if (!currentUser) {
        setFetchError("You must be logged in to edit a course."); setIsLoading(false);
        navigate('/login', { state: { from: location } }); return;
      }

      setIsLoading(true); setFetchError('');
      try {
        const courseData = await getCourseById(courseId);
        if (courseData.instructorId !== currentUser.userId || currentUser.role !== 'Instructor') {
          setFetchError('Access Denied: You are not authorized to edit this course.');
        } else {
          setTitle(courseData.title);
          setDescription(courseData.description);
          setCurrentMediaUrl(courseData.mediaUrl || ''); // Initialize with current media URL
          setOriginalInstructorId(courseData.instructorId);
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

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleRemoveMedia = () => {
    setSelectedFile(null); // Clear any newly selected file
    setCurrentMediaUrl(''); // Clear the current media URL state for submission
    // If the file input has a value, you might need to reset it programmatically
    // For example, by giving the file input a key that changes, or using event.target.value = null
    const fileInput = document.getElementById('mediaFileInput');
    if(fileInput) fileInput.value = null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); setIsUpdating(true);

    if (!title || !description) {
      setError('Title and Description are required.'); setIsUpdating(false); return;
    }
    if (!currentUser || currentUser.role !== 'Instructor' || currentUser.userId !== originalInstructorId) {
      setError('Authorization error: You cannot update this course.'); setIsUpdating(false); return;
    }

    let finalMediaUrl = currentMediaUrl; // Start with the existing URL

    // Step 1: Upload the new file if one is selected
    if (selectedFile) {
      try {
        const uploadResponse = await uploadFile(selectedFile);
        finalMediaUrl = uploadResponse.url; // Use the new URL
      } catch (uploadError) {
        console.error("File upload error:", uploadError);
        setError(uploadError.message || 'New file upload failed. Course not updated.');
        setIsUpdating(false);
        return;
      }
    }
    // If currentMediaUrl was cleared by handleRemoveMedia and no new file selected, finalMediaUrl will be ''

    // Step 2: Update the course with the (potentially new or cleared) mediaUrl
    const updatedCourseData = {
      title,
      description,
      instructorId: originalInstructorId, 
      mediaUrl: finalMediaUrl || null, // Send null if empty string
    };

    try {
      await updateCourse(courseId, updatedCourseData);
      setIsUpdating(false);
      alert(`Course "${title}" updated successfully!`);
      navigate(`/courses/${courseId}`); 
    } catch (courseUpdateError) {
      setIsUpdating(false); console.error("Edit course page error:", courseUpdateError);
      if (courseUpdateError && typeof courseUpdateError === 'string') { setError(courseUpdateError);
      } else if (courseUpdateError && courseUpdateError.message) { setError(courseUpdateError.message);
      } else if (courseUpdateError && courseUpdateError.title) { setError(courseUpdateError.title || 'Failed to update course.');
      } else { setError('Failed to update course. Please try again later.'); }
    }
  };

  if (isLoading) { /* ... Loading spinner JSX ... */ 
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
  if (fetchError) { /* ... Fetch error JSX ... */ 
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
            <div className="card-header bg-warning text-dark">
              <h1 className="mb-0 h3">Edit Course</h1>
            </div>
            <div className="card-body p-4">
              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              <form onSubmit={handleSubmit}>
                {/* Title and Description inputs remain the same */}
                <div className="mb-3">
                  <label htmlFor="titleInput" className="form-label fw-semibold">Course Title</label>
                  <input type="text" className="form-control" id="titleInput" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isUpdating} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="descriptionInput" className="form-label fw-semibold">Course Description</label>
                  <textarea className="form-control" id="descriptionInput" rows="5" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isUpdating} required ></textarea>
                </div>

                {/* Media File Section */}
                <div className="mb-3 p-3 border rounded">
                  <label className="form-label fw-semibold d-block mb-2">Course Media</label>
                  {currentMediaUrl && !selectedFile && (
                    <div className="mb-2">
                      <p className="mb-1">Current media:</p>
                      <a href={currentMediaUrl} target="_blank" rel="noopener noreferrer">{currentMediaUrl.split('/').pop()}</a>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-danger ms-2" 
                        onClick={handleRemoveMedia}
                        disabled={isUpdating}
                        title="Remove current media link"
                      >
                        Remove Media
                      </button>
                    </div>
                  )}
                  <label htmlFor="mediaFileInput" className="form-label mt-2">
                    {currentMediaUrl ? 'Upload New to Replace Current:' : 'Upload Media (Optional):'}
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="mediaFileInput" // Added ID for reset
                    onChange={handleFileChange}
                    disabled={isUpdating}
                  />
                  {selectedFile && <p className="form-text text-muted mt-1">New file selected: {selectedFile.name}</p>}
                </div>
                
                <div className="mb-3">
                    <label className="form-label fw-semibold">Instructor</label>
                    <input type="text" className="form-control" value={currentUser?.name || 'Loading...'} disabled />
                    <div className="form-text">Course instructor cannot be changed through this form.</div>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                  <Link to={courseId ? `/courses/${courseId}` : "/courses"} className="btn btn-outline-secondary me-md-2" type="button" disabled={isUpdating}>
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-warning" disabled={isUpdating}>
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
