'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/types/product';
import { productAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { getProductDetail } from '@/lib/mockProductDetails';
import type { ProductDetail } from '@/types/product';
import {
  MapPinIcon,
  ClockIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CheckCircleIcon,
  StarIcon,
  ShareIcon,
  HeartIcon,
  PhoneIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import SafeImage from '@/components/ui/SafeImage';

const CATEGORY_LABEL: Record<string, string> = {
  hotel: '호텔',
  golf: '골프',
  tour: '투어',
  convenience: '편의',
  insurance: '보험',
};

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'Z');
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const month = d.getUTCMonth() + 1;
  const date = d.getUTCDate();
  const day = weekdays[d.getUTCDay()];
  return `${d.getUTCFullYear()}년 ${month}월 ${date}일 (${day})`;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'intro' | 'included' | 'cancel'>('intro');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const apiProduct = await productAPI.getById(productId);
        if (apiProduct) {
          setProduct(apiProduct);
          setDetail(getProductDetail(apiProduct));
        }
      } catch {
        // API 실패 시 상품 없음
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#ffa726] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!product || !detail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 mb-2">상품을 찾을 수 없습니다</p>
          <Link href="/" className="text-[#ffa726] hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    if (!user) {
      router.push(`/login?redirect=/products/${productId}/book`);
    } else {
      router.push(`/products/${productId}/book`);
    }
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountRate = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;
  const productImages = [product.imageUrl, product.imageUrl, product.imageUrl];
  const remaining = (detail.blockSeats ?? 10) - (detail.bookedCount ?? 0);
  const isAvailable = remaining > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 브레드크럼 */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#ffa726]">
              홈
            </Link>
            <span>/</span>
            <Link href={`/${product.category}`} className="hover:text-[#ffa726]">
              {CATEGORY_LABEL[product.category] ?? product.category}
            </Link>
            <span>/</span>
            <span className="text-gray-900 truncate max-w-[200px] sm:max-w-none">{product.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 왼쪽: 이미지 + 타이틀 영역 (참고사이트처럼 상단에 배치) */}
          <div className="lg:col-span-7 space-y-4">
            {/* 배지: 인천출발 등 */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-sm font-semibold">
                인천출발
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                노팁 노옵션
              </span>
              {product.category === 'golf' && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">
                  골프 2라운드
                </span>
              )}
            </div>

            {/* 제목 */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {product.title}
            </h1>

            {/* 메인 이미지 */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
              <SafeImage
                src={productImages[selectedImage]}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
              {hasDiscount && (
                <div className="absolute top-4 left-4 px-4 py-2 bg-gradient-to-r from-[#ffa726] to-[#f57c00] text-white rounded-xl text-sm font-bold shadow-lg">
                  {discountRate}% 할인
                </div>
              )}
            </div>

            {/* 썸네일 */}
            <div className="flex gap-3">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === idx ? 'border-[#ffa726]' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <SafeImage src={img} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          </div>

          {/* 오른쪽: 예약 정보 카드 (참고사이트 스타일) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
              {/* 출발/도착 일시 */}
              {detail.departureInfo && (
                <div className="p-6 border-b border-gray-100 space-y-3">
                  <div className="flex items-start gap-3">
                    <CalendarDaysIcon className="w-5 h-5 text-[#ffa726] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">출발</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(detail.departureDate!)} {detail.departureInfo}
                      </p>
                    </div>
                  </div>
                  {detail.returnInfo && (
                    <div className="flex items-start gap-3">
                      <ClockIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">도착</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(detail.returnDate!)} {detail.returnInfo}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 여행기간 / 상품가격 / 예약인원 */}
              <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                <div className="p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">여행기간</p>
                  <p className="text-sm font-bold text-gray-900">{product.duration}</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">상품가격</p>
                  <p className="text-sm font-bold text-gray-900">
                    ₩{(detail.priceAdult ?? product.price).toLocaleString()}~
                  </p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">예약인원</p>
                  <p className="text-sm font-bold text-gray-900">
                    잔여 {remaining}석 / 블럭 {detail.blockSeats ?? 10}명 / 최소출발{' '}
                    {detail.minPassengers ?? 2}명
                  </p>
                </div>
              </div>

              {/* 연령별 가격 */}
              <div className="p-6 space-y-2 border-b border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">(만 12세 이상)</span>
                  <span className="font-bold text-gray-900">
                    ₩{(detail.priceAdult ?? product.price).toLocaleString()}
                  </span>
                </div>
                {(detail.priceChild ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">(만 12세 미만)</span>
                    <span className="font-bold text-gray-900">
                      ₩{(detail.priceChild ?? 0).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">(만 2세 미만) No Bed</span>
                  <span className="font-bold text-gray-900">
                    ₩{(detail.priceInfant ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 문의전화 + 예약하기 */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">문의전화</span>
                  <a
                    href={`tel:${(detail.inquiryPhone ?? '').replace(/-/g, '')}`}
                    className="flex items-center gap-1.5 font-bold text-gray-900 hover:text-[#ffa726]"
                  >
                    <PhoneIcon className="w-4 h-4" />
                    Tel. {detail.inquiryPhone ?? '1588-8899'}
                  </a>
                </div>
                <p className="text-xs text-gray-400">Fax. 051-955-2323</p>

                <button
                  onClick={handleBooking}
                  disabled={!isAvailable}
                  className="w-full py-4 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white rounded-xl font-bold text-lg hover:from-[#f57c00] hover:to-[#ffa726] transition-all hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isAvailable ? '예약하기' : '예약 마감'}
                </button>
                <Link
                  href="#itinerary"
                  className="w-full py-3 flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:border-[#ffa726] hover:text-[#ffa726] transition-all"
                >
                  <DocumentTextIcon className="w-5 h-5" />
                  상세일정표
                </Link>
              </div>

              {/* 카테고리 & 공유/찜 */}
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                <span className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium">
                  {CATEGORY_LABEL[product.category]}
                </span>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-white rounded-lg transition-colors" title="공유">
                    <ShareIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                    title="찜"
                  >
                    {isFavorite ? (
                      <HeartSolidIcon className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 상세 정보 탭: 상품 소개 | 포함/불포함 | 취소/환불 */}
        <div className="mt-12">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100">
              <div className="flex gap-0">
                {[
                  { key: 'intro' as const, label: '상품 소개' },
                  { key: 'included' as const, label: '포함/불포함' },
                  { key: 'cancel' as const, label: '취소/환불' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-6 py-4 font-semibold text-sm transition-colors ${
                      activeTab === key
                        ? 'border-b-2 border-[#ffa726] text-[#ffa726] bg-amber-50/50'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8">
              {activeTab === 'intro' && (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">상품 소개</h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {product.title}은(는) 푸꾸옥에서 즐기실 수 있는 특별한 여행
                    상품입니다. 현지의 아름다운 자연과 문화를 경험하실 수 있으며, 편안하고 안전한
                    여행을 약속드립니다.
                  </p>

                  {/* 상세일정표 (참고사이트 링크 대신 인라인) */}
                  {detail.itinerary && detail.itinerary.length > 0 && (
                    <div id="itinerary" className="mt-10 scroll-mt-24">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <DocumentTextIcon className="w-5 h-5 text-[#ffa726]" />
                        상세일정표
                      </h3>
                      <div className="space-y-4">
                        {detail.itinerary.map((day) => (
                          <div
                            key={day.day}
                            className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100"
                          >
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#ffa726] text-white flex items-center justify-center font-bold text-sm">
                              {day.day}일
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 mb-1">{day.title}</h4>
                              <p className="text-sm text-gray-700 mb-2">{day.description}</p>
                              {day.meals && (
                                <p className="text-xs text-gray-500">식사: {day.meals}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'included' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">포함 사항</h3>
                    <ul className="space-y-2">
                      {(detail.included ?? []).map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">불포함 사항</h3>
                    <ul className="space-y-2 text-gray-700">
                      {(detail.excluded ?? []).map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-gray-400">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'cancel' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">취소/환불 안내</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {detail.cancelPolicy}
                  </p>
                  <p className="mt-4 text-sm text-gray-500">
                    자세한 내용은 여행약관 및 상품별 안내를 확인해 주세요.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
