'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { reservationAPI } from '@/lib/agencyApi';
import { Reservation } from '@/types/reservation';
import { useAuth } from '@/contexts/AuthContext';

interface Notice {
  id: string;
  title: string;
  date: string;
}

interface Notification {
  id: string;
  message: string;
  date: string;
}

interface CalendarEvent {
  date: Date;
  reservations: Reservation[];
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const STATUS_MAP: Record<string, string | undefined> = {
  '전체': undefined,
  '대기': 'pending',
  '확정': 'confirmed',
  '취소': 'cancelled',
  '완료': 'completed',
};

export default function AgencyDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const today = new Date();

  // Filter states
  const [startDate, setStartDate] = useState(() => {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    return toDateStr(first);
  });
  const [endDate, setEndDate] = useState(() => toDateStr(today));
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedStatus, setSelectedStatus] = useState('전체');

  // Calendar states
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekStart(today));

  // Mock data (공지/알림은 실제 구현 전 임시 데이터)
  const [notices] = useState<Notice[]>([]);
  const [notifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const statusParam = STATUS_MAP[selectedStatus] as 'pending' | 'confirmed' | 'cancelled' | 'completed' | undefined;
      const data = await reservationAPI.getAll({
        limit: 200,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: statusParam,
      });
      setReservations(data.data || []);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  // Get week dates
  const getWeekDates = (startDate: Date): Date[] => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeekStart);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // Navigate week
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  // Filter reservations within 7 days
  const upcomingReservations = reservations.filter((r) => {
    const deptDate = new Date(r.departureDate);
    const today = new Date();
    const diffTime = deptDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  // Get reservations for a specific date
  const getReservationsForDate = (date: Date): Reservation[] => {
    return reservations.filter((r) => {
      const deptDate = new Date(r.departureDate);
      return (
        deptDate.getFullYear() === date.getFullYear() &&
        deptDate.getMonth() === date.getMonth() &&
        deptDate.getDate() === date.getDate()
      );
    });
  };

  const inputCls = 'px-2 py-1 border border-gray-300 rounded text-[12px] focus:outline-none focus:border-[#ffa726] bg-white';

  return (
    <div className="min-h-screen bg-[#f0f2f5] -m-8 flex">
      {/* ═══════════════ LEFT SIDEBAR - FILTERS ═══════════════ */}
      <div className="w-[220px] bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-4">
          <h2 className="text-[14px] font-bold text-gray-800 mb-4">전체 예약</h2>

          <div className="space-y-3">
            {/* 필터 조회 label */}
            <div className="pb-2 border-b border-gray-200">
              <span className="text-[11px] font-semibold text-gray-500">필터 조회</span>
            </div>

            {/* 담당자 */}
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">담당자</label>
              <select className={inputCls}>
                <option>전체</option>
                <option>{user?.name || '담당자'}</option>
              </select>
            </div>

            {/* 기간 */}
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">기간</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputCls}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`${inputCls} mt-1`}
              />
            </div>

            {/* 지역 선택 */}
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">지역</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className={inputCls}
              >
                <option>전체</option>
                <option>국내</option>
                <option>동남아</option>
                <option>일본</option>
                <option>유럽</option>
              </select>
            </div>

            {/* 거래처 */}
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">거래처</label>
              <select className={inputCls}>
                <option>전체</option>
              </select>
            </div>

            {/* 상담분류 */}
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">상담분류</label>
              <select className={inputCls}>
                <option>전체</option>
              </select>
            </div>

            {/* 진행단계 */}
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">진행단계</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={inputCls}
              >
                <option>전체</option>
                <option>대기</option>
                <option>확정</option>
                <option>취소</option>
                <option>완료</option>
              </select>
            </div>

            {/* 상담번호 */}
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">상담번호</label>
              <input type="text" placeholder="상담번호" className={inputCls} />
            </div>

            {/* 조회 버튼 */}
            <button
              onClick={fetchReservations}
              className="w-full py-2 bg-[#4a5dd8] text-white text-[12px] font-bold rounded hover:bg-[#3a4dc8] transition-colors"
            >
              조회
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <div className="flex-1 p-4 overflow-auto">
        {/* ─────── Top Section: Notices + Notifications ─────── */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* 공지사항 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-gray-800">공지사항</h3>
              <Link href="/agency/notices" className="text-[11px] text-[#ffa726] hover:underline">
                더보기 →
              </Link>
            </div>
            <div className="p-3">
              {notices.length === 0 ? (
                <p className="text-[12px] text-gray-400 text-center py-4">공지사항이 없습니다</p>
              ) : (
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-1.5 text-gray-600 font-medium">NO</th>
                      <th className="text-left py-1.5 text-gray-600 font-medium">제목</th>
                      <th className="text-right py-1.5 text-gray-600 font-medium">등록일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notices.map((notice) => (
                      <tr key={notice.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2">{notice.id}</td>
                        <td className="py-2 text-gray-700">{notice.title}</td>
                        <td className="py-2 text-right text-gray-500">{notice.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* 알림 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-gray-800">알림</h3>
              <Link href="/agency/notifications" className="text-[11px] text-[#ffa726] hover:underline">
                더보기 →
              </Link>
            </div>
            <div className="p-3">
              {notifications.length === 0 ? (
                <p className="text-[12px] text-gray-400 text-center py-4">알림이 없습니다</p>
              ) : (
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-1.5 text-gray-600 font-medium">NO</th>
                      <th className="text-left py-1.5 text-gray-600 font-medium">제목</th>
                      <th className="text-right py-1.5 text-gray-600 font-medium">등록일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((noti) => (
                      <tr key={noti.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2">{noti.id}</td>
                        <td className="py-2 text-gray-700">{noti.message}</td>
                        <td className="py-2 text-right text-gray-500">{noti.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* ─────── Weekly Calendar ─────── */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-3">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-gray-800">이번주 스케줄</h3>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-600">
                {currentWeekStart.getFullYear()}. {currentWeekStart.getMonth() + 1}.
              </span>
              <div className="flex gap-1">
                <button
                  onClick={goToPreviousWeek}
                  className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-600 text-[11px]"
                >
                  ‹
                </button>
                <button
                  onClick={goToNextWeek}
                  className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-600 text-[11px]"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
          <div className="p-3">
            {/* Calendar header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDates.map((date, idx) => {
                const dayOfWeek = weekDays[date.getDay()];
                const nowDate = new Date();
                const isToday =
                  date.getFullYear() === nowDate.getFullYear() &&
                  date.getMonth() === nowDate.getMonth() &&
                  date.getDate() === nowDate.getDate();
                return (
                  <div
                    key={idx}
                    className={`text-center py-2 rounded-lg ${
                      isToday ? 'bg-[#ffa726] text-white' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`text-[11px] ${isToday ? 'text-white' : 'text-gray-500'}`}>
                      {date.getMonth() + 1}. {date.getDate()}. ({dayOfWeek})
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calendar body */}
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date, idx) => {
                const dayReservations = getReservationsForDate(date);
                return (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-2 min-h-[120px] bg-white"
                  >
                    {dayReservations.length === 0 ? (
                      <p className="text-[10px] text-gray-300 text-center mt-8">데이터가 없습니다.</p>
                    ) : (
                      <div className="space-y-1">
                        {dayReservations.slice(0, 3).map((res) => (
                          <div
                            key={res.id}
                            className="bg-blue-50 border border-blue-100 rounded px-1.5 py-1 text-[10px]"
                          >
                            <div className="font-bold text-blue-800 truncate">
                              {res.contactName || '예약자'}
                            </div>
                            <div className="text-blue-600 truncate">
                              {res.product?.title || '상품명'}
                            </div>
                          </div>
                        ))}
                        {dayReservations.length > 3 && (
                          <div className="text-[9px] text-gray-500 text-center">
                            +{dayReservations.length - 3}개 더보기
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─────── Upcoming Reservations Table ─────── */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-4 py-2.5 border-b border-gray-100">
            <h3 className="text-[13px] font-bold text-gray-800">출발 1주일 이내 상담</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600">예약일</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600">고객</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600">담당자</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600">단체명</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600">예약번호</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600">지불</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600">출발일(인원)</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-600">가격</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600">진행</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#ffa726] border-t-transparent rounded-full animate-spin" />
                        <span className="text-[12px] text-gray-500">로딩 중...</span>
                      </div>
                    </td>
                  </tr>
                ) : upcomingReservations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-[12px] text-gray-400">
                      데이터가 존재하지 않습니다.
                    </td>
                  </tr>
                ) : (
                  upcomingReservations.map((res) => (
                    <tr key={res.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2.5">
                        {new Date(res.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-3 py-2.5 font-medium">{res.contactName || '-'}</td>
                      <td className="px-3 py-2.5">{user?.name || '-'}</td>
                      <td className="px-3 py-2.5 text-gray-600">
                        {res.product?.title || '-'}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-mono text-[#ffa726] font-bold">
                          {res.reservationNumber}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={res.paidAmount >= res.totalAmount ? 'text-green-600' : 'text-red-500'}>
                          {res.paidAmount >= res.totalAmount ? '완납' : '미수'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {new Date(res.departureDate).toLocaleDateString('ko-KR')} (
                        {res.adultCount + res.childCount + res.infantCount}명)
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium">
                        ₩{res.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            res.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : res.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : res.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {res.status === 'confirmed'
                            ? '확정'
                            : res.status === 'pending'
                            ? '대기'
                            : res.status === 'cancelled'
                            ? '취소'
                            : '완료'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
