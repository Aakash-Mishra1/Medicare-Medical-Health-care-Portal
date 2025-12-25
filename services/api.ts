
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000, // Quick timeout for seamless local fallback
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If no response (network down), we simply suppress the default error rejection 
    // and let the component catch it for local vault logic without console noise.
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      if (!window.location.hash.includes('/login')) {
        window.location.href = '#/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
