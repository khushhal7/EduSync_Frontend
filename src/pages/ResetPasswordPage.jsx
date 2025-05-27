// src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../services/authService'; // Import the service function

function ResetPasswordPage() {
  const { token } = useParams(); // Get the token from URL parameters
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(''); // For form validation or API errors
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Password reset token is missing or invalid. Please request a new link.");
      // Consider redirecting or showing a more prominent error
    }
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    if (!newPassword || !confirmPassword) {
      setError('Both password fields are required.');
      setIsLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await resetPassword({ token, newPassword, confirmPassword });
      setIsLoading(false);
      setMessage(response.message || "Your password has been successfully reset! You can now login.");
      setIsSuccess(true); // Set success state to change UI
      // No automatic redirect here, let user see the success message and click to login
    } catch (err) {
      setIsLoading(false);
      if (err && typeof err === 'string') {
        setError(err);
      } else if (err && err.message) {
        setError(err.message);
      } else if (err && err.title) { 
        setError(err.title || 'Failed to reset password. The link might be invalid or expired.');
      } else {
        setError('Failed to reset password. The link might be invalid or expired. Please try again.');
      }
      console.error('Reset password page error:', err);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm">
              <div className="card-body p-4 p-md-5 text-center">
                <div className="alert alert-success" role="alert">
                  <h4 className="alert-heading">Password Reset Successful!</h4>
                  <p>{message}</p>
                </div>
                <Link to="/login" className="btn btn-primary w-100 mt-3">
                  Proceed to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-4 p-md-5">
              <h1 className="card-title text-center mb-4">Reset Your Password</h1>
              
              {!token && !error && ( // Show if token is missing initially but no other error yet
                <div className="alert alert-warning">Loading token information...</div>
              )}
              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              {message && !error && ( // For general messages if needed, though success is handled by isSuccess
                 <div className="alert alert-info" role="alert">{message}</div>
              )}

              {token && ( // Only show form if token exists
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="newPasswordInput" className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPasswordInput"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="confirmPasswordInput" className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPasswordInput"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={isLoading || !token}>
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>
              )}
              <p className="mt-4 text-center">
                Remembered your password? <Link to="/login">Login here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
