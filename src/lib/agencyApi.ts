import axios from 'axios';
import {
  Reservation,
  ReservationListResponse,
  CreateReservationRequest,
  UpdateReservationRequest,
  Traveler,
  CreateTravelerRequest,
  UpdateTravelerRequest,
  DashboardStats,
  ReservationStatus,
} from '@/types/reservation';
import {
  Payment,
  PaymentListResponse,
  CreatePaymentRequest,
  UpdatePaymentRequest,
  SettlementSummary,
  PaymentStatus,
} from '@/types/payment';
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

// 상품 관리 API
export const agencyProductAPI = {
  // 내 상품 목록
  getMyProducts: async (params?: {
    category?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<{
      data: Product[];
      total: number;
      page: number;
      limit: number;
    }>('/products/agency/my', { params });
    return response.data;
  },

  // 내 상품 통계
  getMyProductStats: async () => {
    const response = await apiClient.get<{
      totalProducts: number;
      activeProducts: number;
      categoryBreakdown: { category: string; count: number }[];
    }>('/products/agency/stats');
    return response.data;
  },

  // 상품 생성
  create: async (data: Partial<Product>) => {
    const response = await apiClient.post<Product>('/products', data);
    return response.data;
  },

  // 상품 수정
  update: async (id: string, data: Partial<Product>) => {
    const response = await apiClient.patch<Product>(`/products/agency/${id}`, data);
    return response.data;
  },

  // 상품 삭제
  delete: async (id: string) => {
    await apiClient.delete(`/products/agency/${id}`);
  },
};

// 예약 관리 API
export const reservationAPI = {
  // 예약 목록
  getAll: async (params?: {
    status?: ReservationStatus;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ReservationListResponse>('/reservations', {
      params,
    });
    return response.data;
  },

  // 예약 상세
  getById: async (id: string) => {
    const response = await apiClient.get<Reservation>(`/reservations/${id}`);
    return response.data;
  },

  // 예약 생성
  create: async (data: CreateReservationRequest) => {
    const response = await apiClient.post<Reservation>('/reservations', data);
    return response.data;
  },

  // 예약 수정
  update: async (id: string, data: UpdateReservationRequest) => {
    const response = await apiClient.patch<Reservation>(`/reservations/${id}`, data);
    return response.data;
  },

  // 예약 상태 변경
  updateStatus: async (id: string, status: ReservationStatus) => {
    const response = await apiClient.patch<Reservation>(`/reservations/${id}/status`, {
      status,
    });
    return response.data;
  },

  // 예약 삭제
  delete: async (id: string) => {
    await apiClient.delete(`/reservations/${id}`);
  },

  // 대시보드 통계
  getDashboardStats: async () => {
    const response = await apiClient.get<DashboardStats>('/reservations/dashboard/stats');
    return response.data;
  },

  // 최근 예약
  getRecentReservations: async (limit: number = 5) => {
    const response = await apiClient.get<Reservation[]>('/reservations/dashboard/recent', {
      params: { limit },
    });
    return response.data;
  },

  // 일반 고객용 본인 예약 조회 (customerId 또는 agencyId로 등록된 예약)
  getCustomerReservations: async (params?: { status?: ReservationStatus; page?: number; limit?: number }) => {
    const response = await apiClient.get<ReservationListResponse>('/reservations/customer/my', { params });
    return response.data;
  },
};

// 여행자 관리 API
export const travelerAPI = {
  // 여행자 목록
  getAll: async (reservationId: string) => {
    const response = await apiClient.get<Traveler[]>(
      `/reservations/${reservationId}/travelers`
    );
    return response.data;
  },

  // 여행자 추가
  create: async (reservationId: string, data: CreateTravelerRequest) => {
    const response = await apiClient.post<Traveler>(
      `/reservations/${reservationId}/travelers`,
      data
    );
    return response.data;
  },

  // 여행자 수정
  update: async (
    reservationId: string,
    travelerId: string,
    data: UpdateTravelerRequest
  ) => {
    const response = await apiClient.patch<Traveler>(
      `/reservations/${reservationId}/travelers/${travelerId}`,
      data
    );
    return response.data;
  },

  // 여행자 삭제
  delete: async (reservationId: string, travelerId: string) => {
    await apiClient.delete(
      `/reservations/${reservationId}/travelers/${travelerId}`
    );
  },
};

// 결제 관리 API
export const paymentAPI = {
  // 결제 내역 목록
  getAll: async (params?: {
    startDate?: string;
    endDate?: string;
    status?: PaymentStatus;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<PaymentListResponse>('/payments', {
      params,
    });
    return response.data;
  },

  // 결제 상세
  getById: async (id: string) => {
    const response = await apiClient.get<Payment>(`/payments/${id}`);
    return response.data;
  },

  // 결제 등록
  create: async (data: CreatePaymentRequest) => {
    const response = await apiClient.post<Payment>('/payments', data);
    return response.data;
  },

  // 결제 수정 (상태 변경)
  update: async (id: string, data: UpdatePaymentRequest) => {
    const response = await apiClient.patch<Payment>(`/payments/${id}`, data);
    return response.data;
  },

  // 결제 삭제
  delete: async (id: string) => {
    await apiClient.delete(`/payments/${id}`);
  },

  // 정산 요약 (월별)
  getSettlementSummary: async (year?: number) => {
    const response = await apiClient.get<SettlementSummary[]>(
      '/payments/settlements/summary',
      { params: { year } }
    );
    return response.data;
  },
};

// 근태 관리 API
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'early-leave' | 'half-day';

export interface AttendanceRecord {
  id: string;
  agencyId: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  workHours?: number;
  status: AttendanceStatus;
  memo?: string;
  created: string;
  updated: string;
}

export interface AttendanceListResponse {
  data: AttendanceRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface AttendanceStatistics {
  totalDays: number;
  presentDays: number;
  lateDays: number;
  earlyLeaveDays: number;
  absentDays: number;
  totalWorkHours: number;
  averageWorkHours: number;
}

export const attendanceAPI = {
  // 출근 등록
  checkIn: async (data: { employeeId: string; employeeName: string; memo?: string }) => {
    const response = await apiClient.post<AttendanceRecord>('/attendance/check-in', data);
    return response.data;
  },

  // 퇴근 등록
  checkOut: async (data?: { memo?: string }) => {
    const response = await apiClient.post<AttendanceRecord>('/attendance/check-out', data || {});
    return response.data;
  },

  // 오늘 근태 기록 조회 (사장은 employeeId로 특정 직원 조회 가능)
  getTodayRecord: async (employeeId?: string) => {
    const response = await apiClient.get<AttendanceRecord | null>('/attendance/today', {
      params: employeeId ? { employeeId } : undefined,
    });
    return response.data;
  },

  // 사장 전용: 소속 직원 목록 (본인 + 직원들)
  getEmployees: async () => {
    const response = await apiClient.get<{ id: string; name: string; email: string; role: 'owner' | 'employee' }[]>('/attendance/employees');
    return response.data;
  },

  // 사장 전용: 오늘 전체 직원 근태 현황
  getTodayAll: async () => {
    const response = await apiClient.get<{
      employeeId: string;
      employeeName: string;
      email: string;
      role: 'owner' | 'employee';
      record: AttendanceRecord | null;
    }[]>('/attendance/today-all');
    return response.data;
  },

  // 근태 기록 목록
  getAll: async (params?: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    status?: AttendanceStatus;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<AttendanceListResponse>('/attendance', { params });
    return response.data;
  },

  // 근태 기록 상세
  getById: async (id: string) => {
    const response = await apiClient.get<AttendanceRecord>(`/attendance/${id}`);
    return response.data;
  },

  // 근태 기록 수정
  update: async (id: string, data: Partial<AttendanceRecord>) => {
    const response = await apiClient.patch<AttendanceRecord>(`/attendance/${id}`, data);
    return response.data;
  },

  // 근태 기록 삭제
  delete: async (id: string) => {
    await apiClient.delete(`/attendance/${id}`);
  },

  // 근태 통계
  getStatistics: async (params?: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get<AttendanceStatistics>('/attendance/statistics', { params });
    return response.data;
  },
};

// 엑셀 다운로드 API
export const excelAPI = {
  // 예약 목록 엑셀 다운로드
  downloadReservations: async (params?: {
    status?: ReservationStatus;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get('/reservations/export/excel', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // 여행자 목록 엑셀 다운로드
  downloadTravelers: async (reservationId: string) => {
    const response = await apiClient.get(
      `/reservations/${reservationId}/travelers/export/excel`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // 정산 내역 엑셀 다운로드
  downloadSettlements: async (params?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get('/payments/settlements/export/excel', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

// 공지사항 API
export interface NoticeRecord {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'urgent' | 'system' | 'travel';
  isPublished: boolean;
  isPinned: boolean;
  authorId: string;
  authorName?: string;
  viewCount: number;
  created: string;
  updated: string;
}

export interface NoticeListResponse {
  data: NoticeRecord[];
  total: number;
  page: number;
  limit: number;
}

export const noticesAPI = {
  getAll: async (params?: { category?: string; page?: number; limit?: number; my?: boolean }) => {
    const response = await apiClient.get<NoticeListResponse>('/notices', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<NoticeRecord>(`/notices/${id}`);
    return response.data;
  },

  create: async (data: { title: string; content: string; category?: string; isPinned?: boolean }) => {
    const response = await apiClient.post<NoticeRecord>('/notices', data);
    return response.data;
  },

  update: async (id: string, data: Partial<{ title: string; content: string; category: string; isPublished: boolean; isPinned: boolean }>) => {
    const response = await apiClient.patch<NoticeRecord>(`/notices/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/notices/${id}`);
  },
};

// 리뷰 관리 API (여행사: 내 상품에 달린 리뷰)
export const agencyReviewAPI = {
  getMyProductReviews: async (limit?: number) => {
    const response = await apiClient.get<Review[]>('/reviews/agency/my', {
      params: limit ? { limit } : undefined,
    });
    return response.data;
  },
  deactivate: async (id: string) => {
    const response = await apiClient.patch<Review>(`/reviews/agency/${id}/deactivate`);
    return response.data;
  },
};
