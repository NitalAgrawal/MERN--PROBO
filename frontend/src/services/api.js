import axios from 'axios';

// Get API URL from env, fallback to localhost:5000 in dev
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true, // enable sending cookies across origins
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle errors or token expirations globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized (401), we could trigger an auth reset
    if (error.response && error.response.status === 401) {
      // Handle session expiration/logged out status if needed
    }
    return Promise.reject(error);
  }
);

export default api;
