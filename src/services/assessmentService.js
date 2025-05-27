// src/services/assessmentService.js
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
 * Fetches all assessments for a specific course from the API.
 * @param {string} courseId - The ID of the course.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of assessment objects.
 */
export const getAssessmentsForCourse = async (courseId) => {
  try {
    // The endpoint is /api/courses/{courseId}/assessments as per our backend controller
    const response = await apiClient.get(`/api/courses/${courseId}/assessments`);
    return response.data; // This should be an array of AssessmentDto from your backend
  } catch (error) {
    console.error(`Get Assessments for Course API call error for courseId ${courseId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error(`Failed to fetch assessments for course ${courseId}. Please try again.`);
  }
};

/**
 * Fetches a single assessment by its ID from the API.
 * @param {string} assessmentId - The ID of the assessment to fetch.
 * @returns {Promise<object>} A promise that resolves to an assessment object.
 */
export const getAssessmentById = async (assessmentId) => {
  try {
    const response = await apiClient.get(`/api/assessments/${assessmentId}`);
    return response.data; // This should be an AssessmentDto from your backend
  } catch (error) {
    console.error(`Get Assessment By ID API call error for assessmentId ${assessmentId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error(`Failed to fetch assessment with ID ${assessmentId}. Please try again.`);
  }
};

/**
 * Creates a new assessment.
 * @param {object} assessmentData - The data for the new assessment.
 * @param {string} assessmentData.courseId
 * @param {string} assessmentData.title
 * @param {string} assessmentData.questions - JSON string of questions
 * @param {number} assessmentData.maxScore
 * @returns {Promise<object>} A promise that resolves to the created assessment object (AssessmentDto).
 */
export const createAssessment = async (assessmentData) => {
  try {
    // TODO: When JWT authentication is implemented, add Authorization header
    const response = await apiClient.post('/api/assessments', assessmentData);
    return response.data; // This should be the AssessmentDto of the newly created assessment
  } catch (error) {
    console.error('Create Assessment API call error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to create assessment. Please try again.');
  }
};

/**
 * Updates an existing assessment.
 * @param {string} assessmentId - The ID of the assessment to update.
 * @param {object} assessmentData - The updated data for the assessment. 
 * Should match AssessmentForUpdateDto (title, questions, maxScore).
 * @returns {Promise<void>} A promise that resolves when the update is successful.
 */
export const updateAssessment = async (assessmentId, assessmentData) => {
  try {
    // TODO: When JWT authentication is implemented, add Authorization header.
    await apiClient.put(`/api/assessments/${assessmentId}`, assessmentData);
    // PUT requests often return 204 No Content on success, so no response.data to return.
  } catch (error) {
    console.error(`Update Assessment API call error for assessmentId ${assessmentId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error(`Failed to update assessment with ID ${assessmentId}. Please try again.`);
  }
};

/**
 * Deletes an existing assessment by its ID.
 * @param {string} assessmentId - The ID of the assessment to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion is successful.
 */
export const deleteAssessment = async (assessmentId) => {
  try {
    // TODO: When JWT authentication is implemented, add Authorization header.
    await apiClient.delete(`/api/assessments/${assessmentId}`);
    // DELETE requests often return 204 No Content on success.
  } catch (error) {
    console.error(`Delete Assessment API call error for assessmentId ${assessmentId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error(`Failed to delete assessment with ID ${assessmentId}. Please try again.`);
  }
};

export default {
  getAssessmentsForCourse,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment, // <-- Added deleteAssessment to exports
};
