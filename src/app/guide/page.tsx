'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import ProductCardType2 from '@/components/ProductCard/ProductCardType2';
import { productAPI } from '@/lib/api';
import { Product } from '@/types/product';
import { PRIMARY_REGION, REGION_OPTIONS, isPrimaryRegion, notifyComingSoon } from '@/lib/regionPolicy';
import {
  AdjustmentsHorizontalIcon,
  AcademicCapIcon,
  UserGroupIcon,
  StarIcon,
  GlobeAsiaAustraliaIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const CITIES = [...REGION_OPTIONS];
const GUIDE_TYPES = ['전체', '프라이빗 가이드', '그룹 투어', '문화·역사', '자연·어드벤처', '쿠킹·체험', '사진 투어'];
const SORT_OPTIONS = ['추천순', '낮은 가격순', '높은 가격순', '평점순'];

const FEATURES = [
  { icon: ChatBubbleLeftRightIcon, title: '한국어 전문 가이드', desc: '한국인 가이드 & 현지 한국어 통역' },
  { icon: UserGroupIcon, title: '소수 정예 투어', desc: '최대 10명 이하 프리미엄 진행' },
  { icon: GlobeAsiaAustraliaIcon, title: '현지 전문가', desc: '10년 이상 경력의 검증된 가이드' },
];

export default function GuidePage() {
  const [selectedCity, setSelectedCity] = useState<string>(PRIMARY_REGION);
  const [selectedType, setSelectedType] = useState('전체');
  const [sortBy, setSortBy] = useState('추천순');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productAPI.getAll({ category: 'guide' })
      .then((data) => setAllProducts(Array.isArray(data) ? data : []))
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let products = [...allProducts];
    products = products.filter((p) => p.location === selectedCity);
    if (sortBy === '낮은 가격순') products.sort((a, b) => a.price - b.price);
    else if (sortBy === '높은 가격순') products.sort((a, b) => b.price - a.price);
    else if (sortBy === '평점순') products.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return products;
  }, [allProducts, selectedCity, sortBy]);

  const handleCitySelect = (city: string) => {
    if (!isPrimaryRegion(city)) {
      notifyComingSoon(city);
      return;
    }
    setSelectedCity(city);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 히어로 */}
      <div className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px]" />

        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <AcademicCapIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-[40px] font-bold tracking-tight">한국어 전문 가이드</h1>
              <p className="text-white/70 text-sm mt-1">현지 전문가와 함께하는 깊이 있는 푸꾸옥 여행</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
            {FEATURES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-bold text-base mb-1">{item.title}</p>
                  <p className="text-sm text-white/70">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky 필터 */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="text-sm font-semibold text-gray-700">도시:</span>
            {CITIES.map((city) => (
              <button key={city} onClick={() => handleCitySelect(city)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedCity === city ? 'bg-teal-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {city}
              </button>
            ))}
            <div className="w-px h-5 bg-gray-200 shrink-0" />
            <span className="text-sm font-semibold text-gray-700">유형:</span>
            {GUIDE_TYPES.map((type) => (
              <button key={type} onClick={() => setSelectedType(type)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedType === type ? 'bg-teal-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {type}
              </button>
            ))}
            <div className="ml-auto">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none">
                {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 py-10">
        {/* 결과 */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-gray-900">{filtered.length}개</span>의 가이드 서비스
            <span className="ml-2 text-teal-600 font-semibold">({selectedCity})</span>
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCardType2 key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
            <AcademicCapIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">선택한 도시의 가이드 서비스가 없습니다</p>
            <button
              onClick={() => setSelectedCity(PRIMARY_REGION)}
              className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors text-sm"
            >
              전체 보기
            </button>
          </div>
        )}

        {/* 가이드 소개 배너 */}
        <div className="mt-10 bg-teal-50 border border-teal-100 rounded-2xl p-6">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
              <StarIcon className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="font-bold text-teal-900 mb-1">나만을 위한 프라이빗 가이드 요청</p>
              <p className="text-sm text-teal-700">가족 여행, 허니문, 기업 단체 등 특별한 일정에 맞게 전담 가이드를 배정해 드립니다.</p>
            </div>
          </div>
        </div>

        {/* 다른 카테고리 */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">다른 카테고리도 둘러보세요</p>
          <div className="flex flex-wrap gap-3">
            {[
              { href: '/tour', label: '투어 & 티켓' },
              { href: '/hotel', label: '호텔' },
              { href: '/golf', label: '골프' },
              { href: '/spa', label: '스파 & 마사지' },
              { href: '/restaurant', label: '맛집 투어' },
              { href: '/vehicle', label: '차량 이동' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-teal-400 hover:text-teal-600 transition-colors shadow-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
