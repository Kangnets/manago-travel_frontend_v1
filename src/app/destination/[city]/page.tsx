'use client';

import { useParams } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCardType1 from '@/components/ProductCard/ProductCardType1';
import Emoji3D from '@/components/ui/Emoji3D';
import { productAPI } from '@/lib/api';
import { Product } from '@/types/product';
import { vietnamPhotos, optimizeUnsplash } from '@/lib/unsplash';
import { PRIMARY_REGION, isPrimaryRegion, notifyComingSoon } from '@/lib/regionPolicy';
import {
  MapPinIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
  GlobeAsiaAustraliaIcon,
  TicketIcon,
  SparklesIcon,
  TruckIcon,
  AcademicCapIcon,
  FireIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

type CitySlug = 'hanoi' | 'hochiminh' | 'nhatrang' | 'phuquoc';

interface CityData {
  slug: CitySlug;
  name: string;
  englishName: string;
  shortDesc: string;
  imageKey: keyof typeof vietnamPhotos;
  bestSeason: string;
  weather: string;
}

const cityDataList: CityData[] = [
  {
    slug: 'hanoi',
    name: '하노이',
    englishName: 'Hanoi',
    shortDesc: '천년 역사가 살아 숨 쉬는 고도',
    imageKey: 'hanoi',
    bestSeason: '10월~4월',
    weather: '연평균 24°C',
  },
  {
    slug: 'hochiminh',
    name: '호치민',
    englishName: 'Ho Chi Minh City',
    shortDesc: '역동적인 오토바이와 불야성의 경제 수도',
    imageKey: 'hochiminh',
    bestSeason: '12월~4월',
    weather: '연평균 27°C',
  },
  {
    slug: 'nhatrang',
    name: '나트랑',
    englishName: 'Nha Trang',
    shortDesc: '에메랄드 바다와 액티비티의 해양 도시',
    imageKey: 'nhatrang',
    bestSeason: '1월~8월',
    weather: '연평균 26°C',
  },
  {
    slug: 'phuquoc',
    name: '푸꾸옥',
    englishName: 'Phu Quoc',
    shortDesc: '백사장과 청정 바다의 아일랜드 휴양지',
    imageKey: 'phuquoc',
    bestSeason: '11월~3월',
    weather: '연평균 27°C',
  },
];

const CATEGORY_TABS = [
  { key: 'all', label: '전체', icon: FunnelIcon },
  { key: 'tour', label: '투어', icon: TicketIcon },
  { key: 'hotel', label: '호텔', icon: BuildingOfficeIcon },
  { key: 'golf', label: '골프', icon: GlobeAsiaAustraliaIcon },
  { key: 'spa', label: '스파', icon: SparklesIcon },
  { key: 'restaurant', label: '맛집', icon: FireIcon },
  { key: 'vehicle', label: '차량', icon: TruckIcon },
  { key: 'guide', label: '가이드', icon: AcademicCapIcon },
];

const SORT_OPTIONS = ['추천순', '낮은 가격순', '높은 가격순', '평점순'];

const cityBySlug: Record<string, CityData> = {};
cityDataList.forEach((c) => { cityBySlug[c.slug] = c; });

export default function CityPage() {
  const params = useParams();
  const rawSlug = decodeURIComponent((params.city as string) || '').toLowerCase();
  const city = cityBySlug[rawSlug];

  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('추천순');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!city) {
      setAllProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    productAPI.getAll({ location: city.name, limit: 500 })
      .then((data) => setAllProducts(Array.isArray(data) ? data : []))
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  }, [city?.name]);

  const cityProducts = useMemo(() => {
    if (!city) return [];
    let products = [...allProducts];
    if (activeCategory !== 'all') products = products.filter((p) => p.category === activeCategory);
    if (sortBy === '낮은 가격순') products = [...products].sort((a, b) => a.price - b.price);
    else if (sortBy === '높은 가격순') products = [...products].sort((a, b) => b.price - a.price);
    else if (sortBy === '평점순') products = [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return products;
  }, [city, allProducts, activeCategory, sortBy]);

  const categoryCounts = useMemo(() => {
    if (!city) return {};
    const counts: Record<string, number> = { all: allProducts.length };
    allProducts.forEach((p) => {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    });
    return counts;
  }, [city, allProducts]);

  if (!city) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <p className="text-2xl font-bold text-gray-900 mb-2">도시를 찾을 수 없습니다</p>
          <p className="text-gray-600 mb-6">요청한 주소가 잘못되었거나 페이지가 이동되었을 수 있습니다.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ffa726] text-white font-semibold rounded-xl hover:bg-[#f57c00] transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" /> 홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (!isPrimaryRegion(city.name)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <p className="text-2xl font-bold text-gray-900 mb-2">{city.name} 서비스는 준비 중입니다</p>
          <p className="text-gray-600 mb-6">곧 출시 예정이에요. 현재는 푸꾸옥 지역만 예약할 수 있어요.</p>
          <Link
            href="/destination/phuquoc"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ffa726] text-white font-semibold rounded-xl hover:bg-[#f57c00] transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" /> 푸꾸옥 상품 보러가기
          </Link>
        </div>
      </div>
    );
  }

  const heroUrl = optimizeUnsplash(vietnamPhotos[city.imageKey] || vietnamPhotos.phuquoc, 1920, 85);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 히어로 */}
      <div className="relative h-[320px] sm:h-[380px] overflow-hidden">
        <Image src={heroUrl} alt={city.name} fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-[1200px] mx-auto w-full px-5 sm:px-6 lg:px-8 pb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-4">
              <ArrowLeftIcon className="w-4 h-4" /> 홈
            </Link>
            <div className="flex items-end gap-4 flex-wrap">
              <div>
                <span className="text-white/70 text-base">{city.englishName}</span>
                <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">{city.name}</h1>
                <p className="text-white/85 mt-1">{city.shortDesc}</p>
              </div>
              {/* 간단 정보 배지 */}
              <div className="flex gap-3 pb-1 ml-auto">
                <span className="bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  <Emoji3D emoji="🌤" className="text-sm align-[-2px] mr-1" />
                  {city.weather}
                </span>
                <span className="bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  <Emoji3D emoji="🗓️" className="text-sm align-[-2px] mr-1" />
                  베스트: {city.bestSeason}
                </span>
                <span className="bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  <Emoji3D
                    emoji="🛂"
                    className="text-sm align-[-2px] mr-1"
                    shadow="0 1px 0 #f7fbff, 0 2px 0 #d7e8ff, 0 3px 0 #a7cbff, 0 4px 0 #6fa9ff, 0 10px 16px rgba(66,133,244,0.35)"
                  />
                  15일 무비자
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 py-10">
        {/* 카테고리 탭 + 정렬 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* 카테고리 탭 */}
            <div className="flex gap-2 flex-wrap flex-1">
              {CATEGORY_TABS.map((tab) => {
                const count = categoryCounts[tab.key] ?? 0;
                if (tab.key !== 'all' && count === 0) return null;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveCategory(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeCategory === tab.key
                        ? 'bg-[#ffa726] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {count > 0 && (
                      <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                        activeCategory === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* 정렬 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#ffa726] focus:border-transparent outline-none shrink-0"
            >
              {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* 결과 헤더 */}
        <div className="flex items-center gap-2 mb-6">
          <MapPinIcon className="w-5 h-5 text-[#ffa726]" />
          <p className="text-gray-700 font-medium">
            <span className="text-[#ffa726] font-bold">{city.name}</span>의&nbsp;
            {activeCategory === 'all' ? '전체 상품' : CATEGORY_TABS.find((t) => t.key === activeCategory)?.label}&nbsp;
            <span className="font-bold text-gray-900">{cityProducts.length}개</span>
          </p>
        </div>

        {/* 상품 그리드 */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : cityProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {cityProducts.map((product) => (
              <ProductCardType1 key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
            <MapPinIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2 font-medium">
              {activeCategory === 'all'
                ? `${city.name}의 등록된 상품이 아직 없습니다.`
                : `${city.name}의 ${CATEGORY_TABS.find((t) => t.key === activeCategory)?.label} 상품이 없습니다.`}
            </p>
            <p className="text-sm text-gray-400 mb-5">다른 카테고리나 도시를 선택해보세요.</p>
            <button
              onClick={() => setActiveCategory('all')}
              className="px-6 py-2 bg-[#ffa726] text-white rounded-xl font-medium hover:bg-[#f57c00] transition-colors text-sm"
            >
              전체 상품 보기
            </button>
          </div>
        )}

        {/* 다른 도시 */}
        <div className="mt-14 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">다른 도시도 둘러보세요</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {cityDataList
              .filter((c) => c.slug !== city.slug)
              .map((c) => {
                const thumbUrl = optimizeUnsplash(vietnamPhotos[c.imageKey], 400, 70);
                const clickable = isPrimaryRegion(c.name);
                return (
                  clickable ? (
                    <Link
                      key={c.slug}
                      href={`/destination/${c.slug}`}
                      className="group relative h-28 rounded-2xl overflow-hidden shadow-sm"
                    >
                      <Image src={thumbUrl} alt={c.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="200px" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white font-bold text-sm">{c.name}</p>
                        <p className="text-white/70 text-xs">상품 보기</p>
                      </div>
                    </Link>
                  ) : (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => notifyComingSoon(c.name)}
                      className="group relative h-28 rounded-2xl overflow-hidden shadow-sm text-left"
                    >
                      <Image src={thumbUrl} alt={c.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="200px" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white font-bold text-sm">{c.name}</p>
                        <p className="text-white/70 text-xs">곧 출시 예정</p>
                      </div>
                    </button>
                  )
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
