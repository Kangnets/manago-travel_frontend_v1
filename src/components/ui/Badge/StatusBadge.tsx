'use client';

type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
type ProductStatus = 'active' | 'inactive';
type PaymentStatus = 'pending' | 'completed' | 'refunded';
type Language = 'ko' | 'en';

interface StatusBadgeProps {
  status: ReservationStatus | ProductStatus | PaymentStatus;
  type?: 'reservation' | 'product' | 'payment';
  size?: 'sm' | 'md';
  lang?: Language;
}

const statusConfig: Record<
  string,
  { labelKo: string; labelEn: string; className: string }
> = {
  // 예약 상태
  'reservation.pending': {
    labelKo: '대기',
    labelEn: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  'reservation.confirmed': {
    labelKo: '확정',
    labelEn: 'Confirmed',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  'reservation.cancelled': {
    labelKo: '취소',
    labelEn: 'Cancelled',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  'reservation.completed': {
    labelKo: '완료',
    labelEn: 'Completed',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  // 상품 상태
  'product.active': {
    labelKo: '판매중',
    labelEn: 'Active',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  'product.inactive': {
    labelKo: '판매중지',
    labelEn: 'Inactive',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  // 결제 상태
  'payment.pending': {
    labelKo: '입금대기',
    labelEn: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  'payment.completed': {
    labelKo: '입금완료',
    labelEn: 'Paid',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  'payment.refunded': {
    labelKo: '환불',
    labelEn: 'Refunded',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
};

export default function StatusBadge({
  status,
  type = 'reservation',
  size = 'md',
  lang = 'ko',
}: StatusBadgeProps) {
  const key = `${type}.${status}`;
  const config = statusConfig[key] || {
    labelKo: status,
    labelEn: status,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  const label = lang === 'en' ? config.labelEn : config.labelKo;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-[12px]',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.className} ${sizeClasses[size]}`}
    >
      {label}
    </span>
  );
}
