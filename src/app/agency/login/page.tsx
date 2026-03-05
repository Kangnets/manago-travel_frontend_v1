'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

export default function AgencyLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
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
      // 여행사 로그인 후 CRS 시스템으로 이동
      router.push('/agency/crs');
    } catch (err: any) {
      setError(err.response?.data?.message || tr('로그인에 실패했습니다', 'Login failed'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!showEmailLogin) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4">
        <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-lg p-8">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-lg p-8">
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
    </div>
  );
}
