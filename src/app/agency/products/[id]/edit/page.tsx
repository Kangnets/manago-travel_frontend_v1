'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AgencyProductForm, {
  defaultFormData,
  ProductFormData,
} from '@/components/agency/AgencyProductForm';
import { agencyProductAPI } from '@/lib/agencyApi';
import { productAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const productId = params.id as string;

  const [initial, setInitial] = useState<ProductFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [portalSlug, setPortalSlug] = useState<string | null>(null);

  // Get portal slug from customization settings
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`agency_customization_${user.id}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.slug) setPortalSlug(data.slug);
      } catch {
        // ignore
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const p = await productAPI.getById(productId);
        const detail = p as any;

        setInitial({
          title:            p.title          ?? '',
          description:      p.description    ?? '',
          location:         p.location       ?? '',
          country:          p.country        ?? '베트남',
          duration:         p.duration       ?? '',
          category:         p.category       ?? 'tour',
          imageUrl:         p.imageUrl       ?? '',
          isActive:         detail.isActive  ?? true,
          isFeatured:       detail.isFeatured ?? false,
          departureDate:    detail.departureDate   ? detail.departureDate.slice(0, 10) : '',
          returnDate:       detail.returnDate      ? detail.returnDate.slice(0, 10) : '',
          departureInfo:    detail.departureInfo   ?? '',
          returnInfo:       detail.returnInfo      ?? '',
          price:            String(p.price         ?? ''),
          originalPrice:    p.originalPrice  ? String(p.originalPrice) : '',
          priceChild:       detail.priceChild  ? String(detail.priceChild)  : '',
          priceInfant:      detail.priceInfant ? String(detail.priceInfant) : '',
          minParticipants:  String(detail.minParticipants ?? 2),
          blockSeats:       String(detail.blockSeats      ?? detail.maxParticipants ?? 10),
          inquiryPhone:     detail.inquiryPhone ?? '1588-8899',
          inquiryFax:       detail.inquiryFax   ?? '',
          itinerary:        Array.isArray(detail.itinerary) && detail.itinerary.length > 0
                              ? detail.itinerary
                              : defaultFormData.itinerary,
          included:         Array.isArray(detail.included) && detail.included.length > 0
                              ? detail.included
                              : defaultFormData.included,
          excluded:         Array.isArray(detail.excluded) && detail.excluded.length > 0
                              ? detail.excluded
                              : defaultFormData.excluded,
          cancelPolicy:     detail.cancelPolicy ?? defaultFormData.cancelPolicy,
        });
      } catch {
        setError('상품 정보를 불러오는데 실패했습니다.');
        setInitial(defaultFormData);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleSubmit = async (data: ProductFormData) => {
    setError('');
    setIsLoading(true);

    try {
      await agencyProductAPI.update(productId, {
        title: data.title,
        description: data.description || undefined,
        location: data.location,
        country: data.country,
        duration: data.duration,
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
        imageUrl: data.imageUrl,
        category: data.category as any,
        minParticipants: Number(data.minParticipants),
        maxParticipants: Number(data.blockSeats),
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        departureDate: data.departureDate || undefined,
        returnDate: data.returnDate || undefined,
        departureInfo: data.departureInfo || undefined,
        returnInfo: data.returnInfo || undefined,
        priceChild: data.priceChild ? Number(data.priceChild) : undefined,
        priceInfant: data.priceInfant ? Number(data.priceInfant) : undefined,
        blockSeats: Number(data.blockSeats),
        inquiryPhone: data.inquiryPhone || undefined,
        inquiryFax: data.inquiryFax || undefined,
        itinerary: data.itinerary,
        included: data.included,
        excluded: data.excluded,
        cancelPolicy: data.cancelPolicy || undefined,
      } as any);

      // Show success modal with navigation options
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.response?.data?.message || '상품 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (destination: 'products' | 'portal') => {
    if (destination === 'portal' && portalSlug) {
      router.push(`/portal/${portalSlug}`);
    } else {
      router.push('/agency/products');
    }
  };

  if (!initial) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#ffa726] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AgencyProductForm
        initial={initial}
        submitLabel="변경사항 저장"
        isLoading={isLoading}
        error={error}
        onSubmit={handleSubmit}
        pageTitle="상품 수정"
        pageSubtitle="상품 정보를 수정하세요"
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-[18px] font-bold text-gray-900 mb-1">상품이 수정되었습니다</h3>
              <p className="text-[13px] text-gray-500">어디로 이동하시겠습니까?</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleNavigate('products')}
                className="w-full px-4 py-3 bg-[#ffa726] text-white rounded-xl font-bold text-[14px] hover:bg-[#f57c00] transition-colors"
              >
                상품 목록으로
              </button>
              {portalSlug && (
                <button
                  onClick={() => handleNavigate('portal')}
                  className="w-full px-4 py-3 bg-[#1a1a2e] text-white rounded-xl font-bold text-[14px] hover:bg-[#2d2d4e] transition-colors"
                >
                  고객용 포털에서 확인
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
