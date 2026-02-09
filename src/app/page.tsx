'use client';

import { useEffect, useState } from 'react';
import SearchBar from '@/components/SearchBar/SearchBar';
import ProductCardType1 from '@/components/ProductCard/ProductCardType1';
import ProductCardType2 from '@/components/ProductCard/ProductCardType2';
import ProductCardType3 from '@/components/ProductCard/ProductCardType3';
import ReviewCard from '@/components/ReviewCard/ReviewCard';
import Footer from '@/components/Footer/Footer';
import QuickMenu from '@/components/QuickMenu/QuickMenu';
import PromotionBanner from '@/components/Promotion/PromotionBanner';
import TravelGuide from '@/components/TravelGuide/TravelGuide';
import { Product, Review } from '@/types/product';
import { productAPI, reviewAPI } from '@/lib/api';
import {
  mockRecentProducts,
  mockDiscountedProducts,
  mockBestGolfProducts,
  mockBestTourProducts,
  mockReviews,
} from '@/lib/mockData';

export default function Home() {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [bestGolfProducts, setBestGolfProducts] = useState<Product[]>([]);
  const [bestTourProducts, setBestTourProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (useMockData) {
          // Mock 데이터 사용 (백엔드가 준비되지 않았을 때)
          setRecentProducts(mockRecentProducts);
          setDiscountedProducts(mockDiscountedProducts);
          setBestGolfProducts(mockBestGolfProducts);
          setBestTourProducts(mockBestTourProducts);
          setReviews(mockReviews);
          setLoading(false);
        } else {
          // 실제 API 사용
          const [recent, discounted, golf, tour, reviewsList] = await Promise.all([
            productAPI.getRecent(4),
            productAPI.getDiscounted(3),
            productAPI.getBestGolf(5),
            productAPI.getBestTour(5),
            reviewAPI.getAll(5),
          ]);

          setRecentProducts(recent);
          setDiscountedProducts(discounted);
          setBestGolfProducts(golf);
          setBestTourProducts(tour);
          setReviews(reviewsList);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // API 실패 시 Mock 데이터로 폴백
        setRecentProducts(mockRecentProducts);
        setDiscountedProducts(mockDiscountedProducts);
        setBestGolfProducts(mockBestGolfProducts);
        setBestTourProducts(mockBestTourProducts);
        setReviews(mockReviews);
        setUseMockData(true);
        setLoading(false);
      }
    };

    fetchData();
  }, [useMockData]);

  const handleSearch = async (query: string) => {
    try {
      if (useMockData) {
        // Mock 데이터에서 검색
        const allProducts = [
          ...mockRecentProducts,
          ...mockDiscountedProducts,
          ...mockBestGolfProducts,
          ...mockBestTourProducts,
        ];
        const results = allProducts.filter(
          (product) =>
            product.title.includes(query) ||
            product.location.includes(query) ||
            product.country.includes(query)
        );
        console.log('Search results:', results);
        alert(`"${query}" 검색 결과: ${results.length}개의 상품을 찾았습니다.`);
      } else {
        const results = await productAPI.search(query);
        console.log('Search results:', results);
        alert(`"${query}" 검색 결과: ${results.length}개의 상품을 찾았습니다.`);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-pretendard">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="w-full bg-[#f8f9fa] pb-8 sm:pb-10 md:pb-12">
        <div className="max-w-[1280px] mx-auto section-padding pt-10 sm:pt-12 md:pt-16 flex flex-col items-center gap-6 sm:gap-8">
          <div className="text-center flex flex-col gap-2">
            <h1 className="text-[26px] sm:text-[30px] md:text-[34px] font-pretendard font-bold leading-tight text-[#333]">
              어디로 떠나시나요?
            </h1>
            <p className="text-[15px] sm:text-[16px] text-[#666]">
              호텔, 골프, 투어까지 망고트래블에서 한 번에 준비하세요
            </p>
          </div>
          <div className="w-full max-w-[640px]">
            <SearchBar onSearch={handleSearch} placeholder="여행지, 호텔, 골프장 검색" />
          </div>
        </div>
      </section>

      <QuickMenu />
      <PromotionBanner />

      {/* 최신 상품 */}
      <section className="max-w-[1280px] mx-auto section-padding py-8 sm:py-10 md:py-12">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h2 className="text-[20px] sm:text-[22px] md:text-[24px] font-bold font-pretendard">따끈따끈 신규 상품</h2>
          <button className="text-[#888] hover:text-black transition-colors text-[14px]">
            더보기 →
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 section-gap">
          {recentProducts.map((product) => (
            <ProductCardType1 key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 할인 상품 */}
      <section className="w-full bg-[#f8f9fa] py-8 sm:py-10 md:py-12">
        <div className="max-w-[1280px] mx-auto section-padding">
          <h2 className="text-[20px] sm:text-[22px] md:text-[24px] font-bold font-pretendard mb-1">놓치면 후회할 특가</h2>
          <p className="text-[14px] text-[#666] mb-6">망고트래블이 엄선한 가성비 최고의 상품들을 만나보세요</p>
          <div className="grid grid-cols-1 md:grid-cols-3 section-gap">
            {discountedProducts.map((product) => (
              <ProductCardType2 key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <TravelGuide />

      {/* BEST 골프 */}
      <section className="max-w-[1280px] mx-auto section-padding py-8 sm:py-10 md:py-12">
        <div className="mb-5 sm:mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">⛳</span>
            <p className="text-[14px] sm:text-[15px] font-bold text-[#fbd865]">Real Golfer's Choice</p>
          </div>
          <h2 className="text-[20px] sm:text-[22px] md:text-[24px] font-bold font-pretendard">골퍼들이 사랑한 BEST 골프장</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 section-gap">
          {bestGolfProducts.map((product) => (
            <ProductCardType3 key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* BEST 투어 */}
      <section className="max-w-[1280px] mx-auto section-padding py-8 sm:py-10 md:py-12 bg-[#f8f9fa]">
        <div className="mb-5 sm:mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🚌</span>
            <p className="text-[14px] sm:text-[15px] font-bold text-[#fbd865]">Best Tour Package</p>
          </div>
          <h2 className="text-[20px] sm:text-[22px] md:text-[24px] font-bold font-pretendard">후기로 증명된 BEST 투어</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 section-gap">
          {bestTourProducts.map((product) => (
            <ProductCardType3 key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 고객 Review */}
      <section className="max-w-[1280px] mx-auto section-padding py-10 sm:py-12 md:py-16">
        <div className="text-center mb-8">
          <h2 className="text-[20px] sm:text-[22px] md:text-[24px] font-bold font-pretendard mb-2">생생한 리얼 후기</h2>
          <p className="text-[14px] text-[#666]">망고트래블을 이용하신 고객님들의 솔직한 이야기를 들어보세요</p>
        </div>
        <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-3 scrollbar-hide">
          {reviews.map((review) => (
            <div key={review.id} className="flex-shrink-0">
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
