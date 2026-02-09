'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Review } from '@/types/product';
import { IconChevronRight, StarRating } from '@/components/ui/Icons';

const PLACEHOLDER_IMAGE = '/placeholder.svg';

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
    <article className="bg-white rounded-xl sm:rounded-2xl px-5 py-4 sm:px-6 sm:py-5 flex flex-col gap-3 sm:gap-4 min-w-[260px] max-w-[300px] w-full shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-black text-[15px] sm:text-[16px] font-pretendard font-semibold leading-snug line-clamp-2 flex-1 min-w-0">
          {review.productTitle}
        </h3>
        <Link
          href={`/reviews/${review.id}`}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-black transition-colors"
          aria-label="리뷰 자세히 보기"
        >
          <IconChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-black text-[28px] sm:text-[32px] font-pretendard font-semibold leading-none tabular-nums">
          {Number(review.rating).toFixed(1)}
        </p>
        <div className="text-[#fbd865]">
          <StarRating rating={review.rating} className="w-4 h-4" />
        </div>
      </div>

      <p className="text-[#1a1a1a] text-[13px] sm:text-[14px] font-pretendard font-medium leading-relaxed line-clamp-2">
        {review.comment || '후기가 없습니다.'}
      </p>

      {images.length > 0 && (
        <div className="flex gap-2">
          {images.slice(0, 2).map((image, index) => (
            <div
              key={`${review.id}-img-${index}`}
              className="relative w-full aspect-square max-w-[90px] sm:max-w-[100px] rounded-lg overflow-hidden bg-gray-100"
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
                  className="object-cover"
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
