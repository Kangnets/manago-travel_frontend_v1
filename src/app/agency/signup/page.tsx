'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserType } from '@/types/auth';

export default function AgencySignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
    agencyName: '',
    agencyEmail: '',
    businessNumber: '',
    licenseNumber: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    if (!formData.agencyName || !formData.businessNumber) {
      setError('여행사명과 사업자번호는 필수입니다');
      return;
    }

    setIsLoading(true);

    try {
      const { passwordConfirm, ...signupData } = formData;
      await signup({
        ...signupData,
        userType: UserType.AGENCY,
        phone: formData.phone || undefined,
        agencyName: formData.agencyName,
        agencyEmail: formData.agencyEmail || undefined,
        businessNumber: formData.businessNumber,
        licenseNumber: formData.licenseNumber || undefined,
        address: formData.address || undefined,
      });
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[540px] bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">🏢</div>
          <h1 className="text-[26px] font-bold font-pretendard mb-2">여행사 회원가입</h1>
          <p className="text-[14px] text-gray-600">여행 상품을 등록·판매하시는 업체 회원가입입니다</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="border-b border-gray-200 pb-4 mb-2">
            <p className="text-[14px] font-bold text-gray-700">담당자 정보</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-[13px] font-medium text-gray-700 mb-1.5">
              이메일 *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
              placeholder="example@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[13px] font-medium text-gray-700 mb-1.5">
              비밀번호 *
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
              placeholder="영문, 숫자, 특수문자 포함 8자 이상"
              required
            />
          </div>

          <div>
            <label htmlFor="passwordConfirm" className="block text-[13px] font-medium text-gray-700 mb-1.5">
              비밀번호 확인 *
            </label>
            <input
              id="passwordConfirm"
              type="password"
              value={formData.passwordConfirm}
              onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
              placeholder="비밀번호 재입력"
              required
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-[13px] font-medium text-gray-700 mb-1.5">
              담당자명 *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
              placeholder="홍길동"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-[13px] font-medium text-gray-700 mb-1.5">
              전화번호
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
              placeholder="010-1234-5678"
            />
          </div>

          <div className="border-t border-gray-200 pt-4 mt-2">
            <p className="text-[14px] font-bold text-gray-700 mb-4">여행사 정보</p>
          </div>

          <div>
            <label htmlFor="agencyName" className="block text-[13px] font-medium text-gray-700 mb-1.5">
              여행사명 *
            </label>
            <input
              id="agencyName"
              type="text"
              value={formData.agencyName}
              onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
              placeholder="(주)망고여행사"
              required
            />
          </div>

          <div>
            <label htmlFor="agencyEmail" className="block text-[13px] font-medium text-gray-700 mb-1.5">
              여행사 대표메일
            </label>
            <input
              id="agencyEmail"
              type="email"
              value={formData.agencyEmail}
              onChange={(e) => setFormData({ ...formData, agencyEmail: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
              placeholder="contact@agency.com (담당자 메일과 별도)"
            />
          </div>

          <div>
            <label htmlFor="businessNumber" className="block text-[13px] font-medium text-gray-700 mb-1.5">
              사업자등록번호 *
            </label>
            <input
              id="businessNumber"
              type="text"
              value={formData.businessNumber}
              onChange={(e) => setFormData({ ...formData, businessNumber: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
              placeholder="123-45-67890"
              required
            />
          </div>

          <div>
            <label htmlFor="licenseNumber" className="block text-[13px] font-medium text-gray-700 mb-1.5">
              관광사업자 등록번호
            </label>
            <input
              id="licenseNumber"
              type="text"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
              placeholder="제2026-000001호"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-[13px] font-medium text-gray-700 mb-1.5">
              사업장 주소
            </label>
            <input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
              placeholder="서울특별시 중구 세종대로 123"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-[13px] px-4 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white font-bold py-3 rounded-lg text-[15px] hover:from-[#f57c00] hover:to-[#ffa726] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-md"
          >
            {isLoading ? '가입 중...' : '여행사 회원가입'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-[14px] text-gray-600">
            이미 여행사 계정이 있으신가요?{' '}
            <Link href="/agency/login" className="text-[#ffa726] font-bold hover:underline">
              여행사 로그인
            </Link>
          </p>
          <p className="text-[13px] text-gray-500">
            일반 회원으로 가입하시나요?{' '}
            <Link href="/signup" className="text-gray-600 font-medium hover:underline">
              일반 회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
