import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1', // Using proxy in vite.config.js
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for standardizing error responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If the server returns our standardized error format, pass that along
    if (error.response && error.response.data && error.response.data.error) {
      return Promise.reject(error.response.data.error);
    }
    // Otherwise fallback to generic
    return Promise.reject({
      code: 'NETWORK_ERROR',
      message: error.message || 'An unexpected error occurred'
    });
  }
);

export default api;

