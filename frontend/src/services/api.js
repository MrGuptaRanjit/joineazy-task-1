import axios from 'axios';

// Dynamically resolve API base URL so remote IP access (e.g. 10.84.157.240) and custom domains work seamlessly
const getApiBaseUrl = () => {
  // If explicitly configured with a non-localhost URL in environment, use it
  if (
    import.meta.env.VITE_API_BASE_URL &&
    !import.meta.env.VITE_API_BASE_URL.includes('localhost') &&
    !import.meta.env.VITE_API_BASE_URL.includes('127.0.0.1')
  ) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // If in browser and accessed via host IP or custom domain (e.g. 10.84.157.240:3000)
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname } = window.location;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${protocol}//${hostname}:5000/api`;
    }
  }

  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});


// Request Interceptor: Attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract error messages & handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const originalRequest = error.config;
    
    // Automatically clear token on 401 Unauthorized (unless it's the login route itself)
    if (error.response?.status === 401 && !originalRequest?.url?.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If we are in the browser, dispatch custom event or redirect
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';

    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.errors = error.response?.data?.errors;
    customError.raw = error.response?.data;

    return Promise.reject(customError);
  }
);

export default api;
