// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService'; // Import the registerUser function

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student'); // Default role to Student
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    if (!name || !email || !password || !role) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const userData = { name, email, password, role };
      const registeredUserData = await registerUser(userData);
      console.log('Registration successful:', registeredUserData);
      setIsLoading(false);

      alert(`Registration successful for ${registeredUserData.name}! Please login.`);
      navigate('/login'); // Redirect to login page after successful registration

    } catch (err) {
      setIsLoading(false);
      if (err && typeof err === 'string') {
        setError(err);
      } else if (err && err.message) {
        setError(err.message);
      } else if (err && err.title) { // For ASP.NET Core validation problem details
         setError(err.title || 'Registration failed. Please try again.');
      }
      else {
        setError('Registration failed. Please try again later.');
      }
      console.error('Registration page error:', err);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h1 className="card-title text-center mb-4">Create Account</h1>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="nameInput" className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="nameInput"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
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
                />
              </div>
              <div className="mb-3">
                <label htmlFor="passwordInput" className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="passwordInput"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="roleSelect" className="form-label">Register as</label>
                <select
                  className="form-select"
                  id="roleSelect"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Registering...
                  </>
                ) : (
                  'Register'
                )}
              </button>
            </form>
            <p className="mt-3 text-center">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
