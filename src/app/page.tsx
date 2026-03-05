'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar/SearchBar';
import { useTranslations } from '@/lib/useTranslations';
import ProductCardType1 from '@/components/ProductCard/ProductCardType1';
import ProductCardType2 from '@/components/ProductCard/ProductCardType2';
import ProductCardType3 from '@/components/ProductCard/ProductCardType3';
import ReviewCard from '@/components/ReviewCard/ReviewCard';
import Footer from '@/components/Footer/Footer';
import TravelGuide from '@/components/TravelGuide/TravelGuide';
import { PRIMARY_REGION, REGION_OPTIONS, isPrimaryRegion, notifyComingSoon } from '@/lib/regionPolicy';
import { Product, Review } from '@/types/product';
import { productAPI, reviewAPI } from '@/lib/api';
import { heroPhotos, vietnamPhotos, categoryPhotos, golfPhotos, optimizeUnsplash } from '@/lib/unsplash';
import { allMockProducts, mockReviews } from '@/lib/mockData';
import Link from 'next/link';
import {
  ClockIcon,
  StarIcon,
  BoltIcon,
  BuildingOfficeIcon,
  GlobeAsiaAustraliaIcon,
  UserGroupIcon,
  TruckIcon,
  AcademicCapIcon,
  PaperAirplaneIcon,
  CurrencyDollarIcon,
  FireIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import {
  TicketIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';

const HERO_IMAGE = `${heroPhotos.main}?auto=format&fit=crop&w=1920&q=90`;

const cityLinks = [
  { nameKey: 'home.cities.phuquoc', region: '푸꾸옥', href: '/destination/phuquoc' },
  { nameKey: 'home.cities.hochiminh', region: '호치민', href: '/destination/hochiminh' },
  { nameKey: 'home.cities.hanoi', region: '하노이', href: '/destination/hanoi' },
  { nameKey: 'home.cities.nhatrang', region: '나트랑', href: '/destination/nhatrang' },
];

const categories = [
  { icon: BuildingOfficeIcon,      nameKey: 'home.category.hotel',      href: '/hotel' },
  { icon: TicketIcon,              nameKey: 'home.category.tourTicket', href: '/tour' },
  { icon: GlobeAsiaAustraliaIcon,  nameKey: 'home.category.golf',       href: '/golf' },
  { icon: SparklesIcon,            nameKey: 'home.category.spa',        href: '/spa' },
  { icon: FireIcon,                nameKey: 'home.category.restaurant', href: '/restaurant' },
  { icon: TruckIcon,               nameKey: 'home.category.vehicle',    href: '/vehicle' },
  { icon: AcademicCapIcon,         nameKey: 'home.category.guide',      href: '/guide' },
  { icon: PaperAirplaneIcon,       nameKey: 'home.category.package',    href: '/package' },
];

const FALLBACK_GOLF_PRODUCTS: Product[] = [
  {
    id: 'fallback-golf-1',
    title: '푸꾸옥 오션뷰 챔피언십 라운드',
    location: PRIMARY_REGION,
    country: PRIMARY_REGION,
    duration: '18홀',
    price: 230000,
    rating: 4.9,
    imageUrl: optimizeUnsplash(golfPhotos.tropical, 800, 82),
    category: 'golf',
  },
  {
    id: 'fallback-golf-2',
    title: '푸꾸옥 선셋 트와일라잇 골프',
    location: PRIMARY_REGION,
    country: PRIMARY_REGION,
    duration: '18홀',
    price: 210000,
    rating: 4.8,
    imageUrl: optimizeUnsplash(golfPhotos.coastal, 800, 82),
    category: 'golf',
  },
  {
    id: 'fallback-golf-3',
    title: '푸꾸옥 리조트 프리미엄 골프팩',
    location: PRIMARY_REGION,
    country: PRIMARY_REGION,
    duration: '1일',
    price: 390000,
    rating: 4.8,
    imageUrl: optimizeUnsplash(golfPhotos.green, 800, 82),
    category: 'golf',
  },
  {
    id: 'fallback-golf-4',
    title: '푸꾸옥 링크스 코스 도전',
    location: PRIMARY_REGION,
    country: PRIMARY_REGION,
    duration: '18홀',
    price: 240000,
    rating: 4.7,
    imageUrl: optimizeUnsplash(golfPhotos.links, 800, 82),
    category: 'golf',
  },
  {
    id: 'fallback-golf-5',
    title: '푸꾸옥 조식 포함 골프 셔틀팩',
    location: PRIMARY_REGION,
    country: PRIMARY_REGION,
    duration: '1일',
    price: 260000,
    rating: 4.7,
    imageUrl: optimizeUnsplash(golfPhotos.highland, 800, 82),
    category: 'golf',
  },
];

const FALLBACK_TOUR_PRODUCTS: Product[] = [
  {
    id: 'fallback-tour-1',
    title: '푸꾸옥 남부섬 호핑 투어',
    location: PRIMARY_REGION,
    country: PRIMARY_REGION,
    duration: '8시간',
    price: 89000,
    rating: 4.9,
    imageUrl: optimizeUnsplash(vietnamPhotos.phuquoc, 800, 82),
    category: 'tour',
  },
  {
    id: 'fallback-tour-2',
    title: '푸꾸옥 케이블카 & 선셋 크루즈',
    location: PRIMARY_REGION,
    country: PRIMARY_REGION,
    duration: '6시간',
    price: 99000,
    rating: 4.8,
    imageUrl: optimizeUnsplash(heroPhotos.beach, 800, 82),
    category: 'tour',
  },
  {
    id: 'fallback-tour-3',
    title: '푸꾸옥 북부 사파리 데이투어',
    location: PRIMARY_REGION,
    country: PRIMARY_REGION,
    duration: '1일',
    price: 119000,
    rating: 4.8,
    imageUrl: optimizeUnsplash(vietnamPhotos.phuquoc, 760, 80),
    category: 'tour',
  },
  {
    id: 'fallback-tour-4',
    title: '푸꾸옥 야시장 미식 워킹투어',
    location: PRIMARY_REGION,
    country: PRIMARY_REGION,
    duration: '4시간',
    price: 59000,
    rating: 4.7,
    imageUrl: optimizeUnsplash(categoryPhotos.tour, 800, 80),
    category: 'tour',
  },
  {
    id: 'fallback-tour-5',
    title: '푸꾸옥 스노클링 스피드보트',
    location: PRIMARY_REGION,
    country: PRIMARY_REGION,
    duration: '7시간',
    price: 109000,
    rating: 4.8,
    imageUrl: optimizeUnsplash(vietnamPhotos.phuquoc, 820, 84),
    category: 'tour',
  },
];

const FALLBACK_POPULAR_PRODUCTS: Product[] = allMockProducts
  .filter((product) => product.location === PRIMARY_REGION)
  .slice(0, 8);

const FALLBACK_DISCOUNTED_PRODUCTS: Product[] = allMockProducts
  .filter(
    (product) =>
      product.location === PRIMARY_REGION &&
      product.originalPrice != null &&
      product.originalPrice > product.price,
  )
  .sort((a, b) => {
    const aRate = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
    const bRate = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
    return bRate - aRate;
  })
  .slice(0, 6);

const FALLBACK_REVIEWS: Review[] = mockReviews.slice(0, 5);

function fillWithFallback(primaryProducts: Product[], fallbackProducts: Product[], limit: number): Product[] {
  const trimmedPrimary = primaryProducts.slice(0, limit);
  if (trimmedPrimary.length >= limit) return trimmedPrimary;

  const primaryIds = new Set(trimmedPrimary.map((p) => p.id));
  const extra = fallbackProducts.filter((p) => !primaryIds.has(p.id)).slice(0, limit - trimmedPrimary.length);
  return [...trimmedPrimary, ...extra];
}

export default function Home() {
  const { t } = useTranslations();
  const router = useRouter();
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [bestGolfProducts, setBestGolfProducts] = useState<Product[]>([]);
  const [bestTourProducts, setBestTourProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCity, setActiveCity] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const [recentResult, discountedResult, golfResult, tourResult, reviewsResult] = await Promise.allSettled([
        productAPI.getRecent(8),
        productAPI.getDiscounted(3),
        productAPI.getBestGolf(5),
        productAPI.getBestTour(5),
        reviewAPI.getAll(5),
      ]);

      const recent = recentResult.status === 'fulfilled' ? recentResult.value : [];
      const discounted = discountedResult.status === 'fulfilled' ? discountedResult.value : [];
      const golf = golfResult.status === 'fulfilled' ? golfResult.value : [];
      const tour = tourResult.status === 'fulfilled' ? tourResult.value : [];
      const reviewsList = reviewsResult.status === 'fulfilled' ? reviewsResult.value : [];

      setRecentProducts(recent.length > 0 ? recent : FALLBACK_POPULAR_PRODUCTS);
      setDiscountedProducts(discounted.length > 0 ? discounted : FALLBACK_DISCOUNTED_PRODUCTS);
      setBestGolfProducts(golf);
      setBestTourProducts(tour);
      setReviews(reviewsList.length > 0 ? reviewsList : FALLBACK_REVIEWS);
      setLoading(false);
    };
    fetchData();
  }, []);

  const cityLabels = [t('home.cities.phuquoc'), t('home.cities.hochiminh'), t('home.cities.hanoi'), t('home.cities.nhatrang')];
  const cityKeys = [...REGION_OPTIONS];

  const filteredRecentProducts = useMemo(() => {
    const cityKey = cityKeys[activeCity];
    return recentProducts.filter((p) => p.location === cityKey);
  }, [recentProducts, activeCity]);

  const displayPopularProducts = useMemo(() => {
    return fillWithFallback(filteredRecentProducts, FALLBACK_POPULAR_PRODUCTS, 4);
  }, [filteredRecentProducts]);

  const displayDiscountedProducts = useMemo(() => {
    const primaryDiscounts = discountedProducts.filter((product) => product.location === PRIMARY_REGION);
    return fillWithFallback(primaryDiscounts, FALLBACK_DISCOUNTED_PRODUCTS, 3);
  }, [discountedProducts]);

  const displayReviews = useMemo(() => {
    if (reviews.length >= 5) return reviews.slice(0, 5);
    const reviewIds = new Set(reviews.map((review) => review.id));
    const extras = FALLBACK_REVIEWS.filter((review) => !reviewIds.has(review.id)).slice(0, 5 - reviews.length);
    return [...reviews, ...extras];
  }, [reviews]);

  const displayBestGolfProducts = useMemo(() => {
    const primaryGolf = bestGolfProducts.filter((p) => p.location === PRIMARY_REGION);
    return fillWithFallback(primaryGolf, FALLBACK_GOLF_PRODUCTS, 5);
  }, [bestGolfProducts]);

  const displayBestTourProducts = useMemo(() => {
    const primaryTours = bestTourProducts.filter((p) => p.location === PRIMARY_REGION);
    return fillWithFallback(primaryTours, FALLBACK_TOUR_PRODUCTS, 5);
  }, [bestTourProducts]);

  const handleCityOptionClick = (city: string, index: number) => {
    if (!isPrimaryRegion(city)) {
      notifyComingSoon(city);
      return;
    }
    setActiveCity(index);
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-xl font-semibold text-white/70 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ═══════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════ */}
      <section className="relative w-full min-h-screen flex flex-col overflow-hidden">
        {/* 배경 이미지 */}
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt="푸꾸옥 리조트 전경"
            fill
            className="object-cover"
            priority
          />
          {/* 다층 그라디언트 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
        </div>

        {/* 히어로 본문 */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-6 lg:px-8 py-28 text-center">
          {/* 배지 */}
          <div className="mb-7 inline-flex items-center gap-2.5 px-5 py-2 glass rounded-full text-white/90 text-sm font-semibold animate-slide-in-up">
            <span className="w-2 h-2 rounded-full bg-[#ffa726] animate-pulse" />
            푸꾸옥 No.1 전문 여행사
          </div>

          {/* 메인 헤드라인 */}
          <h1 className="text-5xl sm:text-6xl md:text-[72px] font-bold text-white mb-5 leading-[1.08] tracking-tight animate-slide-in-up delay-100">
            {t('home.heroTitle')}
          </h1>

          {/* 서브타이틀 */}
          <p className="text-lg sm:text-xl text-white/70 mb-10 max-w-lg leading-relaxed animate-slide-in-up delay-200">
            {t('home.heroSubtitle')}
          </p>

          {/* 글래스 서치바 */}
          <div className="w-full max-w-[680px] mb-8 animate-slide-in-up delay-300">
            <SearchBar onSearch={handleSearch} placeholder={t('common.searchPlaceholderHome')} />
          </div>

          {/* 도시 빠른 링크 */}
          <div className="flex flex-wrap justify-center gap-2.5 animate-slide-in-up delay-400">
            {cityLinks.map((city) => (
              isPrimaryRegion(city.region) ? (
                <Link
                  key={city.nameKey}
                  href={city.href}
                  className="px-5 py-2 glass rounded-full text-white text-sm font-medium hover:bg-white/20 transition-all hover:scale-105"
                >
                  {t(city.nameKey)}
                </Link>
              ) : (
                <button
                  key={city.nameKey}
                  onClick={() => notifyComingSoon(city.region)}
                  className="px-5 py-2 glass rounded-full text-white text-sm font-medium hover:bg-white/20 transition-all hover:scale-105"
                  type="button"
                >
                  {t(city.nameKey)}
                </button>
              )
            ))}
          </div>
        </div>

        {/* 하단 카테고리 바 */}
        <div className="relative z-10 w-full px-5 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className="group flex flex-col items-center gap-2.5 py-4 glass rounded-2xl text-white hover:bg-white/20 transition-all text-center"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-[#ffa726] group-hover:scale-110 transition-all duration-200">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-semibold leading-tight">
                      {t(cat.nameKey)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          인기 상품 (밝은 배경)
      ═══════════════════════════════════════════ */}
      <section className="w-full bg-[#f8f8f6] py-20 md:py-24">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-[#ffa726]/10 text-[#ffa726] text-xs font-bold rounded-full mb-4 tracking-widest uppercase">
              Popular
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              {t('home.sectionPopular')}
            </h2>
            <p className="text-gray-500 text-[15px]">{t('home.sectionPopularDesc')}</p>
          </div>

          {/* 도시 탭 */}
          <div className="flex gap-2.5 mb-10 overflow-x-auto scrollbar-hide pb-1">
            {cityLabels.map((cityLabel, idx) => (
              <button
                key={cityLabel}
                onClick={() => handleCityOptionClick(cityKeys[idx], idx)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-[13px] whitespace-nowrap transition-all border ${
                  activeCity === idx
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900'
                }`}
              >
                {cityLabel}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayPopularProducts.map((product) => (
              <ProductCardType1 key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          타임세일 (어두운 배경 + 글래스)
      ═══════════════════════════════════════════ */}
      <section className="relative w-full bg-slate-900 py-20 md:py-24 overflow-hidden">
        {/* 배경 블러 오브 */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#ffa726]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#ffa726] text-white text-xs font-bold rounded-lg shadow-glow-orange">
                  <BoltIcon className="w-3.5 h-3.5" />
                  HOT DEAL
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-white/60 font-medium">
                  <ClockIcon className="w-4 h-4" />
                  {t('home.timeSale')}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {t('home.sectionSale')}
              </h2>
              <p className="text-white/50 mt-2 text-[15px]">
                {t('home.sectionSaleDesc')}
              </p>
            </div>
            <Link
              href="/sale"
              className="hidden sm:flex items-center gap-1.5 px-5 py-2.5 glass rounded-full text-white text-sm font-semibold hover:bg-white/20 transition-all whitespace-nowrap"
            >
              {t('common.viewAll')} →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayDiscountedProducts.map((product) => (
              <ProductCardType2 key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          여행 가이드
      ═══════════════════════════════════════════ */}
      <section className="w-full bg-white py-20 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full mb-4 tracking-widest uppercase">
              Guide
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              {t('home.sectionGuide')}
            </h2>
            <p className="text-gray-500 text-[15px]">{t('home.sectionGuideDesc')}</p>
          </div>
          <TravelGuide />
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          BEST 골프 (짙은 초록 배경)
      ═══════════════════════════════════════════ */}
      <section className="relative w-full py-20 md:py-24 overflow-hidden">
        {/* 풀 블리드 배경 이미지 */}
        <div className="absolute inset-0">
          <Image
            src={`${categoryPhotos.golf}?auto=format&fit=crop&w=1920&q=75`}
            alt="골프"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/70" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="inline-block px-3.5 py-1.5 bg-[#ffa726] text-white text-xs font-bold rounded-lg mb-4">
              GOLF
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
              {t('home.sectionGolf')}
            </h2>
            <p className="text-white/60 text-[15px]">{t('home.sectionGolfDesc')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {displayBestGolfProducts.map((product) => (
              <ProductCardType3 key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          BEST 투어 (흰 배경)
      ═══════════════════════════════════════════ */}
      <section className="w-full bg-white py-20 md:py-24">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="inline-block px-3.5 py-1.5 bg-[#ffa726]/10 text-[#ffa726] text-xs font-bold rounded-lg mb-4">
              TOUR &amp; TICKET
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
              {t('home.sectionTour')}
            </h2>
            <p className="text-gray-500 text-[15px]">{t('home.sectionTourDesc')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {displayBestTourProducts.map((product) => (
              <ProductCardType3 key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          여행팩 (이미지 배경 + 글래스 카드)
      ═══════════════════════════════════════════ */}
      <section className="relative w-full py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={`${vietnamPhotos.phuquoc}?auto=format&fit=crop&w=1920&q=70`}
            alt="푸꾸옥"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#ffa726] text-white text-xs font-bold rounded-lg mb-4">
                <SparklesIcon className="w-3.5 h-3.5" />
                TRAVEL PACKAGE
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
                {t('home.sectionPackage')}
              </h2>
              <p className="text-white/60 text-[15px]">{t('home.sectionPackageDesc')}</p>
            </div>
            <Link
              href="/package"
              className="inline-flex items-center gap-2 px-5 py-2.5 glass rounded-full text-white text-sm font-semibold hover:bg-white/20 transition-all whitespace-nowrap"
            >
              {t('common.viewAll')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 패키지 1 */}
            <Link href="/package/1" className="group">
              <div className="relative overflow-hidden rounded-3xl glass-dark hover:bg-black/35 transition-all border border-white/15 hover:border-white/25 hover:-translate-y-1">
                <div className="relative h-[220px] overflow-hidden rounded-t-3xl">
                  <Image
                    src={`${vietnamPhotos.phuquoc}?auto=format&fit=crop&w=800&q=80`}
                    alt="푸꾸옥 패키지"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-[#ffa726] text-white rounded-lg text-xs font-bold shadow-lg">
                      24% {t('common.discount')}
                    </span>
                    <span className="px-3 py-1 glass rounded-lg text-white text-xs font-bold">
                      {t('common.popular')}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white text-xl font-bold mb-1 drop-shadow-lg">
                      {t('home.package1Title')}
                    </h3>
                    <span className="text-white/80 text-sm">{t('home.package1Nights')} · {t('home.package1Include')}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/40 text-sm line-through mb-1">₩1,690,000</p>
                      <p className="text-white text-[28px] font-bold">₩1,290,000</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/40 text-xs mb-1">{t('common.perPerson')}</p>
                      <div className="flex items-center gap-1 justify-end">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white text-sm font-bold">4.9</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* 패키지 2 */}
            <Link href="/package/2" className="group">
              <div className="relative overflow-hidden rounded-3xl glass-dark hover:bg-black/35 transition-all border border-white/15 hover:border-white/25 hover:-translate-y-1">
                <div className="relative h-[220px] overflow-hidden rounded-t-3xl">
                  <Image
                    src={`${vietnamPhotos.phuquoc}?auto=format&fit=crop&w=800&q=80`}
                    alt="푸꾸옥 패키지"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-[#ffa726] text-white rounded-lg text-xs font-bold shadow-lg">
                      27% {t('common.discount')}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white text-xl font-bold mb-1 drop-shadow-lg">
                      {t('home.package2Title')}
                    </h3>
                    <span className="text-white/80 text-sm">{t('home.package2Nights')} · {t('home.package2Include')}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/40 text-sm line-through mb-1">₩2,190,000</p>
                      <p className="text-white text-[28px] font-bold">₩1,590,000</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/40 text-xs mb-1">{t('common.perPerson')}</p>
                      <div className="flex items-center gap-1 justify-end">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white text-sm font-bold">4.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          고객 후기 (밝은 배경)
      ═══════════════════════════════════════════ */}
      <section className="w-full bg-[#f8f8f6] py-20 md:py-24">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full mb-4 tracking-widest uppercase">
              Review
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              {t('home.sectionReview')}
            </h2>
            <p className="text-gray-500 text-[15px]">{t('home.sectionReviewDesc')}</p>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
            {displayReviews.map((review) => (
              <div key={review.id} className="flex-shrink-0">
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-semibold text-sm hover:bg-gray-800 transition-all hover:shadow-lg"
            >
              {t('home.reviewViewAll')} →
            </Link>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          여행 정보 카드 (흰 배경)
      ═══════════════════════════════════════════ */}
      <section className="w-full bg-white py-20 md:py-24">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12 tracking-tight">
            {t('home.sectionTips')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                bg: `${vietnamPhotos.hanoi}?auto=format&fit=crop&w=800&q=75`,
                titleKey: 'home.tipVisa',
                descKey: 'home.tipVisaDesc',
                link: '/info/visa',
              },
              {
                bg: `${vietnamPhotos.hochiminh}?auto=format&fit=crop&w=800&q=75`,
                titleKey: 'home.tipCurrency',
                descKey: 'home.tipCurrencyDesc',
                link: '/info/currency',
              },
              {
                bg: `${vietnamPhotos.nhatrang}?auto=format&fit=crop&w=800&q=75`,
                titleKey: 'home.tipWeather',
                descKey: 'home.tipWeatherDesc',
                link: '/info/weather',
              },
            ].map((info) => (
              <Link
                key={info.titleKey}
                href={info.link}
                className="group relative h-[220px] rounded-3xl overflow-hidden"
              >
                <Image
                  src={info.bg}
                  alt={t(info.titleKey)}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-lg font-bold mb-1">
                    {t(info.titleKey)}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
                    {t(info.descKey)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          왜 망고트래블? (어두운 배경 + 글래스)
      ═══════════════════════════════════════════ */}
      <section className="relative w-full py-20 md:py-24 overflow-hidden bg-slate-900">
        <div className="absolute inset-0">
          <Image
            src={`${vietnamPhotos.phuquoc}?auto=format&fit=crop&w=1920&q=70`}
            alt="푸꾸옥"
            fill
            sizes="100vw"
            className="object-cover opacity-20"
          />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            {t('home.sectionWhy')}
          </h2>
          <p className="text-white/50 mb-14 max-w-2xl mx-auto leading-relaxed whitespace-pre-line text-[15px]">
            {t('home.sectionWhyDesc')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CurrencyDollarIcon, titleKey: 'home.whyPrice',   descKey: 'home.whyPriceDesc' },
              { icon: FireIcon,           titleKey: 'home.whyExpert',  descKey: 'home.whyExpertDesc' },
              { icon: ClockIcon,          titleKey: 'home.why24',      descKey: 'home.why24Desc' },
              { icon: CheckBadgeIcon,     titleKey: 'home.whySatisfy', descKey: 'home.whySatisfyDesc' },
            ].map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.titleKey}
                  className="flex flex-col items-center p-8 glass rounded-3xl text-center group hover:bg-white/15 transition-all hover:-translate-y-1"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ffa726] to-[#ff9800] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-orange-500/25">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-white/55 text-sm leading-relaxed">
                    {t(feature.descKey)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
