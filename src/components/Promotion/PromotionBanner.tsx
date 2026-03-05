'use client';

import Link from 'next/link';
import SafeImage from '@/components/ui/SafeImage';
import { FireIcon, SparklesIcon, HeartIcon } from '@heroicons/react/24/solid';

interface PromotionItem {
  id: string;
  title: string;
  subtitle: string;
  period: string;
  imageUrl: string;
  backgroundColor: string;
  Icon: any;
}

const promotions: PromotionItem[] = [
  {
    id: '1',
    title: '푸꾸옥 봄 여행 대축제',
    subtitle: '푸꾸옥 인기 상품 최대 40% 할인',
    period: '2026.02.01 ~ 2026.03.31',
    imageUrl: '/promotion-1.png',
    backgroundColor: '#FFE8E8',
    Icon: FireIcon,
  },
  {
    id: '2',
    title: '푸꾸옥 골프 패키지',
    subtitle: '명문 골프장 + 특급 리조트 패키지',
    period: '상시 진행중',
    imageUrl: '/promotion-2.png',
    backgroundColor: '#E8F9E8',
    Icon: SparklesIcon,
  },
  {
    id: '3',
    title: '푸꾸옥 신혼여행 특가',
    subtitle: '허니문 커플 한정 특별 혜택',
    period: '2026.02.10 ~ 2026.06.30',
    imageUrl: '/promotion-3.png',
    backgroundColor: '#FFF4E6',
    Icon: HeartIcon,
  },
];

export default function PromotionBanner() {
  return (
    <div className="w-full bg-gray-50 py-16 sm:py-20">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-[24px] sm:text-[28px] font-bold font-pretendard leading-tight tracking-tight">진행중인 기획전</h2>
          <Link href="/promotions" className="text-[14px] text-gray-600 hover:text-[#ffa726] transition-colors font-medium">
            전체보기 →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {promotions.map((promo) => (
            <Link href={`/promotions/${promo.id}`} key={promo.id}>
              <div
                className="relative h-[180px] rounded-2xl overflow-hidden flex flex-col justify-between p-6 cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all bg-white border border-gray-100"
              >
                <div className="absolute inset-0 opacity-5" style={{ backgroundColor: promo.backgroundColor }}></div>
                <div className="absolute right-4 bottom-4 w-20 h-20 z-0 opacity-90">
                  <SafeImage src={promo.imageUrl} alt="" fill className="object-contain" />
                </div>
                <div className="flex items-start justify-between z-10">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white rounded-lg text-[11px] font-bold shadow-sm">
                    HOT
                  </span>
                  <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center">
                    <promo.Icon className="w-5 h-5 text-[#ffa726]" />
                  </div>
                </div>
                <div className="z-10">
                  <h3 className="text-[18px] font-bold text-gray-900 mb-2 leading-tight">{promo.title}</h3>
                  <p className="text-[14px] text-gray-600 mb-2.5 leading-snug">{promo.subtitle}</p>
                  <p className="text-[12px] text-gray-500">{promo.period}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
