import axios from 'axios';
import { clearToken, getToken } from '../utils/tokenStorage';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User } from '../types/auth';

// ── Axios instance ───────────────────────────────────────────────────────────
// Pre-configured axios instance with baseURL and JSON content type.
// Use this for all API calls — it automatically attaches the JWT and
// handles 401s by clearing the session and reloading to /login.
const api = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
});
 
// Request interceptor — attach JWT on every outgoing request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
 
// Response interceptor — handle expired / invalid tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),
 
  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),
 
  me: () =>
    api.get<ApiResponse<User>>('/auth/me'),
 
  googleLogin: (): void => {
    window.location.href = '/api/v1/auth/oauth2/authorize/google'
  },
 
  facebookLogin: (): void => {
    window.location.href = '/api/v1/auth/oauth2/authorize/facebook'
  }
}

export const userApi = {
  getAll: () => api.get<ApiResponse<User[]>>('/users'),
}