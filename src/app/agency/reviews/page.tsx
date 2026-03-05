'use client';

import { useState, useEffect } from 'react';
import { agencyReviewAPI } from '@/lib/agencyApi';
import { Review } from '@/types/product';
import {
  StarIcon,
  ChatBubbleLeftRightIcon,
  EyeSlashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

export default function AgencyReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await agencyReviewAPI.getMyProductReviews(200);
      setReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('리뷰 목록을 불러오지 못했습니다.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeactivate = async (id: string) => {
    setDeactivatingId(id);
    try {
      await agencyReviewAPI.deactivate(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError('비공개 처리에 실패했습니다.');
    } finally {
      setDeactivatingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="w-7 h-7 text-[#ffa726]" />
          리뷰 관리
        </h1>
        <button
          onClick={fetchReviews}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        내 상품에 달린 리뷰를 확인하고, 부적절한 리뷰는 비공개 처리할 수 있습니다.
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="w-10 h-10 border-4 border-[#ffa726] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">리뷰 목록을 불러오는 중...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <StarIcon className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-1">등록된 리뷰가 없습니다</p>
          <p className="text-sm text-gray-400">고객이 상품 이용 후 리뷰를 남기면 여기에 표시됩니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-xs font-semibold text-[#ffa726] bg-orange-50 px-2 py-0.5 rounded">
                      {review.productTitle || '상품'}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <StarSolidIcon
                          key={i}
                          className={`w-4 h-4 ${i <= (review.rating ?? 0) ? 'text-amber-400' : 'text-gray-200'}`}
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">({review.rating})</span>
                    </div>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap break-words">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {(review as any).userName && <span>{(review as any).userName} · </span>}
                    {(review as any).created && (
                      <span>{new Date((review as any).created).toLocaleDateString('ko-KR')}</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleDeactivate(review.id)}
                  disabled={deactivatingId === review.id}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 hover:text-gray-800 disabled:opacity-50"
                >
                  {deactivatingId === review.id ? (
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <EyeSlashIcon className="w-4 h-4" />
                  )}
                  비공개
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
