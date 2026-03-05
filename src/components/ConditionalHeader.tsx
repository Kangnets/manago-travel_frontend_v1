'use client';

import { usePathname } from 'next/navigation';
import Header from './Header/Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  // 포털 페이지와 agency 페이지에서는 헤더 숨김
  if (pathname.startsWith('/portal/') || pathname.startsWith('/agency/')) {
    return null;
  }
  return <Header />;
}
