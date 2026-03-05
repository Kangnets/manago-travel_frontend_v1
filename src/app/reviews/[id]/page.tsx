'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import SafeImage from '@/components/ui/SafeImage';
import { reviewAPI } from '@/lib/api';
import { Review } from '@/types/product';
import {
  StarIcon,
  CalendarIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

export default function ReviewDetailPage() {
  const params = useParams();
  const reviewId = params.id as string;

  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    reviewAPI.getById(reviewId)
      .then((data) => {
        setReview(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [reviewId]);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  }

  function getInitial(name: string) {
    return name ? name.charAt(0).toUpperCase() : 'U';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ffa726]" />
      </div>
    );
  }

  if (notFound || !review) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 mb-2">리뷰를 찾을 수 없습니다</p>
          <Link href="/reviews" className="text-[#ffa726] hover:underline">
            리뷰 목록으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[900px] mx-auto px-5 sm:px-6 lg:px-8 py-6">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#ffa726] transition-colors mb-4"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            리뷰 목록으로
          </Link>

          <h1 className="text-[28px] font-bold text-gray-900 mb-3">{review.productTitle}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              {formatDate(review.created)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-5 sm:px-6 lg:px-8 py-10">
        {/* 작성자 정보 & 평점 */}
        <div className="bg-white rounded-2xl p-8 shadow-md mb-6">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-[#ffa726] to-[#ffb74d] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {getInitial(review.userName)}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xl font-bold text-gray-900 mb-1">{review.userName}</p>
                  <p className="text-sm text-gray-500">여행 후기</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, idx) => (
                      <StarSolidIcon
                        key={idx}
                        className={`w-6 h-6 ${idx < Math.floor(review.rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-[32px] font-bold text-[#ffa726] leading-none">
                    {review.rating.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarIcon className="w-4 h-4" />
                <span>{formatDate(review.created)} 작성</span>
              </div>
            </div>
          </div>
        </div>

        {/* 이미지 갤러리 */}
        {review.images && review.images.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">여행 사진</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {review.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                >
                  <SafeImage
                    src={img}
                    alt={`리뷰 이미지 ${idx + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 리뷰 내용 */}
        <div className="bg-white rounded-2xl p-8 shadow-md mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">상세 리뷰</h3>
          <div className="prose prose-gray max-w-none">
            {review.comment.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="text-gray-700 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* 관련 상품 */}
        {review.productId && (
          <div className="mt-6">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 text-center border border-orange-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                이 상품이 궁금하신가요?
              </h3>
              <p className="text-gray-600 mb-6">{review.productTitle}</p>
              <Link
                href={`/products/${review.productId}`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white rounded-xl font-bold text-lg hover:from-[#f57c00] hover:to-[#ffa726] transition-all shadow-lg hover:shadow-xl"
              >
                <StarIcon className="w-5 h-5" />
                상품 보러가기
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
