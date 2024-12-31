// src/api/axios.js

import axios from 'axios';

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
  (response) => response,  // Pass through successful responses
  async (error) => {
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

        // Store the new tokens
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        // Retry the original request with the new access token
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure (redirect to login, clear tokens)
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';  // Redirect to login page
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
