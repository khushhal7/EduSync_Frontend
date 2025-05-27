// src/services/resultService.js
import axios from 'axios';

// Ensure this matches your backend's HTTPS port and the one used in other services
const API_BASE_URL = 'https://localhost:7142'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Submits a new assessment result to the API.
 * @param {object} resultData - The data for the result to be submitted.
 * @param {string} resultData.assessmentId - The ID of the assessment.
 * @param {string} resultData.userId - The ID of the user (student).
 * @param {number} resultData.score - The achieved score.
 * @returns {Promise<object>} A promise that resolves to the created result object from the API.
 */
export const submitResult = async (resultData) => {
  try {
    // The endpoint is /api/results as per our backend ResultsController
    const response = await apiClient.post('/api/results', resultData);
    return response.data; // This should be the ResultDto from your backend
  } catch (error) {
    console.error('Submit Result API call error:', error.response ? error.response.data : error.message);
    // Re-throw a more specific error or a generic one for the component to handle
    throw error.response ? error.response.data : new Error('Failed to submit result. Please try again.');
  }
};

/**
 * Fetches all results for a specific user from the API.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of result objects.
 */
export const getResultsForUser = async (userId) => {
  try {
    // The endpoint is /api/results/user/{userId} as per our backend ResultsController
    const response = await apiClient.get(`/api/results/user/${userId}`);
    return response.data; // This should be an array of ResultDto from your backend
  } catch (error) {
    console.error(`Get Results for User API call error for userId ${userId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error(`Failed to fetch results for user ${userId}. Please try again.`);
  }
};

/**
 * Fetches all results for a specific assessment from the API.
 * @param {string} assessmentId - The ID of the assessment.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of result objects.
 */
export const getResultsForAssessment = async (assessmentId) => {
  try {
    // The endpoint is /api/results/assessment/{assessmentId} as per our backend ResultsController
    const response = await apiClient.get(`/api/results/assessment/${assessmentId}`);
    return response.data; // This should be an array of ResultDto from your backend
  } catch (error) {
    console.error(`Get Results for Assessment API call error for assessmentId ${assessmentId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error(`Failed to fetch results for assessment ${assessmentId}. Please try again.`);
  }
};

export default {
  submitResult,
  getResultsForUser,
  getResultsForAssessment, // <-- Added getResultsForAssessment to exports
};
