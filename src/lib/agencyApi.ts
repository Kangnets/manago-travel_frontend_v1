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
import {
  DEV_MOCK_RESERVATIONS,
  DEV_MOCK_PRODUCTS,
  DEV_MOCK_DASHBOARD_STATS,
  DEV_MOCK_PRODUCT_STATS,
  DEV_MOCK_PAYMENTS,
  DEV_MOCK_SETTLEMENT_SUMMARY,
  DEV_MOCK_REVIEWS,
  paginateMock,
} from './devMockAgencyData';

const IS_DEV = process.env.NODE_ENV === 'development';

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
    try {
      const response = await apiClient.get<{
        data: Product[];
        total: number;
        page: number;
        limit: number;
      }>('/products/agency/my', { params });
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        let items = DEV_MOCK_PRODUCTS;
        if (params?.category) items = items.filter((p) => p.category === params.category);
        if (params?.isActive !== undefined) items = items.filter((p) => p.isActive === params.isActive);
        return paginateMock(items, params?.page, params?.limit);
      }
      throw err;
    }
  },

  // 내 상품 통계
  getMyProductStats: async () => {
    try {
      const response = await apiClient.get<{
        totalProducts: number;
        activeProducts: number;
        categoryBreakdown: { category: string; count: number }[];
      }>('/products/agency/stats');
      return response.data;
    } catch (err) {
      if (IS_DEV) return DEV_MOCK_PRODUCT_STATS;
      throw err;
    }
  },

  // 상품 생성
  create: async (data: Partial<Product>) => {
    try {
      const response = await apiClient.post<Product>('/products', data);
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        return { ...data, id: `prod-dev-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Product;
      }
      throw err;
    }
  },

  // 상품 수정
  update: async (id: string, data: Partial<Product>) => {
    try {
      const response = await apiClient.patch<Product>(`/products/agency/${id}`, data);
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        const existing = DEV_MOCK_PRODUCTS.find((p) => p.id === id) || DEV_MOCK_PRODUCTS[0];
        return { ...existing, ...data } as Product;
      }
      throw err;
    }
  },

  // 상품 삭제
  delete: async (id: string) => {
    try {
      await apiClient.delete(`/products/agency/${id}`);
    } catch (err) {
      if (IS_DEV) return;
      throw err;
    }
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
    try {
      const response = await apiClient.get<ReservationListResponse>('/reservations', {
        params,
      });
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        let items = [...DEV_MOCK_RESERVATIONS];
        if (params?.status) items = items.filter((r) => r.status === params.status);
        if (params?.startDate) items = items.filter((r) => r.departureDate >= params.startDate!);
        if (params?.endDate) items = items.filter((r) => r.departureDate <= params.endDate!);
        if (params?.search) {
          const q = params.search.toLowerCase();
          items = items.filter(
            (r) =>
              r.contactName?.toLowerCase().includes(q) ||
              r.product?.title?.toLowerCase().includes(q) ||
              r.reservationNumber.toLowerCase().includes(q),
          );
        }
        const result = paginateMock(items, params?.page, params?.limit || 200);
        return { data: result.data, total: result.total, page: result.page, limit: result.limit } as ReservationListResponse;
      }
      throw err;
    }
  },

  // 예약 상세
  getById: async (id: string) => {
    try {
      const response = await apiClient.get<Reservation>(`/reservations/${id}`);
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        const found = DEV_MOCK_RESERVATIONS.find((r) => r.id === id);
        if (found) return found;
        throw new Error(`[DEV] Reservation ${id} not found`);
      }
      throw err;
    }
  },

  // 예약 생성
  create: async (data: CreateReservationRequest) => {
    try {
      const response = await apiClient.post<Reservation>('/reservations', data);
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        const now = new Date().toISOString();
        return {
          ...data,
          id: `res-dev-${Date.now()}`,
          reservationNumber: `MG${Date.now()}`,
          agencyId: 'dev-agency-001',
          status: 'pending',
          paidAmount: 0,
          createdAt: now,
          updatedAt: now,
        } as Reservation;
      }
      throw err;
    }
  },

  // 예약 수정
  update: async (id: string, data: UpdateReservationRequest) => {
    try {
      const response = await apiClient.patch<Reservation>(`/reservations/${id}`, data);
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        const existing = DEV_MOCK_RESERVATIONS.find((r) => r.id === id) || DEV_MOCK_RESERVATIONS[0];
        return { ...existing, ...data, updatedAt: new Date().toISOString() } as Reservation;
      }
      throw err;
    }
  },

  // 예약 상태 변경
  updateStatus: async (id: string, status: ReservationStatus) => {
    try {
      const response = await apiClient.patch<Reservation>(`/reservations/${id}/status`, {
        status,
      });
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        const existing = DEV_MOCK_RESERVATIONS.find((r) => r.id === id) || DEV_MOCK_RESERVATIONS[0];
        return { ...existing, status, updatedAt: new Date().toISOString() } as Reservation;
      }
      throw err;
    }
  },

  // 예약 삭제
  delete: async (id: string) => {
    try {
      await apiClient.delete(`/reservations/${id}`);
    } catch (err) {
      if (IS_DEV) return;
      throw err;
    }
  },

  // 대시보드 통계
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get<DashboardStats>('/reservations/dashboard/stats');
      return response.data;
    } catch (err) {
      if (IS_DEV) return DEV_MOCK_DASHBOARD_STATS;
      throw err;
    }
  },

  // 최근 예약
  getRecentReservations: async (limit: number = 5) => {
    try {
      const response = await apiClient.get<Reservation[]>('/reservations/dashboard/recent', {
        params: { limit },
      });
      return response.data;
    } catch (err) {
      if (IS_DEV) return DEV_MOCK_RESERVATIONS.slice(0, limit);
      throw err;
    }
  },

  // 일반 고객용 본인 예약 조회 (customerId 또는 agencyId로 등록된 예약)
  getCustomerReservations: async (params?: { status?: ReservationStatus; page?: number; limit?: number }) => {
    try {
      const response = await apiClient.get<ReservationListResponse>('/reservations/customer/my', { params });
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        const result = paginateMock(DEV_MOCK_RESERVATIONS, params?.page, params?.limit);
        return { data: result.data, total: result.total, page: result.page, limit: result.limit } as ReservationListResponse;
      }
      throw err;
    }
  },
};

// 여행자 관리 API
export const travelerAPI = {
  // 여행자 목록
  getAll: async (reservationId: string) => {
    try {
      const response = await apiClient.get<Traveler[]>(
        `/reservations/${reservationId}/travelers`
      );
      return response.data;
    } catch (err) {
      if (IS_DEV) return [] as Traveler[];
      throw err;
    }
  },

  // 여행자 추가
  create: async (reservationId: string, data: CreateTravelerRequest) => {
    try {
      const response = await apiClient.post<Traveler>(
        `/reservations/${reservationId}/travelers`,
        data
      );
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        return { id: `trv-${Date.now()}`, reservationId, ...data } as unknown as Traveler;
      }
      throw err;
    }
  },

  // 여행자 수정
  update: async (
    reservationId: string,
    travelerId: string,
    data: UpdateTravelerRequest
  ) => {
    try {
      const response = await apiClient.patch<Traveler>(
        `/reservations/${reservationId}/travelers/${travelerId}`,
        data
      );
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        return { id: travelerId, reservationId, ...data } as unknown as Traveler;
      }
      throw err;
    }
  },

  // 여행자 삭제
  delete: async (reservationId: string, travelerId: string) => {
    try {
      await apiClient.delete(
        `/reservations/${reservationId}/travelers/${travelerId}`
      );
    } catch (err) {
      if (IS_DEV) return;
      throw err;
    }
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
    try {
      const response = await apiClient.get<PaymentListResponse>('/payments', {
        params,
      });
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        let items = [...DEV_MOCK_PAYMENTS];
        if (params?.status) items = items.filter((p) => p.status === params.status);
        const result = paginateMock(items, params?.page, params?.limit);
        return { data: result.data, total: result.total, page: result.page, limit: result.limit } as PaymentListResponse;
      }
      throw err;
    }
  },

  // 결제 상세
  getById: async (id: string) => {
    try {
      const response = await apiClient.get<Payment>(`/payments/${id}`);
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        const found = DEV_MOCK_PAYMENTS.find((p) => p.id === id);
        if (found) return found;
        throw new Error(`[DEV] Payment ${id} not found`);
      }
      throw err;
    }
  },

  // 결제 등록
  create: async (data: CreatePaymentRequest) => {
    try {
      const response = await apiClient.post<Payment>('/payments', data);
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        const now = new Date().toISOString();
        return { id: `pay-dev-${Date.now()}`, status: 'pending', createdAt: now, updatedAt: now, ...data } as Payment;
      }
      throw err;
    }
  },

  // 결제 수정 (상태 변경)
  update: async (id: string, data: UpdatePaymentRequest) => {
    try {
      const response = await apiClient.patch<Payment>(`/payments/${id}`, data);
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        const existing = DEV_MOCK_PAYMENTS.find((p) => p.id === id) || DEV_MOCK_PAYMENTS[0];
        return { ...existing, ...data, updatedAt: new Date().toISOString() } as Payment;
      }
      throw err;
    }
  },

  // 결제 삭제
  delete: async (id: string) => {
    try {
      await apiClient.delete(`/payments/${id}`);
    } catch (err) {
      if (IS_DEV) return;
      throw err;
    }
  },

  // 정산 요약 (월별)
  getSettlementSummary: async (year?: number) => {
    try {
      const response = await apiClient.get<SettlementSummary[]>(
        '/payments/settlements/summary',
        { params: { year } }
      );
      return response.data;
    } catch (err) {
      if (IS_DEV) return DEV_MOCK_SETTLEMENT_SUMMARY;
      throw err;
    }
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

const DEV_MOCK_ATTENDANCE_STATS: AttendanceStatistics = {
  totalDays: 20,
  presentDays: 18,
  lateDays: 1,
  earlyLeaveDays: 0,
  absentDays: 1,
  totalWorkHours: 144,
  averageWorkHours: 8,
};

export const attendanceAPI = {
  // 출근 등록
  checkIn: async (data: { employeeId: string; employeeName: string; memo?: string }) => {
    try {
      const response = await apiClient.post<AttendanceRecord>('/attendance/check-in', data);
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        const now = new Date().toISOString();
        return { id: `att-${Date.now()}`, agencyId: 'dev-agency-001', date: now.slice(0, 10), checkIn: now, status: 'present', created: now, updated: now, ...data } as AttendanceRecord;
      }
      throw err;
    }
  },

  // 퇴근 등록
  checkOut: async (data?: { memo?: string }) => {
    try {
      const response = await apiClient.post<AttendanceRecord>('/attendance/check-out', data || {});
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        const now = new Date().toISOString();
        return { id: `att-out-${Date.now()}`, agencyId: 'dev-agency-001', employeeId: 'dev-agency-001', employeeName: '김망고', date: now.slice(0, 10), checkOut: now, status: 'present', created: now, updated: now } as AttendanceRecord;
      }
      throw err;
    }
  },

  // 오늘 근태 기록 조회 (사장은 employeeId로 특정 직원 조회 가능)
  getTodayRecord: async (employeeId?: string) => {
    try {
      const response = await apiClient.get<AttendanceRecord | null>('/attendance/today', {
        params: employeeId ? { employeeId } : undefined,
      });
      return response.data;
    } catch (err) {
      if (IS_DEV) return null;
      throw err;
    }
  },

  // 사장 전용: 소속 직원 목록 (본인 + 직원들)
  getEmployees: async () => {
    try {
      const response = await apiClient.get<{ id: string; name: string; email: string; role: 'owner' | 'employee' }[]>('/attendance/employees');
      return response.data;
    } catch (err) {
      if (IS_DEV) return [{ id: 'dev-agency-001', name: '김망고', email: 'owner@mango-travel.dev', role: 'owner' as const }];
      throw err;
    }
  },

  // 사장 전용: 오늘 전체 직원 근태 현황
  getTodayAll: async () => {
    try {
      const response = await apiClient.get<{
        employeeId: string;
        employeeName: string;
        email: string;
        role: 'owner' | 'employee';
        record: AttendanceRecord | null;
      }[]>('/attendance/today-all');
      return response.data;
    } catch (err) {
      if (IS_DEV) return [{ employeeId: 'dev-agency-001', employeeName: '김망고', email: 'owner@mango-travel.dev', role: 'owner' as const, record: null }];
      throw err;
    }
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
    try {
      const response = await apiClient.get<AttendanceListResponse>('/attendance', { params });
      return response.data;
    } catch (err) {
      if (IS_DEV) return { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 20 } as AttendanceListResponse;
      throw err;
    }
  },

  // 근태 기록 상세
  getById: async (id: string) => {
    try {
      const response = await apiClient.get<AttendanceRecord>(`/attendance/${id}`);
      return response.data;
    } catch (err) {
      if (IS_DEV) throw new Error(`[DEV] Attendance ${id} not found`);
      throw err;
    }
  },

  // 근태 기록 수정
  update: async (id: string, data: Partial<AttendanceRecord>) => {
    try {
      const response = await apiClient.patch<AttendanceRecord>(`/attendance/${id}`, data);
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        const now = new Date().toISOString();
        return { id, agencyId: 'dev-agency-001', employeeId: 'dev-agency-001', employeeName: '김망고', date: now.slice(0, 10), status: 'present', created: now, updated: now, ...data } as AttendanceRecord;
      }
      throw err;
    }
  },

  // 근태 기록 삭제
  delete: async (id: string) => {
    try {
      await apiClient.delete(`/attendance/${id}`);
    } catch (err) {
      if (IS_DEV) return;
      throw err;
    }
  },

  // 근태 통계
  getStatistics: async (params?: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      const response = await apiClient.get<AttendanceStatistics>('/attendance/statistics', { params });
      return response.data;
    } catch (err) {
      if (IS_DEV) return DEV_MOCK_ATTENDANCE_STATS;
      throw err;
    }
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

const DEV_MOCK_NOTICES: NoticeRecord[] = [
  {
    id: 'notice-001',
    title: '[안내] 2026년 봄 시즌 상품 업데이트',
    content: '베트남 봄 시즌 신규 상품이 등록되었습니다. 다낭, 푸꾸옥 패키지를 확인해보세요.',
    category: 'general',
    isPublished: true,
    isPinned: true,
    authorId: 'dev-agency-001',
    authorName: '관리자',
    viewCount: 42,
    created: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    updated: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notice-002',
    title: '[시스템] 예약 확인 프로세스 변경 안내',
    content: '예약 확인 후 24시간 이내에 결제가 완료되지 않을 경우 자동 취소됩니다.',
    category: 'system',
    isPublished: true,
    isPinned: false,
    authorId: 'dev-agency-001',
    authorName: '관리자',
    viewCount: 18,
    created: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    updated: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  },
];

export const noticesAPI = {
  getAll: async (params?: { category?: string; page?: number; limit?: number; my?: boolean }) => {
    try {
      const response = await apiClient.get<NoticeListResponse>('/notices', { params });
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        let items = [...DEV_MOCK_NOTICES];
        if (params?.category) items = items.filter((n) => n.category === params.category);
        const result = paginateMock(items, params?.page, params?.limit);
        return { data: result.data, total: result.total, page: result.page, limit: result.limit } as NoticeListResponse;
      }
      throw err;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await apiClient.get<NoticeRecord>(`/notices/${id}`);
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        const found = DEV_MOCK_NOTICES.find((n) => n.id === id);
        if (found) return found;
        throw new Error(`[DEV] Notice ${id} not found`);
      }
      throw err;
    }
  },

  create: async (data: { title: string; content: string; category?: string; isPinned?: boolean }) => {
    try {
      const response = await apiClient.post<NoticeRecord>('/notices', data);
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        const now = new Date().toISOString();
        return { id: `notice-dev-${Date.now()}`, isPublished: true, isPinned: false, authorId: 'dev-agency-001', viewCount: 0, created: now, updated: now, category: 'general', ...data } as NoticeRecord;
      }
      throw err;
    }
  },

  update: async (id: string, data: Partial<{ title: string; content: string; category: string; isPublished: boolean; isPinned: boolean }>) => {
    try {
      const response = await apiClient.patch<NoticeRecord>(`/notices/${id}`, data);
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        const existing = DEV_MOCK_NOTICES.find((n) => n.id === id) || DEV_MOCK_NOTICES[0];
        return { ...existing, ...data, updated: new Date().toISOString() } as NoticeRecord;
      }
      throw err;
    }
  },

  delete: async (id: string) => {
    try {
      await apiClient.delete(`/notices/${id}`);
    } catch (err) {
      if (IS_DEV) return;
      throw err;
    }
  },
};

// 리뷰 관리 API (여행사: 내 상품에 달린 리뷰)
export const agencyReviewAPI = {
  getMyProductReviews: async (limit?: number) => {
    try {
      const response = await apiClient.get<Review[]>('/reviews/agency/my', {
        params: limit ? { limit } : undefined,
      });
      return response.data;
    } catch (err) {
      if (IS_DEV) return limit ? DEV_MOCK_REVIEWS.slice(0, limit) : DEV_MOCK_REVIEWS;
      throw err;
    }
  },
  deactivate: async (id: string) => {
    try {
      const response = await apiClient.patch<Review>(`/reviews/agency/${id}/deactivate`);
      return response.data;
    } catch (err) {
      if (IS_DEV) {
        const found = DEV_MOCK_REVIEWS.find((r) => r.id === id) || DEV_MOCK_REVIEWS[0];
        return { ...found, isActive: false } as Review;
      }
      throw err;
    }
  },
};
