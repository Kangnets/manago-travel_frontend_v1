'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SafeImage from '@/components/ui/SafeImage';
import { productAPI } from '@/lib/api';
import { Product } from '@/types/product';
import { PRIMARY_REGION } from '@/lib/regionPolicy';
import {
  MapPinIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  BuildingOfficeIcon,
  TicketIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface TravelPackage {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  originalPrice: number;
  image: string;
  cities: string[];
  highlights: string[];
  included: string[];
  popular: boolean;
  bestDeal: boolean;
}

const travelPackages: TravelPackage[] = [
  {
    id: '1',
    name: '하노이 & 하롱베이 완전정복',
    description: '푸꾸옥에서 휴양과 액티비티를 동시에 즐기는 프리미엄 패키지',
    duration: '3박 5일',
    price: 1290000,
    originalPrice: 1690000,
    image: '/placeholder.png',
    cities: ['하노이', '하롱베이'],
    highlights: ['하롱베이 크루즈', '구시가지 투어', '전통 수상인형극', '사파 트레킹'],
    included: ['왕복 항공권', '특급 호텔', '전일정 식사', '한국어 가이드', '입장권'],
    popular: true,
    bestDeal: true,
  },
  {
    id: '2',
    name: '다낭 & 호이안 힐링 여행',
    description: '푸꾸옥 인기 스팟을 중심으로 여유롭게 즐기는 힐링 패키지',
    duration: '4박 6일',
    price: 1590000,
    originalPrice: 2190000,
    image: '/placeholder.png',
    cities: ['다낭', '호이안'],
    highlights: ['미케 비치', '바나힐', '호이안 구시가지', '야시장 탐방'],
    included: ['왕복 항공권', '5성급 리조트', '조식 포함', '한국어 가이드', '무료 골프 1회'],
    popular: true,
    bestDeal: false,
  },
  {
    id: '3',
    name: '호치민 시티 투어',
    description: '푸꾸옥 핵심 코스를 알차게 즐기는 베스트셀러 여행',
    duration: '3박 4일',
    price: 990000,
    originalPrice: 1290000,
    image: '/placeholder.png',
    cities: ['호치민'],
    highlights: ['통일궁', '벤탄시장', '메콩델타 투어', '쿠치터널'],
    included: ['왕복 항공권', '4성급 호텔', '조식 포함', '한국어 가이드'],
    popular: false,
    bestDeal: true,
  },
  {
    id: '4',
    name: '푸꾸옥 프리미엄 리조트',
    description: '순백의 해변에서 즐기는 럭셔리 올인클루시브',
    duration: '4박 6일',
    price: 2390000,
    originalPrice: 3290000,
    image: '/placeholder.png',
    cities: ['푸꾸옥'],
    highlights: ['빈펄랜드', '케이블카', '야시장', '스노클링', '선셋 크루즈'],
    included: ['왕복 항공권', '5성급 리조트', '올인클루시브', '공항 픽업', '스파 1회'],
    popular: true,
    bestDeal: false,
  },
  {
    id: '5',
    name: '나트랑 비치 리조트',
    description: '맑은 바다에서 즐기는 휴양과 액티비티',
    duration: '3박 5일',
    price: 1190000,
    originalPrice: 1590000,
    image: '/placeholder.png',
    cities: ['나트랑'],
    highlights: ['나트랑 비치', '빈펄랜드', '머드 스파', '스노클링', '롱선사'],
    included: ['왕복 항공권', '4성급 리조트', '조식 포함', '한국어 가이드', '빈펄랜드 티켓'],
    popular: false,
    bestDeal: true,
  },
  {
    id: '6',
    name: '푸꾸옥 완전 정복 여행',
    description: '푸꾸옥의 핵심 명소를 한 번에 담은 올인원 패키지',
    duration: '7박 9일',
    price: 2890000,
    originalPrice: 3890000,
    image: '/placeholder.png',
    cities: ['하노이', '다낭', '호이안', '호치민'],
    highlights: ['4개 도시 투어', '하롱베이', '바나힐', '메콩델타', '전통 문화 체험'],
    included: ['왕복 항공권', '국내선 항공', '특급 호텔', '전일정 식사', '전문 가이드'],
    popular: true,
    bestDeal: true,
  },
  {
    id: '7',
    name: '다낭 골프 패키지',
    description: '명문 골프장 3곳 + 럭셔리 리조트',
    duration: '4박 6일',
    price: 1890000,
    originalPrice: 2490000,
    image: '/placeholder.png',
    cities: ['다낭'],
    highlights: ['3라운드 골프', '캐디피 포함', '골프장 픽업', '5성급 리조트'],
    included: ['왕복 항공권', '5성급 골프 리조트', '3라운드 그린피', '캐디피', '카트피'],
    popular: true,
    bestDeal: false,
  },
  {
    id: '8',
    name: '신혼여행 스페셜 패키지',
    description: '평생 기억에 남을 로맨틱 푸꾸옥 허니문',
    duration: '5박 7일',
    price: 2590000,
    originalPrice: 3490000,
    image: '/placeholder.png',
    cities: ['다낭', '푸꾸옥'],
    highlights: ['프라이빗 디너', '커플 스파', '선셋 크루즈', '프리미엄 리조트'],
    included: ['왕복 항공권', '특급 리조트', '허니문 혜택', '커플 스파', '로맨틱 디너'],
    popular: true,
    bestDeal: true,
  },
];

export default function PackagePage() {
  const [selectedDuration, setSelectedDuration] = useState('전체');
  const [selectedPrice, setSelectedPrice] = useState('전체');
  const [showOnlyBestDeal, setShowOnlyBestDeal] = useState(false);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const durations = ['전체', '3박 이하', '4-5박', '6박 이상'];
  const priceRanges = ['전체', '100만원 이하', '100-200만원', '200만원 이상'];

  useEffect(() => {
    productAPI.getAll({ category: 'package' })
      .then((data) => { if (data.length > 0) setApiProducts(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visibleApiProducts = apiProducts.filter((p) => p.location === PRIMARY_REGION);

  const filteredPackages = (visibleApiProducts.length > 0 ? [] : travelPackages).filter(pkg => {
    if (showOnlyBestDeal && !pkg.bestDeal) return false;
    if (!pkg.cities.every((city) => city === PRIMARY_REGION)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 히어로 섹션 */}
      <div className="relative bg-gradient-to-br from-[#ffa726] via-[#ff9800] to-amber-700 text-white py-20 overflow-hidden">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px]" />
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <PaperAirplaneIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-[44px] font-bold tracking-tight">푸꾸옥 여행팩</h1>
          </div>
          <p className="text-xl text-white/90 mb-10 leading-relaxed max-w-xl">
            항공권부터 숙소, 투어까지 한 번에 해결하는 올인원 패키지
          </p>

          {/* 혜택 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { icon: PaperAirplaneIcon, title: '항공권 포함', desc: '왕복 항공권' },
              { icon: BuildingOfficeIcon, title: '프리미엄 숙소', desc: '4-5성급 호텔' },
              { icon: TicketIcon, title: '필수 투어', desc: '인기 투어 포함' },
              { icon: CurrencyDollarIcon, title: '최대 40% 할인', desc: '개별 구매보다 저렴' },
            ].map((benefit, idx) => {
              const IconComponent = benefit.icon;
              return (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-lg mb-1">{benefit.title}</p>
                  <p className="text-sm text-white/70">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 py-12">
        {/* 필터 */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">
                여행 기간
              </label>
              <div className="flex flex-wrap gap-2">
                {durations.map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedDuration === duration
                        ? 'bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {duration}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">
                가격대
              </label>
              <div className="flex flex-wrap gap-2">
                {priceRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedPrice(range)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedPrice === range
                        ? 'bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">
                베스트딜만 보기
              </label>
              <button
                onClick={() => setShowOnlyBestDeal(!showOnlyBestDeal)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  showOnlyBestDeal
                    ? 'bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {showOnlyBestDeal ? '✓ 베스트딜' : '전체 보기'}
              </button>
            </div>
          </div>
        </div>

        {/* 패키지 목록 */}
        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-gray-900">{visibleApiProducts.length > 0 ? visibleApiProducts.length : filteredPackages.length}개</span>의 여행팩이 있습니다
          </p>
        </div>

        {/* API에서 패키지 상품이 있으면 표시 */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-64 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleApiProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {visibleApiProducts.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100">
                <div className="relative h-52 bg-gray-100">
                  <SafeImage src={p.imageUrl || '/placeholder.png'} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  {p.originalPrice && p.originalPrice > p.price && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                      {Math.round((1 - p.price / p.originalPrice) * 100)}% 할인
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs text-gray-400 mb-1">{p.location}</p>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{p.title}</h3>
                  <p className="text-xl font-bold text-gray-900">₩{p.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPackages.map((pkg) => (
            <Link
              key={pkg.id}
              href={`/package/${pkg.id}`}
              className="group"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100">
                <div className="relative h-[240px]">
                  <SafeImage
                    src={pkg.image}
                    alt={pkg.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* 배지 */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {pkg.popular && (
                      <span className="px-3 py-1 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white rounded-lg text-xs font-bold shadow-lg">
                        인기
                      </span>
                    )}
                    {pkg.bestDeal && (
                      <span className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold shadow-lg">
                        특가
                      </span>
                    )}
                  </div>

                  {/* 가격 */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-white/80 text-sm line-through mb-1">
                          ₩{pkg.originalPrice.toLocaleString()}
                        </p>
                        <p className="text-white text-3xl font-bold">
                          ₩{pkg.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg">
                        <p className="text-white text-sm font-semibold">{pkg.duration}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#ffa726] transition-colors">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {pkg.description}
                  </p>

                  {/* 도시 태그 */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {pkg.cities.map((city, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-gray-800 rounded-lg text-xs font-semibold"
                      >
                        <MapPinIcon className="w-3 h-3" />
                        {city}
                      </span>
                    ))}
                  </div>

                  {/* 주요 일정 */}
                  <div className="space-y-2 mb-4">
                    {pkg.highlights.slice(0, 3).map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>

                  {/* 포함 사항 */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {pkg.included.slice(0, 4).map((item, idx) => (
                        <span key={idx} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
