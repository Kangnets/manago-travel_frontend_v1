import axios from 'axios';
import { Product, Review } from '@/types/product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/agency/login')) {
        // 인증 만료 시 조용히 처리 (리다이렉트는 AuthContext에서 처리)
      }
    }
    return Promise.reject(error);
  }
);

// Product API
export const productAPI = {
  getAll: async (params?: { category?: string; location?: string; limit?: number }) => {
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

// 예약 API (손님용)
export const reservationAPI = {
  create: async (data: {
    productId: string;
    departureDate: string;
    returnDate?: string;
    adultCount: number;
    childCount?: number;
    infantCount?: number;
    totalAmount: number;
    contactName: string;
    contactPhone: string;
    contactEmail?: string;
    memo?: string;
  }) => {
    const response = await apiClient.post('/reservations', data);
    return response.data;
  },

  getMyReservations: async () => {
    const response = await apiClient.get('/reservations');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/reservations/${id}`);
    return response.data;
  },
};

export default apiClient;
