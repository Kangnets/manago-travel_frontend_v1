import axios from 'axios';
import { SignupRequest, LoginRequest, User } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 전송 활성화
});

// Auth API
export const authAPI = {
  signup: async (data: SignupRequest) => {
    const response = await authClient.post<{ message: string; user: User }>('/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginRequest) => {
    const response = await authClient.post<{ message: string; user: User }>('/auth/login', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await authClient.get<{ user: User }>('/auth/me');
    return response.data.user;
  },

  checkAuth: async () => {
    const response = await authClient.get<{ authenticated: boolean; user: User | null }>('/auth/check');
    return response.data;
  },

  logout: async () => {
    await authClient.post('/auth/logout');
  },
};

export default authClient;
