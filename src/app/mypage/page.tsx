'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { reservationAPI } from '@/lib/api';
import { Reservation } from '@/types/reservation';
import {
  UserIcon,
  CalendarIcon,
  HeartIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  TicketIcon,
  MapPinIcon,
  StarIcon,
  BuildingOfficeIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
} from '@heroicons/react/24/solid';

interface Favorite {
  id: string;
  productName: string;
  location: string;
  price: number;
  image: string;
}

const mockFavorites: Favorite[] = [];

const RESERVATION_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:   { label: '접수중',  color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: '확정',    color: 'bg-blue-100 text-blue-700' },
  completed: { label: '완료',    color: 'bg-green-100 text-green-700' },
  cancelled: { label: '취소',    color: 'bg-gray-100 text-gray-600' },
};

export default function MyPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'bookings' | 'favorites' | 'reviews'>('bookings');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [resLoading, setResLoading] = useState(true);
  const [resError, setResError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;

    // 에이전시는 에이전시 예약 목록, 일반 고객은 본인 예약 목록 사용
    const fetchFn = user.userType === 'agency'
      ? reservationAPI.getMyReservations()
      : import('@/lib/agencyApi').then(({ reservationAPI: agencyResAPI }) =>
          agencyResAPI.getCustomerReservations()
        );

    fetchFn
      .then((data: unknown) => {
        const list: Reservation[] = Array.isArray(data)
          ? (data as Reservation[])
          : ((data as { data?: Reservation[] }).data ?? []);
        setReservations(list);
      })
      .catch(() => setResError('예약 내역을 불러오지 못했습니다.'))
      .finally(() => setResLoading(false));
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#ffa726] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const cfg = RESERVATION_STATUS_MAP[status] ?? { label: status, color: 'bg-gray-100 text-gray-700' };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-lg ${cfg.color}`}>{cfg.label}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 히어로 섹션 */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 overflow-hidden">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ffa726]/15 rounded-full blur-[100px]" />
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#ffa726] to-[#ff9800] rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-orange-500/30">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-[36px] font-bold mb-2">{user.name}님</h1>
              <p className="text-lg text-white/70">{user.email}</p>
              {user.userType === 'agency' && user.agencyName && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-sm font-semibold border border-white/10">
                  <BuildingOfficeIcon className="w-4 h-4" />
                  {user.agencyName}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="text-lg font-bold text-gray-900 mb-4">마이메뉴</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'bookings'
                      ? 'bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <TicketIcon className="w-5 h-5" />
                  예약 내역
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'favorites'
                      ? 'bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <HeartIcon className="w-5 h-5" />
                  찜한 상품
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'reviews'
                      ? 'bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <StarIcon className="w-5 h-5" />
                  나의 리뷰
                </button>
                <div className="h-px bg-gray-100 my-2"></div>
                <Link
                  href="/mypage/settings"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                  설정
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  로그아웃
                </button>
              </nav>
            </div>

            {/* 포인트/쿠폰 카드 */}
            <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-orange-100">
              <div className="flex items-center gap-2 mb-4">
                <CreditCardIcon className="w-5 h-5 text-[#ffa726]" />
                <h3 className="text-sm font-bold text-gray-900">포인트 & 쿠폰</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">보유 포인트</span>
                  <span className="text-lg font-bold text-[#ffa726]">15,000P</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">사용 가능 쿠폰</span>
                  <span className="text-lg font-bold text-[#ffa726]">3장</span>
                </div>
              </div>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3">
            {/* 예약 내역 */}
            {activeTab === 'bookings' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">예약 내역</h2>
                  {!resLoading && <span className="text-sm text-gray-600">총 {reservations.length}건</span>}
                </div>

                {resLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                        <div className="flex">
                          <div className="w-[200px] h-[150px] bg-gray-200 shrink-0" />
                          <div className="flex-1 p-6 space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                            <div className="h-5 bg-gray-200 rounded w-3/4" />
                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : resError ? (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                    <ExclamationCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <p className="text-red-600 font-medium">{resError}</p>
                  </div>
                ) : reservations.length > 0 ? (
                  <div className="space-y-4">
                    {reservations.map((res) => (
                      <div
                        key={res.id}
                        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-gray-100"
                      >
                        <div className="flex flex-col md:flex-row">
                          <div className="relative w-full md:w-[200px] h-[150px] flex-shrink-0 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                            <TicketIcon className="w-16 h-16 text-orange-200" />
                          </div>
                          <div className="flex-1 p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="px-2 py-1 bg-orange-50 text-[#ffa726] text-xs font-semibold rounded">
                                    {res.product?.category ?? '여행'}
                                  </span>
                                  {getStatusBadge(res.status)}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">
                                  {res.product?.title ?? `예약 #${res.reservationNumber}`}
                                </h3>
                                {res.reservationNumber && (
                                  <p className="text-xs text-gray-400 mt-1">예약번호: {res.reservationNumber}</p>
                                )}
                              </div>
                              <p className="text-xl font-bold text-gray-900">
                                ₩{res.totalAmount.toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 flex-wrap">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                출발: {res.departureDate}
                              </div>
                              {res.product?.location && (
                                <div className="flex items-center gap-1">
                                  <MapPinIcon className="w-4 h-4" />
                                  {res.product.location}
                                </div>
                              )}
                              <div className="text-gray-400">
                                성인 {res.adultCount}명{res.childCount > 0 ? ` / 아동 ${res.childCount}명` : ''}
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <Link
                                href={`/reservations/${res.id}`}
                                className="px-4 py-2 bg-gray-50 text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
                              >
                                예약 상세
                              </Link>
                              {res.status === 'completed' && (
                                <Link
                                  href={`/reviews/write?reservation=${res.id}`}
                                  className="px-4 py-2 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white rounded-lg text-sm font-semibold hover:from-[#f57c00] hover:to-[#ffa726] transition-all"
                                >
                                  리뷰 작성
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-md">
                    <TicketIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">아직 예약 내역이 없습니다</p>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white rounded-xl font-semibold hover:from-[#f57c00] hover:to-[#ffa726] transition-all"
                    >
                      상품 둘러보기
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 찜한 상품 */}
            {activeTab === 'favorites' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">찜한 상품</h2>
                  <span className="text-sm text-gray-600">총 {mockFavorites.length}개</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockFavorites.map((favorite) => (
                    <Link
                      key={favorite.id}
                      href={`/products/${favorite.id}`}
                      className="group"
                    >
                      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-100">
                        <div className="relative h-[180px] bg-gray-200">
                          <img
                            src={favorite.image}
                            alt={favorite.productName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <HeartSolidIcon className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPinIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{favorite.location}</span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#ffa726] transition-colors">
                            {favorite.productName}
                          </h3>
                          <p className="text-xl font-bold text-gray-900">
                            ₩{favorite.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {mockFavorites.length === 0 && (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-md">
                    <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">찜한 상품이 없습니다</p>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white rounded-xl font-semibold hover:from-[#f57c00] hover:to-[#ffa726] transition-all"
                    >
                      상품 둘러보기
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 나의 리뷰 */}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">나의 리뷰</h2>
                  <span className="text-sm text-gray-600">총 0개</span>
                </div>

                <div className="bg-white rounded-2xl p-12 text-center shadow-md">
                  <StarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">작성한 리뷰가 없습니다</p>
                  <p className="text-sm text-gray-400 mb-6">
                    여행 후기를 작성하고 다른 여행자들과 경험을 공유해보세요
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
