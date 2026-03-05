'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Review } from '@/types/product';
import { IconChevronRight, StarRating } from '@/components/ui/Icons';

const PLACEHOLDER_IMAGE = '/placeholder.png';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const images = review.images ?? [];
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (index: number) => {
    setImgErrors((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <article className="bg-white rounded-2xl p-6 flex flex-col gap-4 min-w-[280px] max-w-[320px] w-full shadow-md border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-gray-900 text-[16px] font-pretendard font-bold leading-snug line-clamp-2 flex-1 min-w-0">
          {review.productTitle}
        </h3>
        <Link
          href={`/reviews/${review.id}`}
          className="flex-shrink-0 p-1.5 text-gray-400 hover:text-[#ffa726] transition-colors rounded-lg hover:bg-orange-50"
          aria-label="리뷰 자세히 보기"
        >
          <IconChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[#ffa726] text-[32px] font-pretendard font-bold leading-none tabular-nums">
          {Number(review.rating).toFixed(1)}
        </p>
        <div className="text-yellow-500">
          <StarRating rating={review.rating} className="w-5 h-5" />
        </div>
      </div>

      <p className="text-gray-700 text-[14px] font-pretendard leading-relaxed line-clamp-3">
        {review.comment || '후기가 없습니다.'}
      </p>

      {images.length > 0 && (
        <div className="flex gap-2.5 mt-2">
          {images.slice(0, 2).map((image, index) => (
            <div
              key={`${review.id}-img-${index}`}
              className="relative w-full aspect-square max-w-[110px] rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
            >
              {imgErrors[index] ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400 text-xs">
                  No Image
                </div>
              ) : (
                <Image
                  src={image}
                  alt={`리뷰 이미지 ${index + 1}`}
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-300"
                  sizes="120px"
                  onError={() => handleImageError(index)}
                  unoptimized
                />
              )}
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
