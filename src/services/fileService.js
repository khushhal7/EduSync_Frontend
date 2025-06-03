// src/services/fileService.js
import axios from 'axios';

// Ensure this matches your backend's HTTPS port and the one used in other services
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7142'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // For file uploads, 'Content-Type' will be 'multipart/form-data',
  // which Axios usually sets automatically when you pass FormData.
});

/**
 * Uploads a file to the backend.
 * @param {File} file - The file object to upload.
 * @returns {Promise<object>} A promise that resolves to an object containing the URL of the uploaded file and the blobName.
 * e.g., { url: "...", blobName: "..." }
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file); 

  try {
    // TODO: Add Authorization header if this endpoint becomes protected
    const response = await apiClient.post('/api/files/upload', formData); 
    return response.data; // Expects { url: "...", blobName: "..." }
  } catch (error) {
    console.error('File Upload API call error:', error.response ? error.response.data : error.message);
    let errorMessage = 'File upload failed. Please try again.';
    if (error.response && error.response.data) {
        if (typeof error.response.data.message === 'string') {
            errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string' && error.response.data.length < 200) { 
            errorMessage = error.response.data;
        }
    } else if (error.message) {
        errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};

/**
 * Constructs the URL to the backend endpoint for downloading a file.
 * @param {string} blobName - The name (including any path) of the blob to download.
 * @returns {string} The full URL to initiate the file download.
 */
export const getFileDownloadUrl = (blobName) => {
  if (!blobName) {
    console.error("Blob name is required to get download URL.");
    return '#'; // Return a safe non-functional link
  }
  // Ensure blobName is properly encoded if it can contain special characters, though for GUID_filename.ext it's usually fine.
  // The browser will handle encoding the path segments.
  return `${API_BASE_URL}/api/files/download/${blobName}`;
};

export default {
  uploadFile,
  getFileDownloadUrl, // <-- Added getFileDownloadUrl
};
