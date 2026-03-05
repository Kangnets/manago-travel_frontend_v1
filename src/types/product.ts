export type ProductCategory = 'hotel' | 'golf' | 'tour' | 'spa' | 'restaurant' | 'vehicle' | 'guide' | 'convenience' | 'insurance';

export interface Product {
  id: string;
  title: string;
  location: string;
  country: string;
  duration: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  imageUrl: string;
  category: ProductCategory;
  // 백엔드 추가 필드
  description?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  viewCount?: number;
  agencyId?: string;
  minParticipants?: number;
  maxParticipants?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** 상품 상세(예약) 페이지용: 출발/도착 일시, 연령별 가격, 잔여석, 일정표 등 */
export interface ProductDetail extends Product {
  /** 출발일 (YYYY-MM-DD) */
  departureDate?: string;
  /** 도착일 (YYYY-MM-DD) */
  returnDate?: string;
  /** 출발 시간/장소 설명 (예: "11:55 - 인천공항") */
  departureInfo?: string;
  /** 도착 시간/장소 설명 */
  returnInfo?: string;
  /** 성인(만 12세 이상) 가격 */
  priceAdult?: number;
  /** 소아(만 12세 미만) 가격 */
  priceChild?: number;
  /** 유아(만 2세 미만, No Bed) 가격 */
  priceInfant?: number;
  /** 현재 예약 인원 */
  bookedCount?: number;
  /** 블럭(정원) */
  blockSeats?: number;
  /** 최소 출발 인원 */
  minPassengers?: number;
  /** 상세 일정표 */
  itinerary?: ItineraryDay[];
  /** 포함 사항 (문자열 배열) */
  included?: string[];
  /** 불포함 사항 */
  excluded?: string[];
  /** 취소/환불 안내 요약 */
  cancelPolicy?: string;
  /** 문의 전화 */
  inquiryPhone?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  meals?: string; // "조식", "중식", "석식" 등
}

export interface Review {
  id: string;
  productId: string;
  productTitle: string;
  rating: number;
  comment: string;
  images?: string[];
  userName: string;
  isActive?: boolean;
  created: string;
  updated: string;
}
