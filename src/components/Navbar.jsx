// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

function Navbar() {
  const { currentUser, logout } = useAuth(); // Get currentUser and logout function
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call logout from AuthContext
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm w-100 px-3 py-2"
      style={{ fontFamily: 'Segoe UI, sans-serif' }}
    >
      <div className="container-fluid p-0"> {/* Remove default container padding */}
        <Link className="navbar-brand fw-bold fs-4" to="/">
          EduSync
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0"> {/* me-auto for left-aligned items */}
            <li className="nav-item">
              <Link className="nav-link fs-6" aria-current="page" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fs-6" to="/courses">
                Courses
              </Link>
            </li>
            {/* Conditionally render "My Results" link if user is a Student */}
            {currentUser && currentUser.role === 'Student' && (
              <li className="nav-item">
                <Link className="nav-link fs-6" to="/my-results">
                  My Results
                </Link>
              </li>
            )}
            {/* Conditionally render "Create Course" link if user is an Instructor */}
            {currentUser && currentUser.role === 'Instructor' && (
              <li className="nav-item">
                <Link className="nav-link fs-6" to="/courses/create">
                  Create Course
                </Link>
              </li>
            )}
            {/* Conditionally render "Student Performance" link if user is an Instructor */}
            {currentUser && currentUser.role === 'Instructor' && (
              <li className="nav-item">
                <Link className="nav-link fs-6" to="/student-performance">
                  Student Performance
                </Link>
              </li>
            )}
          </ul>

          <ul className="navbar-nav ms-auto align-items-center"> {/* ms-auto for right-aligned items */}
            {currentUser ? (
              // If user is logged in
              <>
                <li className="nav-item me-3">
                  <span className="navbar-text text-white small">
                    Welcome, {currentUser.name}! ({currentUser.role})
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-light btn-sm px-3 py-1 fw-semibold border-0"
                    onClick={handleLogout}
                    style={{
                      transition: '0.3s',
                      borderRadius: '0.25rem',
                      backgroundColor: '#ffffff',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              // If user is not logged in
              <>
                <li className="nav-item">
                  <Link className="nav-link fs-6" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fs-6" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
