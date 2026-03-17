/**
 * 개발 환경 전용 Mock 데이터
 * process.env.NODE_ENV === 'development' 일 때만 사용됩니다.
 */

import { Reservation, DashboardStats, ReservationListResponse } from '@/types/reservation';
import { Product, Review } from '@/types/product';
import { User, UserType } from '@/types/auth';
import { Payment, SettlementSummary } from '@/types/payment';

// ─────────────────────────────────────────────
// 개발용 Mock 여행사 유저
// ─────────────────────────────────────────────
export const DEV_MOCK_AGENCY_USER: Omit<User, 'password'> = {
  id: 'dev-agency-001',
  email: 'admin@mango-travel.dev',
  name: '김망고',
  phone: '010-1234-5678',
  userType: UserType.AGENCY,
  agencyName: '망고트래블 테스트',
  agencyEmail: 'contact@mango-travel.dev',
  businessNumber: '123-45-67890',
  licenseNumber: '제2024-000001호',
  address: '서울특별시 강남구 테헤란로 123',
  agencyRole: 'owner',
  isActive: true,
  isVerified: true,
};

// ─────────────────────────────────────────────
// 날짜 헬퍼
// ─────────────────────────────────────────────
function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function isoFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

// ─────────────────────────────────────────────
// Mock 상품 목록
// ─────────────────────────────────────────────
export const DEV_MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    title: '다낭 바나힐 & 골든브릿지 투어',
    location: '다낭',
    country: '베트남',
    duration: '1일',
    price: 89000,
    originalPrice: 120000,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    category: 'tour',
    isActive: true,
    agencyId: 'dev-agency-001',
    createdAt: isoFromNow(-30),
    updatedAt: isoFromNow(-5),
  },
  {
    id: 'prod-002',
    title: '푸꾸옥 오션뷰 챔피언십 라운드',
    location: '푸꾸옥',
    country: '베트남',
    duration: '18홀',
    price: 230000,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800',
    category: 'golf',
    isActive: true,
    agencyId: 'dev-agency-001',
    createdAt: isoFromNow(-60),
    updatedAt: isoFromNow(-2),
  },
  {
    id: 'prod-003',
    title: '하노이 & 하롱베이 3박 5일 패키지',
    location: '하노이',
    country: '베트남',
    duration: '3박 5일',
    price: 890000,
    originalPrice: 1190000,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
    category: 'tour',
    isActive: true,
    agencyId: 'dev-agency-001',
    createdAt: isoFromNow(-45),
    updatedAt: isoFromNow(-7),
  },
  {
    id: 'prod-004',
    title: '나트랑 빈펄 리조트 2박 3일',
    location: '나트랑',
    country: '베트남',
    duration: '2박 3일',
    price: 590000,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
    category: 'hotel',
    isActive: false,
    agencyId: 'dev-agency-001',
    createdAt: isoFromNow(-90),
    updatedAt: isoFromNow(-20),
  },
  {
    id: 'prod-005',
    title: '호치민 메콩델타 투어',
    location: '호치민',
    country: '베트남',
    duration: '1일',
    price: 75000,
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    category: 'tour',
    isActive: true,
    agencyId: 'dev-agency-001',
    createdAt: isoFromNow(-20),
    updatedAt: isoFromNow(-1),
  },
];

// ─────────────────────────────────────────────
// Mock 예약 목록
// ─────────────────────────────────────────────
export const DEV_MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'res-001',
    reservationNumber: 'MG20260310-001',
    productId: 'prod-001',
    product: {
      id: 'prod-001',
      title: '다낭 바나힐 & 골든브릿지 투어',
      location: '다낭',
      country: '베트남',
      duration: '1일',
      price: 89000,
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      category: 'tour',
    },
    agencyId: 'dev-agency-001',
    status: 'confirmed',
    departureDate: daysFromNow(2),
    returnDate: daysFromNow(2),
    adultCount: 2,
    childCount: 1,
    infantCount: 0,
    totalAmount: 267000,
    paidAmount: 267000,
    contactName: '이수진',
    contactPhone: '010-2345-6789',
    contactEmail: 'lee@example.com',
    memo: '알러지 없음. 창가 자리 요청.',
    createdAt: isoFromNow(-3),
    updatedAt: isoFromNow(-1),
  },
  {
    id: 'res-002',
    reservationNumber: 'MG20260310-002',
    productId: 'prod-002',
    product: {
      id: 'prod-002',
      title: '푸꾸옥 오션뷰 챔피언십 라운드',
      location: '푸꾸옥',
      country: '베트남',
      duration: '18홀',
      price: 230000,
      imageUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800',
      category: 'golf',
    },
    agencyId: 'dev-agency-001',
    status: 'pending',
    departureDate: daysFromNow(4),
    returnDate: daysFromNow(4),
    adultCount: 4,
    childCount: 0,
    infantCount: 0,
    totalAmount: 920000,
    paidAmount: 460000,
    contactName: '박준혁',
    contactPhone: '010-3456-7890',
    contactEmail: 'park@example.com',
    memo: '캐디 요청',
    createdAt: isoFromNow(-5),
    updatedAt: isoFromNow(-2),
  },
  {
    id: 'res-003',
    reservationNumber: 'MG20260310-003',
    productId: 'prod-003',
    product: {
      id: 'prod-003',
      title: '하노이 & 하롱베이 3박 5일 패키지',
      location: '하노이',
      country: '베트남',
      duration: '3박 5일',
      price: 890000,
      imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
      category: 'tour',
    },
    agencyId: 'dev-agency-001',
    status: 'confirmed',
    departureDate: daysFromNow(6),
    returnDate: daysFromNow(10),
    adultCount: 2,
    childCount: 0,
    infantCount: 0,
    totalAmount: 1780000,
    paidAmount: 1780000,
    contactName: '김민정',
    contactPhone: '010-4567-8901',
    contactEmail: 'kim@example.com',
    memo: '신혼여행. 허니문 패키지 요청.',
    createdAt: isoFromNow(-10),
    updatedAt: isoFromNow(-3),
  },
  {
    id: 'res-004',
    reservationNumber: 'MG20260308-004',
    productId: 'prod-005',
    product: {
      id: 'prod-005',
      title: '호치민 메콩델타 투어',
      location: '호치민',
      country: '베트남',
      duration: '1일',
      price: 75000,
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      category: 'tour',
    },
    agencyId: 'dev-agency-001',
    status: 'completed',
    departureDate: daysFromNow(-5),
    returnDate: daysFromNow(-5),
    adultCount: 3,
    childCount: 2,
    infantCount: 0,
    totalAmount: 375000,
    paidAmount: 375000,
    contactName: '최영호',
    contactPhone: '010-5678-9012',
    contactEmail: 'choi@example.com',
    createdAt: isoFromNow(-20),
    updatedAt: isoFromNow(-5),
  },
  {
    id: 'res-005',
    reservationNumber: 'MG20260305-005',
    productId: 'prod-002',
    product: {
      id: 'prod-002',
      title: '푸꾸옥 오션뷰 챔피언십 라운드',
      location: '푸꾸옥',
      country: '베트남',
      duration: '18홀',
      price: 230000,
      imageUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800',
      category: 'golf',
    },
    agencyId: 'dev-agency-001',
    status: 'cancelled',
    departureDate: daysFromNow(15),
    returnDate: daysFromNow(15),
    adultCount: 2,
    childCount: 0,
    infantCount: 0,
    totalAmount: 460000,
    paidAmount: 0,
    contactName: '정다은',
    contactPhone: '010-6789-0123',
    contactEmail: 'jung@example.com',
    memo: '고객 사정으로 취소',
    createdAt: isoFromNow(-15),
    updatedAt: isoFromNow(-8),
  },
  {
    id: 'res-006',
    reservationNumber: 'MG20260310-006',
    productId: 'prod-001',
    product: {
      id: 'prod-001',
      title: '다낭 바나힐 & 골든브릿지 투어',
      location: '다낭',
      country: '베트남',
      duration: '1일',
      price: 89000,
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      category: 'tour',
    },
    agencyId: 'dev-agency-001',
    status: 'pending',
    departureDate: daysFromNow(1),
    returnDate: daysFromNow(1),
    adultCount: 5,
    childCount: 2,
    infantCount: 1,
    totalAmount: 623000,
    paidAmount: 300000,
    contactName: '오세훈',
    contactPhone: '010-7890-1234',
    contactEmail: 'oh@example.com',
    memo: '유아 동반. 유모차 공간 필요.',
    createdAt: isoFromNow(-2),
    updatedAt: isoFromNow(-1),
  },
  {
    id: 'res-007',
    reservationNumber: 'MG20260225-007',
    productId: 'prod-003',
    product: {
      id: 'prod-003',
      title: '하노이 & 하롱베이 3박 5일 패키지',
      location: '하노이',
      country: '베트남',
      duration: '3박 5일',
      price: 890000,
      imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
      category: 'tour',
    },
    agencyId: 'dev-agency-001',
    status: 'completed',
    departureDate: daysFromNow(-12),
    returnDate: daysFromNow(-7),
    adultCount: 2,
    childCount: 1,
    infantCount: 0,
    totalAmount: 2670000,
    paidAmount: 2670000,
    contactName: '강지현',
    contactPhone: '010-8901-2345',
    createdAt: isoFromNow(-30),
    updatedAt: isoFromNow(-7),
  },
  {
    id: 'res-008',
    reservationNumber: 'MG20260310-008',
    productId: 'prod-005',
    product: {
      id: 'prod-005',
      title: '호치민 메콩델타 투어',
      location: '호치민',
      country: '베트남',
      duration: '1일',
      price: 75000,
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      category: 'tour',
    },
    agencyId: 'dev-agency-001',
    status: 'confirmed',
    departureDate: daysFromNow(3),
    returnDate: daysFromNow(3),
    adultCount: 6,
    childCount: 0,
    infantCount: 0,
    totalAmount: 450000,
    paidAmount: 450000,
    contactName: '윤태양',
    contactPhone: '010-9012-3456',
    contactEmail: 'yoon@example.com',
    createdAt: isoFromNow(-4),
    updatedAt: isoFromNow(-1),
  },
];

// ─────────────────────────────────────────────
// 대시보드 통계
// ─────────────────────────────────────────────
export const DEV_MOCK_DASHBOARD_STATS: DashboardStats = {
  totalReservations: DEV_MOCK_RESERVATIONS.length,
  pendingReservations: DEV_MOCK_RESERVATIONS.filter((r) => r.status === 'pending').length,
  confirmedReservations: DEV_MOCK_RESERVATIONS.filter((r) => r.status === 'confirmed').length,
  thisMonthRevenue: DEV_MOCK_RESERVATIONS
    .filter((r) => r.status !== 'cancelled')
    .reduce((sum, r) => sum + r.paidAmount, 0),
  lastMonthRevenue: 4_120_000,
};

// ─────────────────────────────────────────────
// Mock 상품 통계
// ─────────────────────────────────────────────
export const DEV_MOCK_PRODUCT_STATS = {
  totalProducts: DEV_MOCK_PRODUCTS.length,
  activeProducts: DEV_MOCK_PRODUCTS.filter((p) => p.isActive).length,
  categoryBreakdown: [
    { category: 'tour', count: 3 },
    { category: 'golf', count: 1 },
    { category: 'hotel', count: 1 },
  ],
};

// ─────────────────────────────────────────────
// Mock 결제 내역
// ─────────────────────────────────────────────
export const DEV_MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pay-001',
    reservationId: 'res-001',
    amount: 267000,
    paymentMethod: 'card',
    status: 'completed',
    paidAt: isoFromNow(-2),
    createdAt: isoFromNow(-3),
    updatedAt: isoFromNow(-2),
  },
  {
    id: 'pay-002',
    reservationId: 'res-002',
    amount: 460000,
    paymentMethod: 'bank',
    status: 'completed',
    paidAt: isoFromNow(-4),
    createdAt: isoFromNow(-5),
    updatedAt: isoFromNow(-4),
  },
  {
    id: 'pay-003',
    reservationId: 'res-003',
    amount: 1780000,
    paymentMethod: 'card',
    status: 'completed',
    paidAt: isoFromNow(-9),
    createdAt: isoFromNow(-10),
    updatedAt: isoFromNow(-9),
  },
  {
    id: 'pay-004',
    reservationId: 'res-004',
    amount: 375000,
    paymentMethod: 'cash',
    status: 'completed',
    paidAt: isoFromNow(-5),
    createdAt: isoFromNow(-20),
    updatedAt: isoFromNow(-5),
  },
  {
    id: 'pay-005',
    reservationId: 'res-008',
    amount: 450000,
    paymentMethod: 'card',
    status: 'completed',
    paidAt: isoFromNow(-1),
    createdAt: isoFromNow(-4),
    updatedAt: isoFromNow(-1),
  },
];

// ─────────────────────────────────────────────
// Mock 정산 요약 (월별)
// ─────────────────────────────────────────────
export const DEV_MOCK_SETTLEMENT_SUMMARY: SettlementSummary[] = [
  { month: 1, revenue: 1_800_000, count: 4 },
  { month: 2, revenue: 2_500_000, count: 6 },
  { month: 3, revenue: 6_052_000, count: 12 },
];

// ─────────────────────────────────────────────
// Mock 리뷰 (내 상품 리뷰)
// ─────────────────────────────────────────────
export const DEV_MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-001',
    productId: 'prod-001',
    productTitle: '다낭 바나힐 & 골든브릿지 투어',
    rating: 5,
    comment: '경치가 정말 아름다웠어요. 가이드 분도 친절하고 최고의 여행이었습니다!',
    userName: '이수진',
    isActive: true,
    created: isoFromNow(-8),
    updated: isoFromNow(-8),
  },
  {
    id: 'rev-002',
    productId: 'prod-003',
    productTitle: '하노이 & 하롱베이 3박 5일 패키지',
    rating: 4,
    comment: '하롱베이 크루즈가 인상적이었습니다. 일정이 조금 빡빡했지만 전반적으로 만족!',
    userName: '박준혁',
    isActive: true,
    created: isoFromNow(-15),
    updated: isoFromNow(-15),
  },
  {
    id: 'rev-003',
    productId: 'prod-002',
    productTitle: '푸꾸옥 오션뷰 챔피언십 라운드',
    rating: 5,
    comment: '해변을 보며 라운드 하는 느낌 최고! 코스 관리 상태도 훌륭합니다.',
    userName: '최영호',
    isActive: true,
    created: isoFromNow(-20),
    updated: isoFromNow(-20),
  },
];

// ─────────────────────────────────────────────
// 페이지네이션 헬퍼
// ─────────────────────────────────────────────
export function paginateMock<T>(
  items: T[],
  page = 1,
  limit = 20,
): { data: T[]; total: number; page: number; limit: number } {
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    total: items.length,
    page,
    limit,
  };
}
