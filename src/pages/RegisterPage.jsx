// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import Notification from '../components/Notification'; // <-- Import Notification component

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('Student'); 
  const [error, setError] = useState(''); // Keep this for form validation errors if preferred
  const [isLoading, setIsLoading] = useState(false);
  
  const [notification, setNotification] = useState({ show: false, message: '', type: '' }); 
  const navigate = useNavigate();

  const displayNotification = (message, type, duration = 3000) => {
    setNotification({ show: true, message, type });
    if (type === 'success') { // Only redirect on success after notification
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' }); // Clear notification
            navigate('/login');
        }, duration);
    } else { // For errors, allow user to dismiss or it auto-dismisses
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, duration + 2000); // Keep errors a bit longer or manage via onClose
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Clear form-specific error for new submission
    setNotification({ show: false, message: '', type: '' }); // Clear previous notifications
    setIsLoading(true);

    if (!name || !email || !password || !role) {
      setError('All fields are required.'); // You can keep this for inline form errors
      // Or use displayNotification('All fields are required.', 'danger');
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      // Or use displayNotification('Password must be at least 8 characters long.', 'danger');
      setIsLoading(false);
      return;
    }

    try {
      const userData = { name, email, password, role };
      const registeredUserData = await registerUser(userData);
      console.log('Registration successful:', registeredUserData);
      setIsLoading(false);

      displayNotification(`Registration successful for ${registeredUserData.name}! Please login.`, 'success');
      // Note: navigation to /login is now handled by displayNotification for success type

    } catch (err) {
      setIsLoading(false);
      const errorMessage = (err && (err.message || (typeof err === 'string' ? err : err.title))) || 'Registration failed. Please try again later.';
      // setError(errorMessage); // This sets the inline error
      displayNotification(errorMessage, 'danger'); // This shows the toast-like notification
      console.error('Registration page error:', err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <> {/* Use a fragment to allow Notification to be outside the container if positioned fixed/absolute */}
      <Notification 
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={() => setNotification({ show: false, message: '', type: '' })}
      />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4 p-sm-5">
                <div className="text-center mb-4">
                  <h1 className="h3 mb-0 fw-bold">Create Your EduSync Account</h1>
                </div>

                {/* Display inline form error if setError was used */}
                {error && !notification.show && ( 
                    <div className="alert alert-danger text-center small p-2" role="alert">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} noValidate>
                  {/* Name Input */}
                  <div className="mb-3">
                    <label htmlFor="nameInput" className="form-label">Full Name</label>
                    <input
                      type="text" className="form-control form-control-lg"
                      id="nameInput" placeholder="John Doe"
                      value={name} onChange={(e) => setName(e.target.value)}
                      disabled={isLoading} required
                    />
                  </div>
                  {/* Email Input */}
                  <div className="mb-3">
                    <label htmlFor="emailInput" className="form-label">Email address</label>
                    <input
                      type="email" className="form-control form-control-lg"
                      id="emailInput" placeholder="name@example.com"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading} required
                    />
                  </div>
                  {/* Password Input */}
                  <div className="mb-3">
                    <label htmlFor="passwordInput" className="form-label">Password</label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control form-control-lg"
                        id="passwordInput" placeholder="Minimum 8 characters"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading} required
                      />
                      <button 
                        className="btn btn-outline-secondary" type="button" 
                        onClick={togglePasswordVisibility}
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        <i className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}></i>
                      </button>
                    </div>
                    <div className="form-text">Password must be at least 8 characters long.</div>
                  </div>
                  {/* Role Select */}
                  <div className="mb-3">
                    <label htmlFor="roleSelect" className="form-label">Register as</label>
                    <select
                      className="form-select form-control-lg" id="roleSelect"
                      value={role} onChange={(e) => setRole(e.target.value)}
                      disabled={isLoading}
                    >
                      <option value="Student">Student</option>
                      <option value="Instructor">Instructor</option>
                    </select>
                  </div>
                  {/* Submit Button */}
                  <div className="d-grid mt-4">
                    <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Registering...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </form>
                <div className="text-center mt-4">
                  <p className="mb-0">Already have an account? <Link to="/login">Login here</Link></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;
