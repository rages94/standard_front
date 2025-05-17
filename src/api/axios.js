// src/api/axios.js

import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const baseUrl = import.meta.env.VITE_BASE_URL;
// Create an Axios instance
const api = axios.create({
  baseURL: baseUrl + '/api',  // API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Axios response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const auth = useAuthStore();
    const originalRequest = error.config;

    // Check if the error is due to token expiry (401)
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token logic
        const refreshToken = localStorage.getItem('refresh_token');
        const refreshResponse = await axios.post(
          baseUrl + '/api/tokens/refresh',
          {},
          { headers: { 'Authorization': `Bearer ${refreshToken}` } }
        );

        const { access_token, refresh_token } = refreshResponse.data;

        auth.login(access_token, refresh_token);

        // Retry the original request with the new access token
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        auth.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
