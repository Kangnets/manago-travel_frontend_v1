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
  MapPinIcon,
  BuildingOfficeIcon,
  StarIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const CITIES = [...REGION_OPTIONS];
const PRICE_RANGES = ['전체', '10만원 이하', '10~30만원', '30~50만원', '50만원 이상'];
const SORT_OPTIONS = ['추천순', '낮은 가격순', '높은 가격순', '평점순'];

function priceInRange(price: number, range: string) {
  if (range === '전체') return true;
  if (range === '10만원 이하') return price < 100000;
  if (range === '10~30만원') return price >= 100000 && price < 300000;
  if (range === '30~50만원') return price >= 300000 && price < 500000;
  return price >= 500000;
}

export default function HotelPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>(PRIMARY_REGION);
  const [priceRange, setPriceRange] = useState('전체');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [sortBy, setSortBy] = useState('추천순');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productAPI.getAll({ category: 'hotel' })
      .then((data) => setAllProducts(Array.isArray(data) ? data : []))
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const hotelProducts = useMemo(() => {
    let products = [...allProducts];
    products = products.filter((p) => p.location === selectedCity);
    if (priceRange !== '전체') products = products.filter((p) => priceInRange(p.price, priceRange));
    if (appliedQuery.trim()) {
      const q = appliedQuery.toLowerCase();
      products = products.filter((p) => p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q));
    }
    if (sortBy === '낮은 가격순') products = [...products].sort((a, b) => a.price - b.price);
    else if (sortBy === '높은 가격순') products = [...products].sort((a, b) => b.price - a.price);
    else if (sortBy === '평점순') products = [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return products;
  }, [allProducts, selectedCity, priceRange, appliedQuery, sortBy]);

  const handleCitySelect = (city: string) => {
    if (!isPrimaryRegion(city)) {
      notifyComingSoon(city);
      return;
    }
    setSelectedCity(city);
  };

  const handleSearch = () => setAppliedQuery(searchQuery);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 히어로 섹션 */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#ffa726]/10 rounded-full blur-[120px]" />
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ffa726] to-[#ff9800] flex items-center justify-center shadow-lg shadow-orange-500/30">
              <BuildingOfficeIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-[40px] font-bold tracking-tight">푸꾸옥 호텔 예약</h1>
              <p className="text-white/70 text-sm mt-0.5">특급 리조트부터 가성비 호텔까지, 푸꾸옥의 모든 숙소를 한눈에</p>
            </div>
          </div>

          {/* 검색 폼 */}
          <div className="bg-white rounded-2xl p-5 shadow-2xl mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">어디로 가시나요?</label>
                <div className="relative">
                  <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="도시, 호텔명 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffa726] focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">체크인</label>
                <div className="relative">
                  <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffa726] focus:border-transparent outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">체크아웃</label>
                <div className="relative">
                  <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffa726] focus:border-transparent outline-none text-sm" />
                </div>
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="w-full mt-4 py-3 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white rounded-xl font-semibold hover:from-[#f57c00] hover:to-[#ffa726] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              호텔 검색하기
            </button>
          </div>
        </div>
      </div>

      {/* Sticky 필터 영역 */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="text-sm font-semibold text-gray-700">필터:</span>

            {/* 도시 */}
            <div className="flex gap-1.5 flex-wrap">
              {CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCity === city ? 'bg-[#ffa726] text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-gray-200 shrink-0" />

            {/* 가격대 */}
            <div className="flex gap-1.5 flex-wrap">
              {PRICE_RANGES.map((range) => (
                <button
                  key={range}
                  onClick={() => setPriceRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    priceRange === range ? 'bg-[#ffa726] text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#ffa726] focus:border-transparent outline-none"
              >
                {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 결과 영역 */}
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-2 mb-6">
          <StarIcon className="w-5 h-5 text-[#ffa726]" />
          <p className="text-gray-700 font-medium">
            <span className="font-bold text-gray-900">{hotelProducts.length}개</span>의 호텔
            <span className="text-[#ffa726] font-semibold ml-1.5">({selectedCity})</span>
            {appliedQuery && <span className="text-gray-500 ml-1.5">· &ldquo;{appliedQuery}&rdquo; 검색 결과</span>}
          </p>
          {appliedQuery && (
            <button onClick={() => { setSearchQuery(''); setAppliedQuery(''); }} className="ml-2 text-xs text-gray-400 hover:text-gray-600 underline">
              초기화
            </button>
          )}
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
        ) : hotelProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotelProducts.map((product) => (
              <ProductCardType2 key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
            <BuildingOfficeIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">검색 결과가 없습니다</p>
            <p className="text-sm text-gray-400">다른 조건으로 검색해보세요</p>
            <button
              onClick={() => { setSelectedCity(PRIMARY_REGION); setPriceRange('전체'); setSearchQuery(''); setAppliedQuery(''); }}
              className="mt-4 px-6 py-2 bg-[#ffa726] text-white rounded-xl font-medium hover:bg-[#f57c00] transition-colors text-sm"
            >
              필터 초기화
            </button>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">다른 카테고리도 둘러보세요</p>
          <div className="flex flex-wrap gap-3">
            {[
              { href: '/tour', label: '투어 & 티켓' },
              { href: '/golf', label: '골프' },
              { href: '/spa', label: '스파 & 마사지' },
              { href: '/restaurant', label: '맛집 투어' },
              { href: '/vehicle', label: '차량 이동' },
              { href: '/guide', label: '가이드' },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-[#ffa726] hover:text-[#ffa726] transition-colors shadow-sm">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
