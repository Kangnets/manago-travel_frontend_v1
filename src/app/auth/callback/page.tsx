'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    const success = searchParams.get('success');

    if (success === 'true') {
      refreshUser().then(() => router.push('/'));
    } else {
      router.push('/login');
    }
  }, []); // 마운트 시 한 번만 실행

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffa726] mx-auto mb-4"></div>
        <p className="text-[16px] text-gray-600">로그인 중...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffa726] mx-auto mb-4"></div>
          <p className="text-[16px] text-gray-600">로그인 중...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
