'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import SafeImage from '@/components/ui/SafeImage';
import { reviewAPI } from '@/lib/api';
import { Review } from '@/types/product';
import {
  StarIcon,
  MapPinIcon,
  CalendarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const FALLBACK_REVIEWS: Review[] = [
  {
    id: '1',
    productId: '',
    productTitle: '다낭 바나힐 & 골든브릿지 투어',
    rating: 4.9,
    comment: '다낭 여행 중 가장 기억에 남는 투어였습니다! 바나힐 케이블카를 타고 올라가는 동안의 경치가 정말 환상적이었어요...',
    images: [],
    userName: '김민지',
    isActive: true,
    created: '2024-01-15',
    updated: '2024-01-15',
  },
  {
    id: '2',
    productId: '',
    productTitle: '하노이 & 하롱베이 완전정복 패키지',
    rating: 5.0,
    comment: '신혼여행으로 다녀왔는데 정말 최고였습니다! 하롱베이 크루즈는 평생 잊지 못할 추억이 될 것 같아요...',
    images: [],
    userName: '박서준',
    isActive: true,
    created: '2024-01-20',
    updated: '2024-01-20',
  },
  {
    id: '3',
    productId: '',
    productTitle: '호치민 메콩델타 투어',
    rating: 4.7,
    comment: '메콩델타의 자연 풍경이 정말 인상적이었어요. 보트를 타고 이동하는 것도 재미있었고...',
    images: [],
    userName: '이수현',
    isActive: true,
    created: '2024-01-22',
    updated: '2024-01-22',
  },
  {
    id: '4',
    productId: '',
    productTitle: '다낭 BRG 골프 투어',
    rating: 4.8,
    comment: '골프장 상태가 정말 좋았고, 캐디님도 친절하셨습니다. 바다 전망이 환상적이에요...',
    images: [],
    userName: '최지훈',
    isActive: true,
    created: '2024-01-25',
    updated: '2024-01-25',
  },
  {
    id: '5',
    productId: '',
    productTitle: '푸꾸옥 빈펄랜드 & 선셋 크루즈',
    rating: 5.0,
    comment: '빈펄랜드가 생각보다 훨씬 재미있었고, 선셋 크루즈는 정말 로맨틱했어요...',
    images: [],
    userName: '정유진',
    isActive: true,
    created: '2024-01-28',
    updated: '2024-01-28',
  },
  {
    id: '6',
    productId: '',
    productTitle: '나트랑 머드 스파 & 빈펄랜드',
    rating: 4.6,
    comment: '머드 스파가 정말 특별한 경험이었어요. 피부도 좋아지고 힐링이 되었습니다...',
    images: [],
    userName: '강민호',
    isActive: true,
    created: '2024-02-01',
    updated: '2024-02-01',
  },
];

const SORT_OPTIONS = ['최신순', '평점높은순'] as const;

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<typeof SORT_OPTIONS[number]>('최신순');

  useEffect(() => {
    reviewAPI.getAll()
      .then((data) => {
        setReviews(Array.isArray(data) && data.length > 0 ? data : FALLBACK_REVIEWS);
      })
      .catch(() => setReviews(FALLBACK_REVIEWS))
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => {
    const list = [...reviews];
    if (sortBy === '평점높은순') list.sort((a, b) => b.rating - a.rating);
    else list.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    return list;
  }, [reviews, sortBy]);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  }

  function getInitial(name: string) {
    return name ? name.charAt(0).toUpperCase() : 'U';
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 히어로 섹션 */}
      <div className="relative bg-gradient-to-br from-amber-600 via-orange-500 to-yellow-500 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px]" />
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <StarSolidIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-[44px] font-bold tracking-tight">고객 리뷰</h1>
              <p className="text-white/80 text-sm mt-1">
                총 {reviews.length}개 리뷰 · 평균 ★ {avgRating}
              </p>
            </div>
          </div>
          <p className="text-xl text-white/90 leading-relaxed max-w-xl">
            망고트래블과 함께한 고객님들의 생생한 여행 후기
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 py-12">
        {/* 정렬 */}
        <div className="bg-white rounded-2xl p-5 shadow-md mb-8 flex items-center gap-4">
          <FunnelIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">정렬</span>
          <div className="flex gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setSortBy(opt)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  sortBy === opt
                    ? 'bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <span className="ml-auto text-sm text-gray-500">
            <span className="font-bold text-gray-900">{sorted.length}개</span>의 리뷰
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {sorted.map((review) => (
              <Link key={review.id} href={`/reviews/${review.id}`} className="group">
                <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100">
                  <div className="flex flex-col md:flex-row">
                    {/* 이미지 */}
                    <div className="relative w-full md:w-[260px] h-[180px] flex-shrink-0 bg-gray-100">
                      <SafeImage
                        src={review.images?.[0] || '/placeholder.png'}
                        alt={review.productTitle}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* 내용 */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#ffa726] transition-colors">
                            {review.productTitle}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                            <CalendarIcon className="w-4 h-4" />
                            {formatDate(review.created)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-0.5 mb-1">
                            {[...Array(5)].map((_, idx) => (
                              <StarSolidIcon
                                key={idx}
                                className={`w-4 h-4 ${idx < Math.floor(review.rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                              />
                            ))}
                          </div>
                          <p className="text-[22px] font-bold text-[#ffa726] leading-none">
                            {review.rating.toFixed(1)}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-700 leading-relaxed mb-4 line-clamp-2">
                        {review.comment}
                      </p>

                      <div className="flex items-center pt-4 border-t border-gray-100">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#ffa726] to-[#ffb74d] rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">
                          {getInitial(review.userName)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{review.userName}</p>
                          <p className="text-xs text-gray-500">여행 후기</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
