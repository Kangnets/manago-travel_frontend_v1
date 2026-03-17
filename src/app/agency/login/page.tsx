'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { DEV_MOCK_AGENCY_USER } from '@/lib/devMockAgencyData';
import { User, UserType } from '@/types/auth';

const IS_DEV = process.env.NODE_ENV === 'development';

export default function AgencyLoginPage() {
  const router = useRouter();
  const { login, devLogin } = useAuth();
  const { adminLanguage } = useAdminLanguage();
  const tr = (ko: string, en: string) => (adminLanguage === 'en' ? en : ko);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData);
      router.push('/agency/crs');
    } catch (err: any) {
      const msg = err.response?.data?.message || '';
      // 개발 환경에서 백엔드/PocketBase 미연결 시 안내
      if (IS_DEV && (err.response?.status === 503 || err.code === 'ERR_NETWORK')) {
        setError(
          '백엔드 또는 PocketBase가 연결되지 않았습니다. 아래 "개발 테스트 로그인"을 사용하세요.',
        );
      } else {
        setError(msg || tr('로그인에 실패했습니다', 'Login failed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevLogin = (role: 'owner' | 'employee') => {
    const mockUser: User = {
      ...DEV_MOCK_AGENCY_USER,
      agencyRole: role,
      name: role === 'owner' ? '김망고 (대표)' : '이직원 (직원)',
      email: role === 'owner' ? 'owner@mango-travel.dev' : 'staff@mango-travel.dev',
    } as User;
    devLogin(mockUser);
    router.push('/agency/crs');
  };

  // ── 첫 화면: 버튼 선택 ──────────────────────────────
  if (!showEmailLogin) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4">
        <div className="w-full max-w-[440px] space-y-4">
          {/* 메인 로그인 카드 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">🏢</div>
              <h1 className="text-[26px] font-bold font-pretendard mb-2">{tr('여행사 로그인', 'Agency Login')}</h1>
              <p className="text-[14px] text-gray-600">{tr('여행사 전용 계정으로 로그인하세요', 'Sign in with your agency account')}</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowEmailLogin(true)}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border-2 border-[#ffa726] bg-white rounded-lg hover:bg-orange-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span className="text-[15px] font-semibold">{tr('이메일로 로그인', 'Sign in with Email')}</span>
              </button>
            </div>

            <div className="mt-6 text-center space-y-2">
              <p className="text-[14px] text-gray-600">
                {tr('아직 여행사 회원이 아니신가요?', 'New to agency account?')}{' '}
                <Link href="/agency/signup" className="text-[#ffa726] font-bold hover:underline">
                  {tr('여행사 회원가입', 'Agency Sign Up')}
                </Link>
              </p>
              <p className="text-[13px] text-gray-500">
                {tr('일반 회원이신가요?', 'Are you a customer?')}{' '}
                <Link href="/login" className="text-gray-600 font-medium hover:underline">
                  {tr('일반 로그인', 'Customer Login')}
                </Link>
              </p>
            </div>
          </div>

          {/* 개발 환경 전용 빠른 로그인 */}
          {IS_DEV && (
            <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🔧</span>
                <span className="text-[13px] font-bold text-amber-800">개발 테스트 로그인 (DEV ONLY)</span>
              </div>
              <p className="text-[12px] text-amber-700 mb-4">
                PocketBase 없이도 에이전시 페이지를 테스트할 수 있습니다.<br />
                Mock 데이터로 로그인되며 실제 데이터는 저장되지 않습니다.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDevLogin('owner')}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[13px] font-bold transition-colors"
                >
                  👑 대표 계정으로 입장
                </button>
                <button
                  onClick={() => handleDevLogin('employee')}
                  className="flex-1 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-[13px] font-bold transition-colors"
                >
                  👤 직원 계정으로 입장
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── 이메일 로그인 폼 ──────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4">
      <div className="w-full max-w-[440px] space-y-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setShowEmailLogin(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              {tr('← 뒤로', '← Back')}
            </button>
            <div className="text-center flex-1">
              <h1 className="text-[24px] font-bold font-pretendard">{tr('여행사 이메일 로그인', 'Agency Email Login')}</h1>
            </div>
            <div className="w-12" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="block text-[14px] font-medium text-gray-700 mb-2">
                {tr('이메일', 'Email')}
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[15px] focus:outline-none focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
                placeholder="example@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[14px] font-medium text-gray-700 mb-2">
                {tr('비밀번호', 'Password')}
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[15px] focus:outline-none focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
                placeholder={tr('비밀번호 입력', 'Enter password')}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-[14px] px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white font-bold py-3 rounded-lg text-[15px] hover:from-[#f57c00] hover:to-[#ffa726] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? tr('로그인 중...', 'Signing in...') : tr('로그인', 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-[14px] text-gray-600">
              {tr('아직 여행사 회원이 아니신가요?', 'New to agency account?')}{' '}
              <Link href="/agency/signup" className="text-[#ffa726] font-bold hover:underline">
                {tr('여행사 회원가입', 'Agency Sign Up')}
              </Link>
            </p>
            <p className="text-[13px] text-gray-500">
              {tr('일반 회원이신가요?', 'Are you a customer?')}{' '}
              <Link href="/login" className="text-gray-600 font-medium hover:underline">
                {tr('일반 로그인', 'Customer Login')}
              </Link>
            </p>
          </div>
        </div>

        {/* 이메일 로그인 화면에도 dev 버튼 */}
        {IS_DEV && (
          <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-4">
            <p className="text-[12px] text-amber-700 mb-2 font-bold">🔧 개발 테스트 (백엔드 연결 불필요)</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDevLogin('owner')}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[12px] font-bold transition-colors"
              >
                👑 대표로 입장
              </button>
              <button
                onClick={() => handleDevLogin('employee')}
                className="flex-1 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-[12px] font-bold transition-colors"
              >
                👤 직원으로 입장
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
