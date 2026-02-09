'use client';

import Link from 'next/link';
import SafeImage from '@/components/ui/SafeImage';

interface PromotionItem {
  id: string;
  title: string;
  subtitle: string;
  period: string;
  imageUrl: string;
  backgroundColor: string;
}

const promotions: PromotionItem[] = [
  {
    id: '1',
    title: '설 연휴 얼리버드',
    subtitle: '미리 예약하고 최대 30% 할인받자!',
    period: '2026.02.01 ~ 2026.02.28',
    imageUrl: '/placeholder.svg',
    backgroundColor: '#E8F3FF',
  },
  {
    id: '2',
    title: '골프 패키지 특가',
    subtitle: '라운딩부터 숙소까지 한 번에',
    period: '상시 진행',
    imageUrl: '/placeholder.svg',
    backgroundColor: '#FFF4E6',
  },
];

export default function PromotionBanner() {
  return (
    <div className="w-full max-w-[1280px] mx-auto section-padding mb-8 sm:mb-10">
      <h2 className="text-[20px] sm:text-[22px] md:text-[24px] font-bold mb-4 sm:mb-5 font-pretendard">진행 중인 기획전</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {promotions.map((promo) => (
          <Link href={`/promotions/${promo.id}`} key={promo.id}>
            <div
              className="relative h-[160px] sm:h-[200px] rounded-2xl overflow-hidden flex items-center justify-between px-5 sm:px-8 cursor-pointer hover:shadow-lg transition-shadow"
              style={{ backgroundColor: promo.backgroundColor }}
            >
              <div className="flex flex-col gap-1.5 sm:gap-2 z-10">
                <span className="inline-block px-2.5 py-1 bg-white rounded-full text-[11px] sm:text-[12px] font-bold text-black w-fit">
                  기획전
                </span>
                <div>
                  <h3 className="text-[18px] sm:text-[20px] font-bold text-black mb-0.5">{promo.title}</h3>
                  <p className="text-[14px] sm:text-[15px] text-[#555]">{promo.subtitle}</p>
                </div>
                <p className="text-[11px] sm:text-[12px] text-[#888]">{promo.period}</p>
              </div>
              <div className="absolute right-0 bottom-0 w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] opacity-50">
                <SafeImage
                  src={promo.imageUrl}
                  alt=""
                  fill
                  className="object-contain object-bottom-right"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
