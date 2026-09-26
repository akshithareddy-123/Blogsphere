import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL;
const baseURL = rawApiUrl
  ? `${rawApiUrl.replace(/\/+$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('blogsphere_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle responses and unauthenticated 401 response
api.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
      return { ...response, data: {} };
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear stale token
      // Note: we avoid force redirect on public pages
      const currentPath = window.location.pathname;
      if (
        currentPath.includes('/create') ||
        currentPath.includes('/edit') ||
        currentPath.includes('/dashboard') ||
        currentPath.includes('/admin') ||
        currentPath.includes('/bookmarks')
      ) {
        localStorage.removeItem('blogsphere_token');
        localStorage.removeItem('blogsphere_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
