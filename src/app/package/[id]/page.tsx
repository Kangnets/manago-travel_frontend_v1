'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import SafeImage from '@/components/ui/SafeImage';
import {
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  XCircleIcon,
  PhoneIcon,
  HeartIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { PRIMARY_REGION } from '@/lib/regionPolicy';

const packageData: Record<string, any> = {
  '1': {
    id: '1',
    name: '하노이 & 하롱베이 완전정복',
    description: '도시와 자연을 함께 즐기는 프리미엄 패키지',
    duration: '3박 5일',
    price: 1290000,
    originalPrice: 1690000,
    image: '/placeholder.png',
    cities: ['하노이', '하롱베이'],
    schedule: [
      { day: 1, title: '인천 → 하노이', content: '하노이 도착 후 호텔 체크인, 자유시간' },
      { day: 2, title: '하노이 시내 관광', content: '호안끼엠 호수, 문묘, 호치민 묘소, 구시가지 투어' },
      { day: 3, title: '하롱베이 크루즈', content: '하롱베이 크루즈 투어, 동굴 탐험, 선상 디너' },
      { day: 4, title: '하노이 자유시간', content: '쇼핑 및 자유시간, 수상인형극 관람' },
      { day: 5, title: '하노이 → 인천', content: '공항 이동 후 귀국' },
    ],
    included: [
      '왕복 항공권 (이코노미석)',
      '특급 호텔 숙박 (4성급 이상)',
      '전일정 식사 (조식 4회, 중식 3회, 석식 3회)',
      '한국어 가능 전문 가이드',
      '전용 차량',
      '일정표상 입장권',
      '여행자 보험',
    ],
    excluded: [
      '개인 경비 및 매너 팁',
      '선택관광 비용',
      '일정표 외 식사',
    ],
  },
  '2': {
    id: '2',
    name: '다낭 & 호이안 힐링 여행',
    description: '해변과 문화유산을 동시에 즐기는 힐링 여행',
    duration: '4박 6일',
    price: 1590000,
    originalPrice: 2190000,
    image: '/placeholder.png',
    cities: ['다낭', '호이안'],
    schedule: [
      { day: 1, title: '인천 → 다낭', content: '다낭 도착 후 5성급 리조트 체크인' },
      { day: 2, title: '다낭 시내 관광', content: '미케 비치, 오행산, 용다리 야경 투어' },
      { day: 3, title: '바나힐 투어', content: '바나힐 케이블카, 골든 브릿지, 프랑스 마을' },
      { day: 4, title: '호이안 일일 투어', content: '호이안 구시가지, 등불 축제, 야시장' },
      { day: 5, title: '자유시간 & 골프', content: '무료 골프 1회 또는 리조트에서 휴식' },
      { day: 6, title: '다낭 → 인천', content: '공항 이동 후 귀국' },
    ],
    included: [
      '왕복 항공권 (이코노미석)',
      '5성급 비치 리조트 숙박',
      '조식 포함 (전일정)',
      '한국어 가능 전문 가이드',
      '전용 차량',
      '무료 골프 1회 (그린피, 캐디피 포함)',
      '일정표상 입장권',
      '여행자 보험',
    ],
    excluded: [
      '개인 경비 및 매너 팁',
      '중식, 석식',
      '선택관광 비용',
    ],
  },
  '3': {
    id: '3',
    name: '호치민 시티 투어',
    description: '역동적인 도심의 매력을 느끼는 시티 여행',
    duration: '3박 4일',
    price: 990000,
    originalPrice: 1290000,
    image: '/placeholder.png',
    cities: ['호치민'],
    schedule: [
      { day: 1, title: '인천 → 호치민', content: '호치민 도착 후 호텔 체크인' },
      { day: 2, title: '호치민 시내 관광', content: '통일궁, 노트르담 성당, 벤탄시장, 전쟁박물관' },
      { day: 3, title: '메콩델타 & 쿠치터널', content: '메콩델타 투어, 쿠치터널 역사 체험' },
      { day: 4, title: '호치민 → 인천', content: '자유시간 후 귀국' },
    ],
    included: [
      '왕복 항공권 (이코노미석)',
      '4성급 시내 호텔 숙박',
      '조식 포함 (전일정)',
      '한국어 가능 전문 가이드',
      '전용 차량',
      '일정표상 입장권',
      '여행자 보험',
    ],
    excluded: [
      '개인 경비 및 매너 팁',
      '중식, 석식',
      '선택관광 비용',
    ],
  },
  '4': {
    id: '4',
    name: '푸꾸옥 프리미엄 리조트',
    description: '순백의 해변에서 즐기는 럭셔리 올인클루시브',
    duration: '4박 6일',
    price: 2390000,
    originalPrice: 3290000,
    image: '/placeholder.png',
    cities: ['푸꾸옥'],
    schedule: [
      { day: 1, title: '인천 → 푸꾸옥', content: '푸꾸옥 도착 후 5성급 리조트 체크인' },
      { day: 2, title: '빈펄랜드 & 케이블카', content: '세계 최장 해상 케이블카, 빈펄랜드 자유 이용' },
      { day: 3, title: '남부 섬 투어', content: '스노클링, 산호 관람, 선셋 크루즈' },
      { day: 4, title: '리조트 자유시간', content: '리조트 풀, 스파, 비치에서 휴식' },
      { day: 5, title: '야시장 & 쇼핑', content: '푸꾸옥 야시장, 현지 쇼핑' },
      { day: 6, title: '푸꾸옥 → 인천', content: '공항 이동 후 귀국' },
    ],
    included: [
      '왕복 항공권 (이코노미석)',
      '5성급 리조트 숙박 (올인클루시브)',
      '전일정 식사 & 음료',
      '빈펄랜드 티켓',
      '공항 픽업 & 샌딩',
      '커플 스파 1회',
      '여행자 보험',
    ],
    excluded: [
      '개인 경비 및 매너 팁',
      '리조트 유료 액티비티',
      '선택관광 비용',
    ],
  },
};

export default function PackageDetailPage() {
  const params = useParams();
  const packageId = params.id as string;
  const pkg = packageData[packageId];
  const [isFavorite, setIsFavorite] = useState(false);

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 mb-2">패키지를 찾을 수 없습니다</p>
          <Link href="/package" className="text-[#ffa726] hover:underline">
            여행팩 목록으로
          </Link>
        </div>
      </div>
    );
  }

  if (!Array.isArray(pkg.cities) || !pkg.cities.every((city: string) => city === PRIMARY_REGION)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center max-w-md">
          <p className="text-2xl font-bold text-gray-900 mb-2">곧 출시 예정이에요</p>
          <p className="text-gray-600 mb-6">현재는 푸꾸옥 패키지만 예약할 수 있어요.</p>
          <Link
            href="/package"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ffa726] text-white font-semibold rounded-xl hover:bg-[#f57c00] transition-colors"
          >
            푸꾸옥 패키지 보러가기
          </Link>
        </div>
      </div>
    );
  }

  const discountRate = Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 이미지 */}
      <div className="relative h-[400px] bg-gradient-to-br from-[#ffa726] to-[#ffb74d]">
        <SafeImage src={pkg.image} alt={pkg.name} fill className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 pb-8">
            <div className="flex gap-3 mb-4">
              <span className="px-3 py-1.5 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white rounded-lg text-sm font-bold shadow-lg">
                {discountRate}% 할인
              </span>
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-lg text-sm font-bold">
                베스트딜
              </span>
            </div>
            <h1 className="text-[40px] font-bold text-white mb-3 tracking-tight">{pkg.name}</h1>
            <p className="text-xl text-white/90">{pkg.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-8">
            {/* 여행 일정 */}
            <div className="bg-white rounded-2xl p-8 shadow-md mb-8">
              <h2 className="text-[26px] font-bold text-gray-900 mb-6">여행 일정</h2>
              <div className="space-y-6">
                {pkg.schedule.map((day: any) => (
                  <div key={day.day} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ffa726] to-[#ffb74d] text-white flex items-center justify-center font-bold shadow-md">
                        {day.day}일
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{day.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{day.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 포함/불포함 */}
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h2 className="text-[26px] font-bold text-gray-900 mb-6">포함/불포함 사항</h2>
              
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  포함 사항
                </h3>
                <ul className="space-y-3">
                  {pkg.included.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                  불포함 사항
                </h3>
                <ul className="space-y-3">
                  {pkg.excluded.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 예약 사이드바 */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl p-6 shadow-md sticky top-24">
              {/* 가격 */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <p className="text-gray-400 text-lg line-through mb-2">
                  ₩{pkg.originalPrice.toLocaleString()}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[36px] font-bold text-gray-900">
                    ₩{pkg.price.toLocaleString()}
                  </span>
                  <span className="text-gray-600 text-sm">/ 1인</span>
                </div>
                <p className="text-red-600 text-sm font-semibold mt-2">
                  {discountRate}% 특별 할인 적용
                </p>
              </div>

              {/* 정보 */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-[#ffa726]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">여행 기간</p>
                    <p className="text-[15px] font-bold text-gray-900">{pkg.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <UserGroupIcon className="w-5 h-5 text-[#ffa726]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">최소 인원</p>
                    <p className="text-[15px] font-bold text-gray-900">2인 이상</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <CalendarDaysIcon className="w-5 h-5 text-[#ffa726]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">출발일</p>
                    <p className="text-[15px] font-bold text-gray-900">매일 출발 가능</p>
                  </div>
                </div>
              </div>

              {/* 버튼 */}
              <button className="w-full py-4 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white rounded-xl font-bold text-lg hover:from-[#f57c00] hover:to-[#ffa726] transition-all shadow-lg hover:shadow-xl mb-3">
                지금 예약하기
              </button>

              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-white border-2 border-gray-200 text-gray-900 rounded-xl font-semibold hover:border-[#ffa726] hover:text-[#ffa726] transition-all">
                  <PhoneIcon className="w-5 h-5 inline mr-1" />
                  문의하기
                </button>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-3 border-2 border-gray-200 rounded-xl hover:border-red-500 transition-all"
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="w-6 h-6 text-red-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6 text-gray-600" />
                  )}
                </button>
                <button className="p-3 border-2 border-gray-200 rounded-xl hover:border-[#ffa726] transition-all">
                  <ShareIcon className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
