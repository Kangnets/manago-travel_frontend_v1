export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type Gender = 'male' | 'female';
export type TravelerType = 'adult' | 'child' | 'infant';

export interface Traveler {
  id: string;
  reservationId: string;
  travelerType: TravelerType;
  passportLastName: string;
  passportFirstName: string;
  passportNumber: string;
  passportExpiry: string;
  birthDate: string;
  /** birthDate 별칭 (일부 페이지 호환용) */
  dateOfBirth?: string;
  gender: Gender;
  nationality: string;
  phone?: string;
  email?: string;
  specialRequest?: string;
  /** 한글 이름 */
  koreanName?: string;
  /** 여권 발급일 */
  passportIssueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  reservationNumber: string;
  productId: string;
  product?: {
    id: string;
    title: string;
    location: string;
    country: string;
    duration: string;
    price: number;
    imageUrl: string;
    category: string;
  };
  agencyId: string;
  customerId?: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  status: ReservationStatus;
  departureDate: string;
  returnDate?: string;
  adultCount: number;
  childCount: number;
  infantCount: number;
  totalAmount: number;
  paidAmount: number;
  memo?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  travelers?: Traveler[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateReservationRequest {
  productId: string;
  departureDate: string;
  returnDate?: string;
  adultCount: number;
  childCount?: number;
  infantCount?: number;
  totalAmount: number;
  memo?: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  travelers?: CreateTravelerRequest[];
}

export interface UpdateReservationRequest {
  status?: ReservationStatus;
  departureDate?: string;
  returnDate?: string;
  adultCount?: number;
  childCount?: number;
  infantCount?: number;
  totalAmount?: number;
  paidAmount?: number;
  memo?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface CreateTravelerRequest {
  travelerType?: TravelerType;
  passportLastName: string;
  passportFirstName: string;
  passportNumber: string;
  passportExpiry: string;
  /** 생년월일 (YYYY-MM-DD) */
  birthDate?: string;
  /** birthDate 별칭 */
  dateOfBirth?: string;
  gender: Gender;
  nationality?: string;
  phone?: string;
  email?: string;
  specialRequest?: string;
  koreanName?: string;
  passportIssueDate?: string;
}

export interface UpdateTravelerRequest extends Partial<CreateTravelerRequest> {}

export interface ReservationListResponse {
  data: Reservation[];
  total: number;
  page: number;
  limit: number;
}

export interface DashboardStats {
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
}
