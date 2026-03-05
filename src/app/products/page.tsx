'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductCardType2 from '@/components/ProductCard/ProductCardType2';
import { productAPI } from '@/lib/api';
import { Product } from '@/types/product';
import { PRIMARY_REGION, REGION_OPTIONS, isPrimaryRegion, notifyComingSoon } from '@/lib/regionPolicy';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const CATEGORIES = [
  { value: '', label: '전체' },
  { value: 'hotel', label: '호텔' },
  { value: 'golf', label: '골프' },
  { value: 'tour', label: '투어' },
  { value: 'spa', label: '스파' },
  { value: 'restaurant', label: '맛집' },
  { value: 'vehicle', label: '차량' },
  { value: 'guide', label: '가이드' },
];

const CITIES = [...REGION_OPTIONS];
const PRICE_RANGES = ['전체', '30만원 이하', '30~60만원', '60~100만원', '100만원 이상'];
const SORT_OPTIONS = ['추천순', '낮은 가격순', '높은 가격순', '평점순', '최신순'];

function priceInRange(price: number, range: string): boolean {
  if (range === '전체') return true;
  if (range === '30만원 이하') return price < 300000;
  if (range === '30~60만원') return price >= 300000 && price < 600000;
  if (range === '60~100만원') return price >= 600000 && price < 1000000;
  return price >= 1000000;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [appliedQuery, setAppliedQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>(PRIMARY_REGION);
  const [priceRange, setPriceRange] = useState('전체');
  const [sortBy, setSortBy] = useState('추천순');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await productAPI.getAll({ limit: 100 } as any);
        setAllProducts(Array.isArray(data) ? data : []);
      } catch {
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // URL 쿼리 변경 감지
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setAppliedQuery(q);
    setSearchInput(q);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    if (selectedCategory) {
      products = products.filter((p) => p.category === selectedCategory);
    }
    products = products.filter((p) => p.location === selectedCity);
    if (priceRange !== '전체') {
      products = products.filter((p) => priceInRange(p.price, priceRange));
    }
    if (appliedQuery.trim()) {
      const q = appliedQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          (p.country && p.country.toLowerCase().includes(q))
      );
    }

    if (sortBy === '낮은 가격순') products.sort((a, b) => a.price - b.price);
    else if (sortBy === '높은 가격순') products.sort((a, b) => b.price - a.price);
    else if (sortBy === '평점순') products.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else if (sortBy === '최신순') products.reverse();

    return products;
  }, [allProducts, selectedCategory, selectedCity, priceRange, appliedQuery, sortBy]);

  const handleSearch = () => {
    setAppliedQuery(searchInput);
    if (searchInput.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchInput.trim())}`, { scroll: false });
    } else {
      router.push('/products', { scroll: false });
    }
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedCity(PRIMARY_REGION);
    setPriceRange('전체');
    setAppliedQuery('');
    setSearchInput('');
    router.push('/products', { scroll: false });
  };

  const handleCitySelect = (city: string) => {
    if (!isPrimaryRegion(city)) {
      notifyComingSoon(city);
      return;
    }
    setSelectedCity(city);
  };

  const hasActiveFilters =
    selectedCategory || selectedCity !== PRIMARY_REGION || priceRange !== '전체' || appliedQuery;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ffa726]/10 rounded-full blur-[120px]" />
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-3">
            <Link href="/" className="text-white/50 text-sm hover:text-white/80 transition-colors">
              홈
            </Link>
            <span className="text-white/30 mx-2">/</span>
            <span className="text-white text-sm font-medium">상품 검색</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">
            {appliedQuery ? `"${appliedQuery}" 검색 결과` : '전체 상품'}
          </h1>
          <p className="text-white/60 text-sm">푸꾸옥 여행 상품을 탐색하세요</p>

          {/* 검색 바 */}
          <div className="mt-6 flex gap-3 max-w-2xl">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="상품명, 지역 검색..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-11 pr-4 py-3.5 bg-white rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa726]"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3.5 bg-[#ffa726] hover:bg-[#f57c00] text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-orange-500/25"
            >
              검색
            </button>
          </div>
        </div>
      </div>

      {/* 필터 바 (sticky) */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-500 shrink-0" />

            {/* 카테고리 */}
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-[#ffa726] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="w-px h-4 bg-gray-300 shrink-0" />

            {/* 도시 */}
            <div className="flex gap-1.5 flex-wrap">
              {CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCity === city
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* 가격 필터 */}
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#ffa726] focus:border-transparent outline-none"
              >
                {PRICE_RANGES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>

              {/* 정렬 */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#ffa726] focus:border-transparent outline-none"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                >
                  초기화
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 결과 영역 */}
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 py-8">
        {/* 결과 카운트 */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-700 font-medium text-sm">
            {loading ? (
              <span className="text-gray-400">검색 중...</span>
            ) : (
              <>
                총{' '}
                <span className="font-bold text-gray-900 text-base">{filteredProducts.length}개</span>의 상품
                {appliedQuery && (
                  <span className="text-gray-500 ml-1.5">
                    · &ldquo;{appliedQuery}&rdquo; 검색 결과
                  </span>
                )}
                {selectedCity && (
                  <span className="text-[#ffa726] font-semibold ml-1.5">({selectedCity})</span>
                )}
              </>
            )}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCardType2 key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
            <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-700 font-semibold text-lg mb-2">검색 결과가 없습니다</p>
            <p className="text-gray-500 text-sm mb-6">
              {appliedQuery
                ? `"${appliedQuery}"에 해당하는 상품을 찾을 수 없습니다.`
                : '선택한 조건에 맞는 상품이 없습니다.'}
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 bg-[#ffa726] text-white rounded-xl font-semibold hover:bg-[#f57c00] transition-colors text-sm"
            >
              전체 상품 보기
            </button>
          </div>
        )}

        {/* 카테고리 빠른 이동 */}
        {!loading && filteredProducts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">카테고리별 상품 보기</p>
            <div className="flex flex-wrap gap-3">
              {[
                { href: '/hotel', label: '호텔' },
                { href: '/tour', label: '투어 & 티켓' },
                { href: '/golf', label: '골프' },
                { href: '/spa', label: '스파 & 마사지' },
                { href: '/restaurant', label: '맛집 투어' },
                { href: '/vehicle', label: '차량 이동' },
                { href: '/guide', label: '가이드' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-[#ffa726] hover:text-[#ffa726] transition-colors shadow-sm"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#ffa726] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
