// src/services/authService.js
import axios from 'axios';

// Define the base URL for your backend API.
// const API_BASE_URL = 'https://localhost:7142'; 
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7142';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Logs in a user.
 * @param {object} credentials - The user's credentials.
 * @param {string} credentials.email - The user's email.
 * @param {string} credentials.password - The user's password.
 * @returns {Promise<object>} The user data from the API on successful login.
 */
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login API call error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Login failed. Please try again.');
  }
};

/**
 * Registers a new user.
 * @param {object} userData - The user's registration data.
 * @param {string} userData.name
 * @param {string} userData.email
 * @param {string} userData.password
 * @param {string} userData.role - "Student" or "Instructor"
 * @returns {Promise<object>} The registered user data from the API.
 */
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Register API call error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Registration failed. Please try again.');
  }
};

/**
 * Sends a forgot password request.
 * @param {object} emailData - Object containing the user's email.
 * @param {string} emailData.email - The email address for password reset.
 * @returns {Promise<object>} The response data from the API (e.g., a success message, and for dev, the token).
 */
export const forgotPassword = async (emailData) => {
  try {
    const response = await apiClient.post('/api/auth/forgot-password', emailData);
    // The backend might return the token directly for dev, or just a message.
    // For now, we expect response.data which might include { message: "...", token: "..." }
    return response.data; 
  } catch (error) {
    console.error('Forgot Password API call error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Forgot password request failed. Please try again.');
  }
};

/**
 * Resets the user's password using a token.
 * @param {object} resetData - The data for resetting the password.
 * @param {string} resetData.token - The password reset token.
 * @param {string} resetData.newPassword - The new password.
 * @param {string} resetData.confirmPassword - The confirmation of the new password.
 * @returns {Promise<object>} The response data from the API (e.g., a success message).
 */
export const resetPassword = async (resetData) => {
  try {
    const response = await apiClient.post('/api/auth/reset-password', resetData);
    return response.data; // This should be an object with a success message
  } catch (error) {
    console.error('Reset Password API call error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Password reset failed. Please try again.');
  }
};


export default {
  loginUser,
  registerUser,
  forgotPassword,  // <-- Added forgotPassword
  resetPassword,   // <-- Added resetPassword
};
