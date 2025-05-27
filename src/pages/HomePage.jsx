// src/pages/HomePage.jsximport React from 'react';
import { Link } from 'react-router-dom'; // Import Link for buttons
import { useAuth } from '../contexts/AuthContext'; // To conditionally show buttons

function HomePage() {
  const { currentUser } = useAuth();

  return (
    <main role="main" style={{ fontFamily: 'Segoe UI, sans-serif' }}> {/* Main tag for semantics with font style */}
      {/* Jumbotron / Hero Section - Full Width Background */}
      <div className="bg-light shadow-sm" style={{ minHeight: '100vh' }}> {/* Full height background color */}
        <div className="container py-4 py-md-5"> {/* Inner container for content */}
          <div className="p-5 text-center"> {/* Removed mb-4, rounded-3 from outer, kept for inner content spacing */}
            <h1 className="display-4 fw-bold">Welcome to EduSync!</h1>
            <p className="fs-5 col-lg-8 mx-auto">
              Your smart learning management and assessment platform. Explore courses, track your progress, and engage with interactive content.
            </p>
            <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mt-4">
              <Link to="/courses" className="btn btn-primary btn-lg px-4 gap-3">
                Browse Courses
              </Link>
              {!currentUser && (
                <>
                  <Link to="/login" className="btn btn-outline-secondary btn-lg px-4">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-outline-success btn-lg px-4">
                    Register
                  </Link>
                </>
              )}
              {currentUser && (
                <Link to="/my-results" className="btn btn-outline-info btn-lg px-4">
                  My Results
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Sections - Content within a standard container */}
      <div className="container py-4 py-md-5"> {/* Container for the feature sections row */}
        <div className="row align-items-md-stretch"> 
          <div className="col-md-6 mb-4"> 
            <div className="h-100 p-5 text-white bg-primary rounded-3 shadow d-flex flex-column justify-content-center text-center">
              <h2>For Students</h2>
              <p>Access a wide range of courses, take assessments, and monitor your learning journey seamlessly.</p>
              {currentUser ? (
                currentUser.role === 'Student' ? (
                  <Link to="/my-results" className="btn btn-outline-light mt-auto" type="button">
                    View My Progress
                  </Link>
                ) : (
                  <Link to="/courses" className="btn btn-outline-light mt-auto" type="button">
                    Explore Courses
                  </Link>
                )
              ) : (
                <Link to="/register" className="btn btn-outline-light mt-auto" type="button">
                  Sign Up Now
                </Link>
              )}
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="h-100 p-5 bg-white border rounded-3 shadow d-flex flex-column justify-content-center text-center">
              <h2>For Instructors</h2>
              <p>Create and manage courses, design engaging assessments, and track student performance effectively.</p>
              {currentUser ? (
                currentUser.role === 'Instructor' ? (
                  <Link to="/courses" className="btn btn-outline-secondary mt-auto" type="button">
                    Manage Courses
                  </Link>
                ) : (
                  <Link to="/courses" className="btn btn-outline-secondary mt-auto" type="button">
                    Browse Courses
                  </Link>
                )
              ) : (
                <Link to="/register" className="btn btn-outline-secondary mt-auto" type="button">
                  Become an Instructor
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default HomePage;
