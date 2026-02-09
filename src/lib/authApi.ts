import axios from 'axios';
import { SignupRequest, LoginRequest, AuthResponse, User } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰을 요청 헤더에 추가하는 인터셉터
authClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  signup: async (data: SignupRequest) => {
    const response = await authClient.post<{ message: string; user: User }>('/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginRequest) => {
    const response = await authClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await authClient.get<{ user: User }>('/auth/me');
    return response.data.user;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
  },
};

export default authClient;
