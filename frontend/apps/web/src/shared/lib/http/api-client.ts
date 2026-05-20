import axios from 'axios';
import { useAuthStore } from '../../../features/auth/store/auth-store';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = err.config?.url?.startsWith('/v1/auth/');
    if (err.response?.status === 401 && !isAuthEndpoint) {
      useAuthStore.getState().clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);
