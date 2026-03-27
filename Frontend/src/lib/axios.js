
import axios from 'axios';

// Get backend URL from environment
const getBackendURL = () => {
  if (import.meta.env.MODE === "development") {
    return 'http://localhost:5001/api';
  }
  // In production: use VITE_BACKEND_URL env var, fallback to current origin
  const backendURL = import.meta.env.VITE_BACKEND_URL || window.location.origin;
  return `${backendURL}/api`;
};

const axiosInstance = axios.create({
  baseURL: getBackendURL(),
  withCredentials: true,
});

// Add error interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;