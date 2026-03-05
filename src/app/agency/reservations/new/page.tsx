'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { reservationAPI, agencyProductAPI } from '@/lib/agencyApi';
import { Product } from '@/types/product';

export default function NewReservationPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProducts, setIsFetchingProducts] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    productId: '',
    departureDate: '',
    returnDate: '',
    adultCount: '1',
    childCount: '0',
    infantCount: '0',
    totalAmount: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    memo: '',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await agencyProductAPI.getMyProducts({ isActive: true, limit: 100 });
        setProducts(data.data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setIsFetchingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // 선택된 상품의 가격으로 자동 계산
  useEffect(() => {
    if (formData.productId) {
      const selectedProduct = products.find((p) => p.id === formData.productId);
      if (selectedProduct) {
        const adultCount = parseInt(formData.adultCount) || 0;
        const childCount = parseInt(formData.childCount) || 0;
        const total = (adultCount + childCount * 0.7) * selectedProduct.price;
        setFormData((prev) => ({ ...prev, totalAmount: String(Math.round(total)) }));
      }
    }
  }, [formData.productId, formData.adultCount, formData.childCount, products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.productId || !formData.departureDate || !formData.contactName || !formData.contactPhone) {
      setError('필수 항목을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const reservation = await reservationAPI.create({
        productId: formData.productId,
        departureDate: formData.departureDate,
        returnDate: formData.returnDate || undefined,
        adultCount: parseInt(formData.adultCount) || 1,
        childCount: parseInt(formData.childCount) || 0,
        infantCount: parseInt(formData.infantCount) || 0,
        totalAmount: parseInt(formData.totalAmount) || 0,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail || undefined,
        memo: formData.memo || undefined,
      });

      router.push(`/agency/reservations/${reservation.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || '예약 등록에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/agency/reservations"
          className="inline-flex items-center gap-1 text-[14px] text-gray-500 hover:text-gray-700 mb-4"
        >
          ← 목록으로
        </Link>
        <h1 className="text-[24px] font-bold text-gray-900">새 예약 등록</h1>
        <p className="text-[14px] text-gray-500 mt-1">
          새로운 예약을 등록하세요
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-[16px] font-bold text-gray-900 mb-4">상품 선택</h2>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
              상품 *
            </label>
            {isFetchingProducts ? (
              <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            ) : (
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726]/20 focus:border-[#ffa726]"
                required
              >
                <option value="">상품을 선택하세요</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title} - ₩{product.price.toLocaleString()}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-[16px] font-bold text-gray-900 mb-4">여행 일정</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  출발일 *
                </label>
                <input
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726]/20 focus:border-[#ffa726]"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  귀국일
                </label>
                <input
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726]/20 focus:border-[#ffa726]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  성인
                </label>
                <input
                  type="number"
                  value={formData.adultCount}
                  onChange={(e) => setFormData({ ...formData, adultCount: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726]/20 focus:border-[#ffa726]"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  아동 (만 12세 미만)
                </label>
                <input
                  type="number"
                  value={formData.childCount}
                  onChange={(e) => setFormData({ ...formData, childCount: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726]/20 focus:border-[#ffa726]"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  유아 (만 2세 미만)
                </label>
                <input
                  type="number"
                  value={formData.infantCount}
                  onChange={(e) => setFormData({ ...formData, infantCount: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726]/20 focus:border-[#ffa726]"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-[16px] font-bold text-gray-900 mb-4">예약자 정보</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  예약자명 *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726]/20 focus:border-[#ffa726]"
                  placeholder="홍길동"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  연락처 *
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726]/20 focus:border-[#ffa726]"
                  placeholder="010-1234-5678"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                이메일
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726]/20 focus:border-[#ffa726]"
                placeholder="example@email.com"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-[16px] font-bold text-gray-900 mb-4">결제 정보</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                총 금액
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₩</span>
                <input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726]/20 focus:border-[#ffa726]"
                />
              </div>
              <p className="text-[12px] text-gray-500 mt-1">
                * 상품과 인원수에 따라 자동 계산됩니다. 필요시 수정 가능합니다.
              </p>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                메모
              </label>
              <textarea
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726]/20 focus:border-[#ffa726] min-h-[80px]"
                placeholder="예약 관련 메모"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-[13px] px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white font-bold rounded-xl text-[14px] hover:from-[#f57c00] hover:to-[#ffa726] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isLoading ? '등록 중...' : '예약 등록'}
          </button>
          <Link
            href="/agency/reservations"
            className="px-6 py-3 text-gray-600 font-medium text-[14px] hover:text-gray-900"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
