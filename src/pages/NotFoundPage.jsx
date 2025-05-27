// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="text-center py-5">
      <h1 className="display-1 fw-bold">404</h1>
      <p className="fs-3"> <span className="text-danger">Opps!</span> Page not found.</p>
      <p className="lead">
        The page you’re looking for doesn’t exist.
      </p>
      <Link to="/" className="btn btn-primary btn-lg mt-3">
        Go Home
      </Link>
    </div>
  );
} 

export default NotFoundPage;
