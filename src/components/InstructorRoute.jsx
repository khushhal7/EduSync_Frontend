// src/components/InstructorRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function InstructorRoute({ children }) {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Render a loading spinner or null while checking auth state
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // User not logged in, redirect to login page
    // Pass the current location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentUser.role !== 'Instructor') {
    // User is logged in but not an instructor, redirect to a 'Not Authorized' page or home
    // For now, let's redirect to home page. You could create a specific "Unauthorized" page later.
    alert("Access Denied: This page is for instructors only."); // Optional: show an alert
    return <Navigate to="/" replace />; 
  }

  // User is logged in and is an instructor, render the child component
  return children;
}

export default InstructorRoute;
