'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import ProductCardType2 from '@/components/ProductCard/ProductCardType2';
import { productAPI } from '@/lib/api';
import { Product } from '@/types/product';
import { PRIMARY_REGION, REGION_OPTIONS, isPrimaryRegion, notifyComingSoon } from '@/lib/regionPolicy';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  FireIcon,
  StarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { FireIcon as FireSolid } from '@heroicons/react/24/solid';

const CITIES = [...REGION_OPTIONS];
const FOOD_TYPES = ['전체', '해산물', '쌀국수·분짜', '반미', '스트리트 푸드', '파인다이닝', '쿠킹 클래스'];
const SORT_OPTIONS = ['추천순', '낮은 가격순', '높은 가격순', '평점순'];

const FEATURES = [
  { icon: FireSolid, title: '현지 맛집', desc: '현지인도 즐겨 찾는 인증 맛집' },
  { icon: StarIcon, title: '프리미엄 다이닝', desc: '5성급 레스토랑 & 루프탑' },
  { icon: ClockIcon, title: '쿠킹 클래스', desc: '현지 셰프와 함께하는 요리 체험' },
];

export default function RestaurantPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>(PRIMARY_REGION);
  const [selectedType, setSelectedType] = useState('전체');
  const [sortBy, setSortBy] = useState('추천순');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productAPI.getAll({ category: 'restaurant' })
      .then((data) => setAllProducts(Array.isArray(data) ? data : []))
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let products = [...allProducts];
    products = products.filter((p) => p.location === selectedCity);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      products = products.filter((p) => p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q));
    }
    if (sortBy === '낮은 가격순') products = [...products].sort((a, b) => a.price - b.price);
    else if (sortBy === '높은 가격순') products = [...products].sort((a, b) => b.price - a.price);
    else if (sortBy === '평점순') products = [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return products;
  }, [allProducts, selectedCity, searchQuery, sortBy]);

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
      <div className="relative bg-gradient-to-br from-orange-900 via-red-800 to-slate-900 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px]" />
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <FireIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-[40px] font-bold tracking-tight">푸꾸옥 맛집 & 푸드 투어</h1>
              <p className="text-white/70 text-sm mt-0.5">시푸드부터 파인다이닝까지, 푸꾸옥 미식 여행</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {FEATURES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                  <Icon className="w-6 h-6 text-orange-300 mb-2" />
                  <p className="font-bold mb-0.5">{item.title}</p>
                  <p className="text-sm text-white/70">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="맛집, 음식 종류 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/50"
              />
            </div>
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
              <button key={city} onClick={() => handleCitySelect(city)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedCity === city ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {city}
              </button>
            ))}
            <div className="w-px h-5 bg-gray-200 shrink-0" />
            <span className="text-sm font-semibold text-gray-700">종류:</span>
            {FOOD_TYPES.map((type) => (
              <button key={type} onClick={() => setSelectedType(type)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedType === type ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {type}
              </button>
            ))}
            <div className="ml-auto">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none">
                {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 결과 */}
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 py-10">
        <p className="text-gray-600 mb-6">
          <span className="font-bold text-gray-900">{filtered.length}개</span>의 맛집·푸드 투어
          <span className="text-orange-500 font-semibold ml-1.5">({selectedCity})</span>
          {searchQuery && <span className="text-gray-500 ml-1.5">· &ldquo;{searchQuery}&rdquo;</span>}
        </p>

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
            <FireIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">검색 결과가 없습니다</p>
            <button onClick={() => { setSelectedCity(PRIMARY_REGION); setSearchQuery(''); }} className="mt-3 px-5 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600">
              초기화
            </button>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">다른 카테고리도 둘러보세요</p>
          <div className="flex flex-wrap gap-3">
            {[{ href: '/hotel', label: '호텔' }, { href: '/tour', label: '투어' }, { href: '/spa', label: '스파' }, { href: '/golf', label: '골프' }, { href: '/vehicle', label: '차량' }, { href: '/guide', label: '가이드' }].map((item) => (
              <Link key={item.href} href={item.href} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-orange-400 hover:text-orange-500 transition-colors shadow-sm">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
