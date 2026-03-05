'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  google_oauth_not_configured:
    '구글 로그인이 아직 설정되지 않았습니다. 이메일 로그인을 이용해 주세요. (관리자: backend .env에 GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET 설정 후 docs/OAUTH_SETUP.md 참고)',
  kakao_oauth_not_configured:
    '카카오 로그인이 아직 설정되지 않았습니다. 이메일 로그인을 이용해 주세요.',
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [oauthError, setOauthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const err = searchParams.get('error');
    if (err && OAUTH_ERROR_MESSAGES[err]) {
      setOauthError(OAUTH_ERROR_MESSAGES[err]);
      router.replace('/login', { scroll: false });
    }
  }, [searchParams, router]);

  const handleSocialLogin = (provider: 'google' | 'kakao') => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const redirect = searchParams.get('redirect');
    const state = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
    window.location.href = `${apiUrl}/auth/${provider}${state}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData);
      const redirect = searchParams.get('redirect');
      router.push(redirect || '/');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || '로그인에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showEmailLogin) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4">
        <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-[26px] font-bold font-pretendard mb-2">로그인</h1>
            <p className="text-[14px] text-gray-600">망고트래블에 오신 것을 환영합니다</p>
          </div>

          {oauthError && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-[13px] rounded-lg">
              {oauthError}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-[15px] font-semibold">구글로 로그인</span>
            </button>

            <button
              onClick={() => handleSocialLogin('kakao')}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[#FEE500] rounded-lg hover:bg-[#FDD835] transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#000000" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3zm5.907 8.06l1.47-1.424a.472.472 0 0 0-.656-.678l-1.928 1.866V9.282a.472.472 0 0 0-.944 0v2.557a.471.471 0 0 0 0 .222V13.5a.472.472 0 0 0 .944 0v-1.363l.427-.413 1.428 2.033a.472.472 0 1 0 .773-.543l-1.514-2.155zm-2.958 1.924h-1.46V9.297a.472.472 0 0 0-.943 0v4.159c0 .26.21.472.471.472h1.932a.472.472 0 1 0 0-.944zm-5.857-1.092l.696-1.707.638 1.707H9.092zm2.523.488l.002-.016a.469.469 0 0 0-.127-.32l-1.046-2.8a.69.69 0 0 0-.627-.474.696.696 0 0 0-.653.447l-1.661 4.075a.472.472 0 0 0 .874.357l.33-.813h2.07l.299.8a.472.472 0 1 0 .884-.33l-.345-.926zM8.293 9.302a.472.472 0 0 0-.471-.472H4.577a.472.472 0 1 0 0 .944h1.16v3.736a.472.472 0 0 0 .944 0V9.774h1.14c.261 0 .472-.212.472-.472z"/>
              </svg>
              <span className="text-[15px] font-semibold">카카오로 로그인</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-[13px]">
                <span className="px-4 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <button
              onClick={() => setShowEmailLogin(true)}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border-2 border-[#ffa726] bg-white rounded-lg hover:bg-orange-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span className="text-[15px] font-semibold">이메일로 로그인</span>
            </button>
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-[14px] text-gray-600 text-center">
              아직 회원이 아니신가요?{' '}
              <Link href="/signup" className="text-[#ffa726] font-bold hover:underline">
                회원가입
              </Link>
            </p>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-[13px]">
                <span className="px-4 bg-white text-gray-500">또는</span>
              </div>
            </div>
            <Link
              href="/agency/login"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BuildingOfficeIcon className="w-5 h-5 text-gray-600" />
              <span className="text-[15px] font-semibold text-gray-700">여행사 회원 로그인</span>
            </Link>
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
            ← 뒤로
          </button>
          <div className="text-center flex-1">
            <h1 className="text-[24px] font-bold font-pretendard">이메일 로그인</h1>
          </div>
          <div className="w-12" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="email" className="block text-[14px] font-medium text-gray-700 mb-2">
              이메일
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
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[15px] focus:outline-none focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
              placeholder="비밀번호 입력"
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
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <p className="text-[14px] text-gray-600 text-center">
            아직 회원이 아니신가요?{' '}
            <Link href="/signup" className="text-[#ffa726] font-bold hover:underline">
              회원가입
            </Link>
          </p>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-[13px]">
              <span className="px-4 bg-white text-gray-500">또는</span>
            </div>
          </div>
          <Link
            href="/agency/login"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BuildingOfficeIcon className="w-5 h-5 text-gray-600" />
            <span className="text-[15px] font-semibold text-gray-700">여행사 회원 로그인</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="w-10 h-10 border-4 border-[#ffa726] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
