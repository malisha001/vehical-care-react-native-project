import axios from "axios";
import { useAuthStore } from "../store/authStore";

const FALLBACK_API_BASE_URL =
  "https://vehical-care-react-native-project.onrender.com/api";
const rawApiBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  FALLBACK_API_BASE_URL;

const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, "");

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Request interceptor - attach access token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { refreshToken, setAccessToken, clearAuth } =
        useAuthStore.getState();

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;
          setAccessToken(accessToken);
          useAuthStore.setState({ refreshToken: newRefreshToken });
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          clearAuth();
          window.location.href = "/login";
        }
      } else {
        clearAuth();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
