'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BuildingOfficeIcon,
  TruckIcon,
  MapPinIcon,
  SparklesIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  MapIcon,
  PaperAirplaneIcon,
  QuestionMarkCircleIcon,
  CameraIcon,
  UserIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { productAPI } from '@/lib/api';
import { agencyCustomizationAPI } from '@/lib/agencyCustomizationApi';

interface AgencyCustomization {
  agencyDisplayName: string;
  slogan: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  phone: string;
  email: string;
  address: string;
  kakaoId: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerImageUrl: string;
  welcomeText: string;
  footerText: string;
  showHotel: boolean;
  showTour: boolean;
  showGolf: boolean;
  showSpa: boolean;
  showInsurance: boolean;
  showReviews: boolean;
  showBlog: boolean;
  showPassportOcr: boolean;
  templateId: string;
  slug: string;
  adminLanguage?: 'ko' | 'en';
  serviceLanguage?: 'ko' | 'en';
}

interface Product {
  id: string;
  title: string;
  description: string;
  location: string;
  country: string;
  duration: string;
  price: number;
  category: string;
  imageUrl?: string;
}

const SAMPLE_REVIEWS = [
  { name: '김지훈', rating: 5, text: '정말 최고의 여행이었습니다! 가이드도 친절하고 일정도 알차게 구성되어 있어서 만족스러웠어요.', date: '2025.12' },
  { name: '이수진', rating: 5, text: '첫 해외여행인데 모든 게 완벽했어요. 다음에도 꼭 이용할게요!', date: '2026.01' },
  { name: '박민준', rating: 4, text: '가성비 최고! 이 가격에 이 퀄리티라니 놀랍습니다.', date: '2026.02' },
];

export default function AgencyPortalPage() {
  const params = useParams();
  const agencySlug = params.agencySlug as string;

  const [settings, setSettings] = useState<AgencyCustomization | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showContact, setShowContact] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!agencySlug) return;
    let cancelled = false;

    setLoading(true);
    setNotFound(false);

    agencyCustomizationAPI
      .getBySlug<AgencyCustomization>(agencySlug)
      .then(async (result) => {
        if (cancelled) return;
        setSettings(result.settings);
        try {
          const items = await productAPI.getByAgency(result.agencyId);
          if (!cancelled) setProducts(items as unknown as Product[]);
        } catch {
          if (!cancelled) setProducts([]);
        }
      })
      .catch((err: any) => {
        if (cancelled) return;
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [agencySlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-[14px]">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (notFound || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <QuestionMarkCircleIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-[22px] font-bold text-gray-900 mb-2">포털을 찾을 수 없습니다</h1>
          <p className="text-[14px] text-gray-500 mb-6">
            <strong className="text-gray-700">&quot;{agencySlug}&quot;</strong> 에 해당하는 여행사 포털이 존재하지 않습니다.
          </p>
          <Link href="/" className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium text-[14px] hover:bg-orange-600 transition-colors inline-block">
            Mango Travel 홈으로
          </Link>
        </div>
      </div>
    );
  }

  const primary = settings.primaryColor || '#ffa726';
  const secondary = settings.secondaryColor || '#1a1a2e';

  const categories = [
    { key: 'all', label: '전체', icon: null, show: true },
    { key: 'hotel', label: '호텔', icon: BuildingOfficeIcon, show: settings.showHotel },
    { key: 'tour', label: '투어', icon: TruckIcon, show: settings.showTour },
    { key: 'golf', label: '골프', icon: MapPinIcon, show: settings.showGolf },
    { key: 'spa', label: '스파', icon: SparklesIcon, show: settings.showSpa },
  ].filter((c) => c.show);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hotel': return BuildingOfficeIcon;
      case 'tour': return TruckIcon;
      case 'golf': return MapPinIcon;
      case 'spa': return SparklesIcon;
      default: return PaperAirplaneIcon;
    }
  };

  const filteredProducts = activeCategory === 'all' ? products : products.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-50 shadow-lg" style={{ background: secondary }}>
        <div className="max-w-6xl mx-auto px-4 py-0">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="logo" className="h-9 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <span className="text-white font-bold text-[18px]">{settings.agencyDisplayName}</span>
              )}
              {settings.slogan && (
                <span className="text-white/40 text-[12px] hidden md:block">— {settings.slogan}</span>
              )}
            </div>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {categories.filter((c) => c.key !== 'all').map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.key}
                    onClick={() => { setActiveCategory(cat.key); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    {IconComponent && <IconComponent className="w-4 h-4" />}
                    {cat.label}
                  </button>
                );
              })}
              <button
                onClick={() => setShowContact(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <PhoneIcon className="w-4 h-4" />
                문의
              </button>
            </nav>

            {/* CTA */}
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-[13px] font-medium text-white/70 hover:text-white transition-colors"
              >
                로그인
              </Link>
              <button
                className="px-4 py-2 rounded-xl text-[13px] font-bold text-white shadow-md transition-all hover:brightness-90 active:scale-95"
                style={{ background: primary }}
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              >
                예약하기
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── HERO BANNER ─── */}
      <section className="relative h-[500px] overflow-hidden">
        {settings.bannerImageUrl ? (
          <img
            src={settings.bannerImageUrl}
            alt="banner"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${secondary}, ${primary})` }} />
        )}
        <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-white text-center px-4">
          <div
            className="inline-block px-4 py-1.5 rounded-full text-[12px] font-bold mb-4 text-white"
            style={{ background: `${primary}CC` }}
          >
            {settings.agencyDisplayName}
          </div>
          <h1 className="text-[32px] md:text-[42px] font-bold mb-3 leading-tight max-w-2xl">
            {settings.bannerTitle}
          </h1>
          <p className="text-[15px] text-white/80 mb-8 max-w-xl">
            {settings.bannerSubtitle}
          </p>
          <div className="flex gap-3">
            <button
              className="px-6 py-3 rounded-2xl text-[15px] font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95"
              style={{ background: primary }}
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            >
              여행 상품 보기
            </button>
            <button
              onClick={() => setShowContact(true)}
              className="px-6 py-3 rounded-2xl text-[15px] font-bold text-white border-2 border-white/50 hover:border-white transition-all"
            >
              상담 문의
            </button>
          </div>
        </div>
      </section>

      {/* ─── QUICK CATEGORY BAR ─── */}
      {categories.filter((c) => c.key !== 'all').length > 0 && (
        <section className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-4 flex gap-4 justify-center flex-wrap">
            {categories.filter((c) => c.key !== 'all').map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => { setActiveCategory(cat.key); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl border-2 transition-all hover:shadow-md"
                  style={activeCategory === cat.key ? { borderColor: primary, background: `${primary}15` } : { borderColor: '#e5e7eb', background: 'white' }}
                >
                  {IconComponent && (
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${primary}20` }}>
                      <IconComponent className="w-5 h-5" style={{ color: primary }} />
                    </div>
                  )}
                  <span className="text-[12px] font-medium text-gray-700">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── WELCOME SECTION ─── */}
      {settings.welcomeText && (
        <section className="max-w-6xl mx-auto px-4 py-10 text-center">
          <p className="text-[16px] text-gray-600 leading-relaxed max-w-2xl mx-auto">{settings.welcomeText}</p>
        </section>
      )}

      {/* ─── PRODUCTS ─── */}
      <section id="products" className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[22px] font-bold text-gray-900">여행 상품</h2>
            <p className="text-[13px] text-gray-500 mt-0.5">{filteredProducts.length}개의 상품</p>
          </div>
          {/* Category filter tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                  activeCategory === cat.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              {/* Product image */}
              <div className="h-44 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${secondary}99, ${primary}55)` }}>
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.title} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  {(() => {
                    const CategoryIcon = getCategoryIcon(product.category);
                    return (
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <CategoryIcon className="w-8 h-8 text-white" />
                      </div>
                    );
                  })()}
                </div>
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 rounded-lg text-[11px] font-bold text-white" style={{ background: primary }}>
                    {product.duration}
                  </span>
                </div>
              </div>

              {/* Product info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-[14px] font-bold text-gray-900 leading-tight">{product.title}</h3>
                </div>
                <p className="text-[12px] text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-3">
                  <MapPinIcon className="w-3.5 h-3.5" />
                  <span>{product.location}, {product.country}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-400">1인 기준</span>
                    <div className="text-[18px] font-bold text-gray-900">
                      ₩{product.price.toLocaleString()}
                    </div>
                  </div>
                  <Link
                    href={`/products/${product.id}`}
                    className="px-4 py-2 rounded-xl text-[13px] font-bold text-white transition-all hover:brightness-90 active:scale-95 group-hover:scale-105 inline-block"
                    style={{ background: primary }}
                  >
                    예약하기
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <MapIcon className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-[15px]">해당 카테고리의 상품이 없습니다</p>
          </div>
        )}
      </section>

      {/* ─── REVIEWS ─── */}
      {settings.showReviews && (
        <section className="bg-white py-12 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-[22px] font-bold text-gray-900">고객 후기</h2>
              <p className="text-[13px] text-gray-500 mt-1">실제 여행자들의 생생한 후기</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {SAMPLE_REVIEWS.map((review, i) => (
                <div key={i} className="p-5 rounded-2xl border border-gray-100 shadow-sm bg-gray-50/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[13px]" style={{ background: primary }}>
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-gray-900">{review.name}</div>
                      <div className="text-[11px] text-gray-400">{review.date}</div>
                    </div>
                    <div className="ml-auto flex items-center gap-0.5">
                      {[...Array(review.rating)].map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-700 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CONTACT SECTION ─── */}
      {(settings.phone || settings.email || settings.address) && (
        <section className="py-12 bg-gray-50 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-[22px] font-bold text-gray-900 mb-2">연락하기</h2>
            <p className="text-[13px] text-gray-500 mb-6">궁금한 점이 있으시면 언제든지 연락주세요</p>
            <div className="flex gap-4 justify-center flex-wrap">
              {settings.phone && (
                <a href={`tel:${settings.phone}`} className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <PhoneIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-[14px] font-medium text-gray-800">{settings.phone}</span>
                </a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <EnvelopeIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-[14px] font-medium text-gray-800">{settings.email}</span>
                </a>
              )}
              {settings.kakaoId && (
                <div className="flex items-center gap-3 px-5 py-3 bg-yellow-400 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-yellow-900" />
                  </div>
                  <span className="text-[14px] font-bold text-yellow-900">카카오 상담</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── FOOTER ─── */}
      <footer className="py-8 px-4 text-center" style={{ background: secondary }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-white font-bold text-[16px] mb-1">{settings.agencyDisplayName}</div>
          {settings.address && <div className="text-white/50 text-[12px] mb-2">{settings.address}</div>}
          <div className="text-white/40 text-[12px]">{settings.footerText}</div>

          {/* SNS Links */}
          {(settings.instagramUrl || settings.facebookUrl || settings.youtubeUrl) && (
            <div className="flex justify-center gap-3 mt-4">
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <CameraIcon className="w-4 h-4 text-white" />
                </a>
              )}
              {settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <UserIcon className="w-4 h-4 text-white" />
                </a>
              )}
              {settings.youtubeUrl && (
                <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <PlayIcon className="w-4 h-4 text-white" />
                </a>
              )}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-white/10 text-white/30 text-[11px]">
            Powered by <span className="text-[#ffa726]">Mango Travel CRS</span>
          </div>
        </div>
      </footer>

      {/* ─── CONTACT MODAL ─── */}
      {showContact && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowContact(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-[16px] font-bold text-gray-900">
                <PhoneIcon className="w-5 h-5 text-gray-600" />
                문의하기
              </h3>
              <button onClick={() => setShowContact(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {settings.phone && (
                <a href={`tel:${settings.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <PhoneIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500">전화 문의</div>
                    <div className="text-[14px] font-bold text-gray-900">{settings.phone}</div>
                  </div>
                </a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <EnvelopeIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500">이메일 문의</div>
                    <div className="text-[14px] font-bold text-gray-900">{settings.email}</div>
                  </div>
                </a>
              )}
              {settings.kakaoId && (
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl cursor-pointer hover:bg-yellow-100 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-yellow-200 flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-yellow-700" />
                  </div>
                  <div>
                    <div className="text-[11px] text-yellow-700">카카오 채널 문의</div>
                    <div className="text-[14px] font-bold text-yellow-900">@{settings.kakaoId}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
