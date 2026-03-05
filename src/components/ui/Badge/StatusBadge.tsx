'use client';

type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
type ProductStatus = 'active' | 'inactive';
type PaymentStatus = 'pending' | 'completed' | 'refunded';

interface StatusBadgeProps {
  status: ReservationStatus | ProductStatus | PaymentStatus;
  type?: 'reservation' | 'product' | 'payment';
  size?: 'sm' | 'md';
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  // 예약 상태
  'reservation.pending': {
    label: '대기',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  'reservation.confirmed': {
    label: '확정',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  'reservation.cancelled': {
    label: '취소',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  'reservation.completed': {
    label: '완료',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  // 상품 상태
  'product.active': {
    label: '판매중',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  'product.inactive': {
    label: '판매중지',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  // 결제 상태
  'payment.pending': {
    label: '입금대기',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  'payment.completed': {
    label: '입금완료',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  'payment.refunded': {
    label: '환불',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
};

export default function StatusBadge({
  status,
  type = 'reservation',
  size = 'md',
}: StatusBadgeProps) {
  const key = `${type}.${status}`;
  const config = statusConfig[key] || {
    label: status,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-[12px]',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.className} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
}
