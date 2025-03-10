import axios from 'axios';

// Define base URL from environment variable or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Create axios instance with common config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 (Unauthorized) errors by redirecting to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
    }

    // Get a descriptive error message from the response
    if (error.response) {
      error.message = error.response.data?.message || 'Error en la petición';
    } else if (error.request) {
      error.message = 'No se recibió respuesta del servidor. Verifica tu conexión a internet.';
    }

    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
