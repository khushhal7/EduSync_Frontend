// src/services/courseService.js
import axios from 'axios';

// Re-use the API_BASE_URL or define it if it's specific.
// For consistency, it's good to have a central place for API_BASE_URL,
// but for now, we can redefine it or import it if you've centralized it.
// Assuming your authService.js has it, and it's the same base for all API calls.
// For this example, I'll use the one we know from your backend setup.
const API_BASE_URL = 'https://localhost:7142'; // Ensure this matches your backend's HTTPS port

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches all courses from the API.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of course objects.
 */
export const getAllCourses = async () => {
  try {
    const response = await apiClient.get('/api/courses');
    return response.data; // This should be an array of CourseDto from your backend
  } catch (error) {
    console.error('Get All Courses API call error:', error.response ? error.response.data : error.message);
    // Re-throw a more specific error or a generic one for the component to handle
    throw error.response ? error.response.data : new Error('Failed to fetch courses. Please try again.');
  }
};

/**
 * Fetches a single course by its ID from the API.
 * @param {string} courseId - The ID of the course to fetch.
 * @returns {Promise<object>} A promise that resolves to a course object.
 */
export const getCourseById = async (courseId) => {
  try {
    const response = await apiClient.get(`/api/courses/${courseId}`);
    return response.data; // This should be a CourseDto from your backend
  } catch (error) {
    console.error(`Get Course By ID API call error for courseId ${courseId}:`, error.response ? error.response.data : error.message);
    // Re-throw a more specific error or a generic one for the component to handle
    throw error.response ? error.response.data : new Error(`Failed to fetch course with ID ${courseId}. Please try again.`);
  }
};

/**
 * Creates a new course.
 * @param {object} courseData - The data for the new course.
 * @param {string} courseData.title
 * @param {string} courseData.description
 * @param {string} courseData.instructorId - The ID of the instructor creating the course.
 * @param {string} [courseData.mediaUrl] - Optional URL for course media.
 * @returns {Promise<object>} A promise that resolves to the created course object (CourseDto).
 */
export const createCourse = async (courseData) => {
  try {
    // TODO: When JWT authentication is implemented, add Authorization header:
    // const token = localStorage.getItem('authToken'); // Or however you store it
    // const config = { headers: { Authorization: `Bearer ${token}` } };
    // const response = await apiClient.post('/api/courses', courseData, config);
    const response = await apiClient.post('/api/courses', courseData);
    return response.data; // This should be the CourseDto of the newly created course
  } catch (error) {
    console.error('Create Course API call error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to create course. Please try again.');
  }
};

/**
 * Updates an existing course.
 * @param {string} courseId - The ID of the course to update.
 * @param {object} courseData - The updated data for the course. This should match the structure of CourseForUpdateDto.
 * @param {string} courseData.title
 * @param {string} courseData.description
 * @param {string} courseData.instructorId - The ID of the instructor (important if this can be changed).
 * @param {string} [courseData.mediaUrl] - Optional URL for course media.
 * @returns {Promise<void>} A promise that resolves when the update is successful.
 */
export const updateCourse = async (courseId, courseData) => {
  try {
    // TODO: When JWT authentication is implemented, add Authorization header.
    // const token = localStorage.getItem('authToken');
    // const config = { headers: { Authorization: `Bearer ${token}` } };
    // await apiClient.put(`/api/courses/${courseId}`, courseData, config);
    await apiClient.put(`/api/courses/${courseId}`, courseData);
    // PUT requests often return 204 No Content on success, so no response.data to return.
  } catch (error) {
    console.error(`Update Course API call error for courseId ${courseId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error(`Failed to update course with ID ${courseId}. Please try again.`);
  }
};

/**
 * Deletes an existing course by its ID.
 * @param {string} courseId - The ID of the course to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion is successful.
 */
export const deleteCourse = async (courseId) => {
  try {
    // TODO: When JWT authentication is implemented, add Authorization header.
    // const token = localStorage.getItem('authToken');
    // const config = { headers: { Authorization: `Bearer ${token}` } };
    // await apiClient.delete(`/api/courses/${courseId}`, config);
    await apiClient.delete(`/api/courses/${courseId}`);
    // DELETE requests often return 204 No Content on success.
  } catch (error) {
    console.error(`Delete Course API call error for courseId ${courseId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error(`Failed to delete course with ID ${courseId}. Please try again.`);
  }
};

export default {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse, // <-- Added deleteCourse to exports
};
