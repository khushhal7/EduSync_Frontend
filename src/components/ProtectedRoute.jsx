// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation(); // Get current location to redirect back after login

  if (isLoading) {
    // You can render a loading spinner here if you have one,
    // or null to render nothing while checking auth state.
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // If user is not logged in, redirect to the login page.
    // Pass the current location in state so we can redirect back after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is logged in, render the child component (the protected page)
  return children;
}

export default ProtectedRoute;
