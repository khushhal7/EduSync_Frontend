// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuth } from '../contexts/AuthContext'; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Email and password are required.');
      setIsLoading(false);
      return;
    }

    try {
      const userDataFromApi = await loginUser({ email, password }); 
      setIsLoading(false);
      login(userDataFromApi);
      console.log('AuthContext updated with user:', userDataFromApi);
      navigate('/'); 
    } catch (err) {
      setIsLoading(false);
      if (err && typeof err === 'string') {
        setError(err);
      } else if (err && err.message) {
        setError(err.message);
      } else if (err && err.title) { 
        setError(err.title || 'Login failed. Please check your credentials.');
      } else {
        setError('Login failed. Please check your credentials or try again later.');
      }
      console.error('Login page error:', err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6 col-xl-5">
          <div className="card shadow-lg border-0">
            <div className="card-body p-4 p-sm-5">
              <div className="text-center mb-4">
                {/* <i className="bi bi-person-circle fs-1 text-primary"></i> */}
                <h1 className="h3 mb-0 fw-bold">Login to EduSync</h1>
              </div>
              
              {error && <div className="alert alert-danger text-center small p-2" role="alert">{error}</div>}
              
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="emailInput" className="form-label">Email address</label>
                  <input
                    type="email"
                    className={`form-control form-control-lg ${error && !email ? 'is-invalid' : ''}`}
                    id="emailInput"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="passwordInput" className="form-label">Password</label>
                  <div className="input-group"> {/* Input group for password and eye icon */}
                    <input
                      type={showPassword ? "text" : "password"} // Toggle input type
                      className={`form-control form-control-lg ${error && !password ? 'is-invalid' : ''}`}
                      id="passwordInput"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button" 
                      id="togglePasswordButton"
                      onClick={togglePasswordVisibility}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}></i>
                    </button>
                  </div>
                </div>
                <div className="d-flex justify-content-end mb-3">
                  <Link to="/forgot-password" style={{ fontSize: '0.9em' }}>Forgot Password?</Link>
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </button>
                </div>
              </form>
              <div className="text-center mt-4">
                <p className="mb-0">Don't have an account? <Link to="/register">Sign up</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
