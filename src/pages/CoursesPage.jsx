// src/pages/CoursesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCourses, deleteCourse as deleteCourseService } from '../services/courseService'; // <-- Import deleteCourse and alias it
import { useAuth } from '../contexts/AuthContext';

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null); // For errors from actions like delete
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setActionError(null); // Clear action errors on fetch
        const data = await getAllCourses();
        setCourses(data);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError(err.message || 'Failed to fetch courses. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const displayedCourses = React.useMemo(() => {
    if (currentUser && currentUser.role === 'Instructor') {
      return courses.filter(course => course.instructorId === currentUser.userId);
    }
    return courses;
  }, [courses, currentUser]);

  const handleDeleteCourse = async (courseId, courseTitle) => {
    setActionError(null); // Clear previous action errors
    // It's good practice to use window.confirm for destructive actions
    // However, window.confirm() is blocking and not ideal for all UX.
    // For now, we'll proceed with it. In a more complex app, you might use a custom modal.
    if (window.confirm(`Are you sure you want to delete the course "${courseTitle}"? This will also delete all associated assessments.`)) {
      try {
        await deleteCourseService(courseId); // Call the service function
        // Update the UI by removing the deleted course from the state
        setCourses(prevCourses => prevCourses.filter(course => course.courseId !== courseId));
        alert(`Course "${courseTitle}" deleted successfully.`);
      } catch (err) {
        console.error(`Failed to delete course ${courseId}:`, err);
        setActionError(err.message || `Failed to delete course "${courseTitle}". Please try again.`);
        alert(`Error: ${err.message || 'Failed to delete course.'}`); // Also show an alert for immediate feedback
      }
    }
  };


  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading courses...</span>
        </div>
      </div>
    );
  }

  if (error) { // Error during initial fetch
    return (
      <div className="alert alert-danger" role="alert">
        <strong>Error fetching courses:</strong> {error}
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          {currentUser && currentUser.role === 'Instructor' ? 'My Created Courses' : 'Available Courses'}
        </h1>
        {currentUser && currentUser.role === 'Instructor' && (
          <Link to="/courses/create" className="btn btn-primary">
            <i className="bi bi-plus-circle-fill me-2"></i>
            Create New Course
          </Link>
        )}
      </div>

      {actionError && ( // Display errors from actions like delete
        <div className="alert alert-danger" role="alert">
          <strong>Action Error:</strong> {actionError}
        </div>
      )}

      {displayedCourses.length === 0 ? (
        <div className="alert alert-info" role="alert">
          {currentUser && currentUser.role === 'Instructor' 
            ? 'You have not created any courses yet.' 
            : 'No courses available at the moment. Please check back later!'}
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {displayedCourses.map(course => (
            <div key={course.courseId} className="col">
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{course.title}</h5>
                  <p className="card-text flex-grow-1">{course.description || 'No description available.'}</p>
                  <p className="card-text">
                    <small className="text-muted">
                      Instructor: {course.instructorName || 'N/A'}
                    </small>
                  </p>
                  <div className="mt-auto">
                    <Link to={`/courses/${course.courseId}`} className="btn btn-outline-primary btn-sm me-2"> 
                      View Details
                    </Link>
                    {currentUser && currentUser.role === 'Instructor' && course.instructorId === currentUser.userId && (
                      <>
                        <Link 
                          to={`/courses/edit/${course.courseId}`} 
                          className="btn btn-outline-secondary btn-sm me-2" 
                          title="Edit Course"
                        >
                           Edit
                        </Link>
                        {/* Updated Delete Button */}
                        <button 
                          onClick={() => handleDeleteCourse(course.courseId, course.title)} 
                          className="btn btn-outline-danger btn-sm"
                          title="Delete Course"
                        >
                           Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Reminder for instructors if they see all courses due to backend limitations - This might be less relevant now if filtering works as expected */}
      {/* {currentUser && currentUser.role === 'Instructor' && courses.length !== displayedCourses.length && (
        <div className="alert alert-warning mt-4" role="alert">
          <strong>Note:</strong> You are currently seeing all courses. Functionality to display only your created courses and manage them fully requires backend updates for filtering by instructor.
        </div>
      )} */}
    </div>
  );
}

export default CoursesPage;
