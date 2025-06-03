// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function HomePage() {
  const { currentUser } = useAuth();

  const renderStudentContent = () => (
    <>
      <div className="col-md-6 mb-4">
        <div className="h-100 p-5 text-white bg-primary rounded-3 shadow d-flex flex-column justify-content-center text-center">
          <h2><i className="bi bi-journal-bookmark-fill me-2"></i>My Learning</h2>
          <p>Access your enrolled courses, continue your lessons, and track your progress towards completion.</p>
          <Link to="/courses" className="btn btn-light mt-auto" type="button">
            Browse My Courses
          </Link>
        </div>
      </div>
      <div className="col-md-6 mb-4">
        <div className="h-100 p-5 bg-light border rounded-3 shadow d-flex flex-column justify-content-center text-center">
          <h2><i className="bi bi-check2-circle me-2"></i>My Results</h2>
          <p>Review your assessment scores, understand your performance, and identify areas for improvement.</p>
          <Link to="/my-results" className="btn btn-outline-secondary mt-auto" type="button">
            View My Results
          </Link>
        </div>
      </div>
    </>
  );

  const renderInstructorContent = () => (
    <>
      <div className="col-md-6 mb-4">
        <div className="h-100 p-5 text-white bg-success rounded-3 shadow d-flex flex-column justify-content-center text-center">
          <h2><i className="bi bi-pencil-square me-2"></i>Manage Courses</h2>
          <p>Create new courses, edit existing content, and manage assessments for your students.</p>
          <Link to="/courses" className="btn btn-light mt-auto" type="button"> 
            My Created Courses 
          </Link> 
          {/* This link currently goes to /courses which filters for instructors. 
              Consider a dedicated /instructor/dashboard or /instructor/courses later. 
          */}
        </div>
      </div>
      <div className="col-md-6 mb-4">
        <div className="h-100 p-5 bg-light border rounded-3 shadow d-flex flex-column justify-content-center text-center">
          <h2><i className="bi bi-people-fill me-2"></i>Student Performance</h2>
          <p>Track student progress, view assessment results, and gain insights into learning outcomes.</p>
          <Link to="/student-performance" className="btn btn-outline-secondary mt-auto" type="button">
            View Student Performance
          </Link>
        </div>
      </div>
    </>
  );

  const renderGuestContent = () => (
     <>
      <div className="col-md-6 mb-4">
        <div className="h-100 p-5 text-white bg-primary rounded-3 shadow d-flex flex-column justify-content-center text-center">
          <h2><i className="bi bi-mortarboard-fill me-2"></i>For Students</h2>
          <p>Access a wide range of courses, take assessments, and monitor your learning journey seamlessly.</p>
          <Link to="/register" className="btn btn-outline-light mt-auto" type="button">
            Sign Up Now
          </Link>
        </div>
      </div>
      <div className="col-md-6 mb-4">
        <div className="h-100 p-5 bg-light border rounded-3 shadow d-flex flex-column justify-content-center text-center">
          <h2><i className="bi bi-briefcase-fill me-2"></i>For Instructors</h2>
          <p>Create and manage courses, design engaging assessments, and track student performance effectively.</p>
          <Link to="/register" className="btn btn-outline-secondary mt-auto" type="button">
            Become an Instructor
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <main role="main">
      {/* Hero Section - Full Width Background */}
      <div className="bg-light shadow-sm">
        <div className="container py-4 py-md-5">
          <div className="p-5 text-center"> 
            <h1 className="display-4 fw-bold">
              {currentUser ? `Welcome back, ${currentUser.name}!` : "Welcome to EduSync!"}
            </h1>
            <p className="fs-5 col-lg-8 mx-auto">
              Your smart learning management and assessment platform. 
              {currentUser && currentUser.role === 'Student' && " Continue your learning journey and track your progress."}
              {currentUser && currentUser.role === 'Instructor' && " Manage your courses and monitor student performance."}
              {!currentUser && " Explore courses, track your progress, and engage with interactive content."}
            </p>
            <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mt-4">
              <Link to="/courses" className="btn btn-primary btn-lg px-4 gap-3">
                <i className="bi bi-journals me-2"></i>Browse Courses
              </Link>
              {!currentUser && (
                <>
                  <Link to="/login" className="btn btn-outline-secondary btn-lg px-4">
                    <i className="bi bi-box-arrow-in-right me-2"></i>Login
                  </Link>
                  <Link to="/register" className="btn btn-outline-success btn-lg px-4">
                     <i className="bi bi-person-plus-fill me-2"></i>Register
                  </Link>
                </>
              )}
              {currentUser && currentUser.role === 'Student' && (
                   <Link to="/my-results" className="btn btn-info btn-lg px-4 text-white"> {/* Added text-white for better contrast on btn-info */}
                    <i className="bi bi-clipboard2-check-fill me-2"></i>My Results
                  </Link>
              )}
               {currentUser && currentUser.role === 'Instructor' && (
                   <Link to="/student-performance" className="btn btn-info btn-lg px-4 text-white">
                    <i className="bi bi-graph-up me-2"></i>Student Performance
                  </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Sections - Content within a standard container */}
      <div className="container py-4 py-md-5">
        <div className="row align-items-md-stretch"> 
          {currentUser && currentUser.role === 'Student' && renderStudentContent()}
          {currentUser && currentUser.role === 'Instructor' && renderInstructorContent()}
          {!currentUser && renderGuestContent()}
        </div>
      </div>

      {/* Placeholder for an image section or more interactive content */}
      {/* <div className="container py-4">
        <div className="row">
          <div className="col-lg-8 mx-auto text-center">
            <h2 className="fw-light">Learn Anytime, Anywhere</h2>
            <p className="lead text-muted">EduSync provides a flexible platform accessible on all your devices.</p>
            <img src="https://placehold.co/800x400?text=Interactive+Learning+Illustration" className="img-fluid rounded shadow-lg my-4" alt="Learning Illustration"/>
          </div>
        </div>
      </div>
      */}
    </main>
  );
}

export default HomePage;
