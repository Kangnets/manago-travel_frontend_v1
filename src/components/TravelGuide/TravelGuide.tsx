'use client';

import Link from 'next/link';
import SafeImage from '@/components/ui/SafeImage';

interface GuideItem {
  id: string;
  category: string;
  title: string;
  imageUrl: string;
}

const guides: GuideItem[] = [
  { id: '1', category: '여행 꿀팁', title: '베트남 여행 전 꼭 알아야 할 5가지', imageUrl: '/placeholder.svg' },
  { id: '2', category: '맛집 가이드', title: '현지인만 아는 다낭 찐 맛집 리스트', imageUrl: '/placeholder.svg' },
  { id: '3', category: '골프 가이드', title: '초보자도 즐기기 좋은 동남아 골프장', imageUrl: '/placeholder.svg' },
  { id: '4', category: '호텔 리뷰', title: '가성비 vs 럭셔리, 푸꾸옥 리조트 비교', imageUrl: '/placeholder.svg' },
];

export default function TravelGuide() {
  return (
    <section className="w-full max-w-[1280px] mx-auto section-padding py-8 sm:py-10 md:py-12">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h2 className="text-[20px] sm:text-[22px] md:text-[24px] font-bold font-pretendard">여행 지식백과</h2>
        <Link href="/guide" className="text-[#888] hover:text-black transition-colors text-[13px] sm:text-[14px]">
          전체보기 →
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {guides.map((guide) => (
          <Link href={`/guide/${guide.id}`} key={guide.id} className="group cursor-pointer">
            <div className="flex flex-col gap-3">
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                <SafeImage
                  src={guide.imageUrl}
                  alt={guide.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] sm:text-[13px] font-bold text-[#fbd865]">{guide.category}</span>
                <h3 className="text-[14px] sm:text-[15px] md:text-[16px] font-bold text-black leading-snug group-hover:text-gray-700 transition-colors line-clamp-2">
                  {guide.title}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
