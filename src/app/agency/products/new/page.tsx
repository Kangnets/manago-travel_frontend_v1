'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AgencyProductForm, {
  defaultFormData,
  ProductFormData,
} from '@/components/agency/AgencyProductForm';
import { agencyProductAPI } from '@/lib/agencyApi';
import { useAuth } from '@/contexts/AuthContext';

export default function NewProductPage() {
  const router = useRouter();
  const { user } = useAuth();
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

  const handleSubmit = async (data: ProductFormData) => {
    setError('');
    setIsLoading(true);

    try {
      await agencyProductAPI.create({
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
        // 상세 필드
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
      setError(err.response?.data?.message || '상품 등록에 실패했습니다.');
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

  return (
    <>
      <AgencyProductForm
        initial={defaultFormData}
        submitLabel="상품 등록"
        isLoading={isLoading}
        error={error}
        onSubmit={handleSubmit}
        pageTitle="새 상품 등록"
        pageSubtitle="새로운 여행 상품을 등록하세요"
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
              <h3 className="text-[18px] font-bold text-gray-900 mb-1">상품이 등록되었습니다</h3>
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
