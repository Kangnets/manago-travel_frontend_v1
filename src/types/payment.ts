import { Reservation } from './reservation';

export type PaymentMethod = 'card' | 'bank' | 'cash';
export type PaymentStatus = 'pending' | 'completed' | 'refunded';

export interface Payment {
  id: string;
  reservationId: string;
  reservation?: Reservation;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paidAt?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  reservationId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  memo?: string;
}

export interface UpdatePaymentRequest {
  status?: PaymentStatus;
  memo?: string;
}

export interface PaymentListResponse {
  data: Payment[];
  total: number;
  page: number;
  limit: number;
}

export interface SettlementSummary {
  month: number;
  revenue: number;
  count: number;
}
