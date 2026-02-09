import axios from 'axios';
import { Product, Review } from '@/types/product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인터셉터 설정
apiClient.interceptors.request.use(
  (config) => {
    // 여기서 토큰 등을 추가할 수 있습니다
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Product API
export const productAPI = {
  getAll: async (params?: { category?: string; limit?: number }) => {
    const response = await apiClient.get<Product[]>('/products', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  getRecent: async (limit: number = 4) => {
    const response = await apiClient.get<Product[]>('/products/recent', {
      params: { limit },
    });
    return response.data;
  },

  getDiscounted: async (limit: number = 3) => {
    const response = await apiClient.get<Product[]>('/products/discounted', {
      params: { limit },
    });
    return response.data;
  },

  getBestGolf: async (limit: number = 5) => {
    const response = await apiClient.get<Product[]>('/products/best/golf', {
      params: { limit },
    });
    return response.data;
  },

  getBestTour: async (limit: number = 5) => {
    const response = await apiClient.get<Product[]>('/products/best/tour', {
      params: { limit },
    });
    return response.data;
  },

  search: async (query: string) => {
    const response = await apiClient.get<Product[]>('/products/search', {
      params: { q: query },
    });
    return response.data;
  },
};

// Review API
export const reviewAPI = {
  getAll: async (limit?: number) => {
    const response = await apiClient.get<Review[]>('/reviews', {
      params: { limit },
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Review>(`/reviews/${id}`);
    return response.data;
  },

  getByProductId: async (productId: string) => {
    const response = await apiClient.get<Review[]>(`/reviews/product/${productId}`);
    return response.data;
  },
};

export default apiClient;
