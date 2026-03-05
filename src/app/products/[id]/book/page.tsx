'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/types/product';
import { productAPI, reservationAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import SafeImage from '@/components/ui/SafeImage';

function localDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [form, setForm] = useState({
    departureDate: localDateStr(tomorrow),
    adultCount: 1,
    childCount: 0,
    infantCount: 0,
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    memo: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirect=/products/${productId}/book`);
    }
  }, [user, authLoading, productId, router]);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        contactName: user.name || '',
        contactEmail: user.email || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productAPI.getById(productId);
        setProduct(data || null);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const totalAmount =
    (product?.price ?? 0) * form.adultCount +
    (product?.price ?? 0) * 0.7 * form.childCount +
    0 * form.infantCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!form.contactName.trim()) { setError('예약자 이름을 입력해주세요.'); return; }
    if (!form.contactPhone.trim()) { setError('연락처를 입력해주세요.'); return; }

    setError('');
    setSubmitting(true);
    try {
      await reservationAPI.create({
        productId: product.id,
        departureDate: form.departureDate,
        adultCount: form.adultCount,
        childCount: form.childCount || undefined,
        infantCount: form.infantCount || undefined,
        totalAmount,
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail || undefined,
        memo: form.memo || undefined,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string | string[] } } };
      const rawMsg = apiErr?.response?.data?.message;
      const msg = Array.isArray(rawMsg) ? rawMsg.join(', ') : rawMsg;
      setError(msg || '예약 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ffa726] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">예약이 접수되었습니다!</h1>
          <p className="text-gray-600 mb-6">
            담당자 확인 후 {form.contactPhone} 으로 연락드리겠습니다.
            <br />
            예약 확정까지 1-2 영업일 소요될 수 있습니다.
          </p>
          <div className="space-y-3">
            <Link
              href="/mypage"
              className="block w-full py-3 bg-[#ffa726] text-white rounded-xl font-bold hover:bg-[#f57c00] transition-colors"
            >
              예약 내역 확인하기
            </Link>
            <Link
              href="/"
              className="block w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:border-[#ffa726] transition-colors"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 mb-2">상품을 찾을 수 없습니다</p>
          <Link href="/" className="text-[#ffa726] hover:underline">홈으로</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-6">
          <Link
            href={`/products/${productId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#ffa726] text-sm mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            상품으로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">예약 신청</h1>
        </div>

        {/* 상품 요약 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex gap-4">
          <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
            <SafeImage
              src={product.imageUrl}
              alt={product.title}
              width={96}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#ffa726] font-semibold uppercase mb-1">{product.category}</p>
            <h2 className="font-bold text-gray-900 text-base leading-snug mb-1 truncate">{product.title}</h2>
            <p className="text-sm text-gray-500">{product.location} · {product.duration}</p>
            <p className="text-sm font-bold text-gray-900 mt-1">
              성인 ₩{product.price.toLocaleString()} ~
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 출발일 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarDaysIcon className="w-5 h-5 text-[#ffa726]" />
              출발일 선택
            </h3>
            <input
              type="date"
              value={form.departureDate}
              min={localDateStr(tomorrow)}
              onChange={(e) => setForm((prev) => ({ ...prev, departureDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffa726]"
              required
            />
          </div>

          {/* 인원 선택 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5 text-[#ffa726]" />
              인원 선택
            </h3>
            <div className="space-y-4">
              {[
                { label: '성인', key: 'adultCount', desc: '만 12세 이상', min: 1 },
                { label: '소아', key: 'childCount', desc: '만 2~11세 (성인가의 70%)', min: 0 },
                { label: '유아', key: 'infantCount', desc: '만 2세 미만 (무료, No Bed)', min: 0 },
              ].map(({ label, key, desc, min }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, [key]: Math.max(min, (prev[key as keyof typeof prev] as number) - 1) }))}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#ffa726] hover:text-[#ffa726] transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-bold text-gray-900">
                      {form[key as keyof typeof form] as number}
                    </span>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, [key]: (prev[key as keyof typeof prev] as number) + 1 }))}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#ffa726] hover:text-[#ffa726] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 예약자 정보 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-[#ffa726]" />
              예약자 정보
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  예약자 이름 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => setForm((prev) => ({ ...prev, contactName: e.target.value }))}
                    placeholder="홍길동"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#ffa726]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={form.contactPhone}
                    onChange={(e) => setForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="010-0000-0000"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#ffa726]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="example@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#ffa726]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">요청사항</label>
                <textarea
                  value={form.memo}
                  onChange={(e) => setForm((prev) => ({ ...prev, memo: e.target.value }))}
                  placeholder="특별 요청사항이 있으시면 입력해주세요"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#ffa726] resize-none"
                />
              </div>
            </div>
          </div>

          {/* 결제 요약 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-[#ffa726]" />
              예약 금액
            </h3>
            <div className="space-y-2 text-sm">
              {form.adultCount > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>성인 {form.adultCount}명</span>
                  <span>₩{(product.price * form.adultCount).toLocaleString()}</span>
                </div>
              )}
              {form.childCount > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>소아 {form.childCount}명</span>
                  <span>₩{Math.round(product.price * 0.7 * form.childCount).toLocaleString()}</span>
                </div>
              )}
              {form.infantCount > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>유아 {form.infantCount}명</span>
                  <span>무료</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base text-gray-900">
                <span>합계</span>
                <span className="text-gray-900">₩{Math.round(totalAmount).toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              * 실제 결제는 담당자 확인 후 별도 안내드립니다.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white rounded-xl font-bold text-lg hover:from-[#f57c00] hover:to-[#ffa726] transition-all hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                예약 신청 중...
              </span>
            ) : (
              '예약 신청하기'
            )}
          </button>
          <p className="text-xs text-center text-gray-400">
            예약 신청 후 담당자 확인이 완료되면 예약이 확정됩니다.
          </p>
        </form>
      </div>
    </div>
  );
}
