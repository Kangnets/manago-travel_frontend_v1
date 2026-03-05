'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Table, TableColumn, TablePagination } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/Badge';
import { reservationAPI } from '@/lib/agencyApi';
import { Reservation, ReservationStatus } from '@/types/reservation';

export default function AgencyReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await reservationAPI.getAll({
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: searchQuery || undefined,
        page,
        limit,
      });
      setReservations(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [page, limit, statusFilter, startDate, endDate]);

  const handleSearch = () => {
    setPage(1);
    fetchReservations();
  };

  const columns: TableColumn<Reservation>[] = [
    {
      key: 'reservationNumber',
      header: '예약번호',
      width: '140px',
      render: (value) => (
        <span className="font-mono text-[13px] text-[#ffa726] font-semibold">{value}</span>
      ),
    },
    {
      key: 'product.title',
      header: '상품명',
      render: (_, row) => (
        <div className="max-w-[200px]">
          <p className="font-medium text-gray-900 line-clamp-1">
            {row.product?.title || '-'}
          </p>
          <p className="text-[12px] text-gray-500">
            {row.product?.location}, {row.product?.country}
          </p>
        </div>
      ),
    },
    {
      key: 'departureDate',
      header: '출발일',
      width: '100px',
      render: (value) => new Date(value).toLocaleDateString('ko-KR'),
    },
    {
      key: 'contactName',
      header: '예약자',
      width: '100px',
    },
    {
      key: 'participants',
      header: '인원',
      width: '80px',
      render: (_, row) => {
        const total = row.adultCount + row.childCount + row.infantCount;
        return `${total}명`;
      },
    },
    {
      key: 'status',
      header: '상태',
      width: '80px',
      render: (value) => <StatusBadge status={value} type="reservation" size="sm" />,
    },
    {
      key: 'totalAmount',
      header: '총금액',
      width: '120px',
      render: (value) => (
        <span className="font-semibold">₩{Number(value).toLocaleString()}</span>
      ),
    },
    {
      key: 'createdAt',
      header: '등록일',
      width: '100px',
      render: (value) => new Date(value).toLocaleDateString('ko-KR'),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900">예약 관리</h1>
          <p className="text-[14px] text-gray-500 mt-1">
            예약 현황을 관리하세요
          </p>
        </div>
        <Link
          href="/agency/reservations/new"
          className="px-4 py-2.5 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white font-semibold rounded-xl text-[14px] hover:from-[#f57c00] hover:to-[#ffa726] transition-all shadow-md"
        >
          + 새 예약 등록
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="예약번호 또는 예약자명"
              className="w-64 px-4 py-2 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726]/20 focus:border-[#ffa726]"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-[14px] font-medium hover:bg-gray-200 transition-colors"
            >
              검색
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ReservationStatus | '');
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726]/20 focus:border-[#ffa726]"
          >
            <option value="">전체 상태</option>
            <option value="pending">대기</option>
            <option value="confirmed">확정</option>
            <option value="cancelled">취소</option>
            <option value="completed">완료</option>
          </select>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726]/20 focus:border-[#ffa726]"
            />
            <span className="text-gray-400">~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726]/20 focus:border-[#ffa726]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={reservations}
        loading={loading}
        emptyMessage="예약 내역이 없습니다"
        emptyIcon={
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        }
        onRowClick={(row) => router.push(`/agency/reservations/${row.id}`)}
      />

      {/* Pagination */}
      {total > 0 && (
        <div className="mt-4">
          <TablePagination
            currentPage={page}
            totalPages={Math.ceil(total / limit)}
            totalItems={total}
            itemsPerPage={limit}
            onPageChange={setPage}
            onItemsPerPageChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
