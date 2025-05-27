// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService'; // Import the service function

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(''); // For success or error messages
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // To show confirmation message

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setIsLoading(true);
    setIsSubmitted(false);

    if (!email) {
      setMessage('Email address is required.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await forgotPassword({ email });
      setIsLoading(false);
      // The backend returns a generic message, and for dev, might include the token.
      // We'll primarily rely on the generic message for the user.
      setMessage(response.message || "If your email is registered, you will receive a password reset link shortly. Please check your inbox (and spam folder).");
      setIsSubmitted(true); 
      console.log('Forgot password response:', response); // For dev, to see if token is returned
      setEmail(''); // Clear the email field after submission
    } catch (err) {
      setIsLoading(false);
      // The backend is designed to always return a generic success-like message for forgot-password
      // to prevent email enumeration. So, actual errors here might be network issues
      // or if the service itself throws a different kind of error.
      setMessage(err.message || 'An error occurred. Please try again.');
      console.error('Forgot password page error:', err);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-4 p-md-5">
              <h1 className="card-title text-center mb-4">Forgot Password</h1>
              
              {!isSubmitted ? (
                <>
                  <p className="text-muted text-center mb-4">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                  {message && !isSubmitted && (
                    <div className={`alert ${error ? 'alert-danger' : 'alert-info'}`} role="alert"> 
                      {message}
                    </div>
                  )}
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="emailInput" className="form-label">Email address</label>
                      <input
                        type="email"
                        className="form-control"
                        id="emailInput"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Sending...
                        </>
                      ) : (
                        'Send Password Reset Link'
                      )}
                    </button>
                  </form>
                </>
              ) : (
                // Display this message after successful submission attempt
                <div className="alert alert-success text-center" role="alert">
                  <h4 className="alert-heading">Request Submitted!</h4>
                  <p>{message}</p>
                  <hr />
                  <p className="mb-0">
                    If you don't receive an email within a few minutes, please check your spam folder or try again.
                  </p>
                </div>
              )}

              <p className="mt-4 text-center">
                Remember your password? <Link to="/login">Login here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
