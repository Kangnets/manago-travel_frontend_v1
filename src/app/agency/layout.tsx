'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import {
  ComputerDesktopIcon,
  ChartBarIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  PaintBrushIcon,
  CameraIcon,
  HomeIcon,
  BellIcon,
  MegaphoneIcon,
  PresentationChartBarIcon,
  ArrowsUpDownIcon,
  DocumentCheckIcon,
  ClockIcon,
  UsersIcon,
  BuildingOfficeIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

const sidebarMenus = [
  {
    group: 'CRS 시스템',
    items: [
      { name: 'CRS 예약 관리', path: '/agency/crs', icon: ComputerDesktopIcon },
    ],
  },
  {
    group: '운영 관리',
    items: [
      { name: '대시보드', path: '/agency/dashboard', icon: ChartBarIcon },
      { name: '상품 관리', path: '/agency/products', icon: CubeIcon },
      { name: '예약 목록', path: '/agency/reservations', icon: ClipboardDocumentListIcon },
      { name: '리뷰 관리', path: '/agency/reviews', icon: StarIcon },
    ],
  },
  {
    group: '정산 관리',
    items: [
      { name: '통계 관리', path: '/agency/statistics', icon: PresentationChartBarIcon },
      { name: '정산 대장', path: '/agency/settlements', icon: BanknotesIcon },
      { name: '거래내역 조회', path: '/agency/transactions', icon: ArrowsUpDownIcon },
    ],
  },
  {
    group: '내부 관리',
    items: [
      { name: '결재 관리', path: '/agency/approvals', icon: DocumentCheckIcon },
      { name: '근태 관리', path: '/agency/attendance', icon: ClockIcon },
      { name: '고객 관리', path: '/agency/customers', icon: UsersIcon },
      { name: '파트너 관리', path: '/agency/partners', icon: BuildingOfficeIcon },
    ],
  },
  {
    group: '커뮤니케이션',
    items: [
      { name: '알림', path: '/agency/notifications', icon: BellIcon },
      { name: '공지사항', path: '/agency/notices', icon: MegaphoneIcon },
    ],
  },
  {
    group: '홈페이지 설정',
    items: [
      { name: '홈페이지 커스터마이징', path: '/agency/customize', icon: PaintBrushIcon },
      { name: '여권 스캔', path: '/agency/passport-scan', icon: CameraIcon },
    ],
  },
];

const PUBLIC_AGENCY_PATHS = ['/agency/login', '/agency/signup'];

export default function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 로그인/회원가입 페이지는 인증 없이 그대로 렌더링 (사이드바 없음)
  if (PUBLIC_AGENCY_PATHS.some((p) => pathname === p)) {
    return <>{children}</>;
  }

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/agency/login');
    } else if (!isLoading && user && user.userType !== 'agency') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#ffa726] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user || user.userType !== 'agency') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1a2e] flex flex-col fixed h-full shadow-xl z-10">
        {/* Logo */}
        <div className="h-16 px-5 flex items-center border-b border-white/10">
          <Link href="/" className="relative w-[100px] h-7">
            <Image
              src="/logo.png"
              alt="Mango Travel"
              fill
              sizes="100px"
              className="object-contain brightness-0 invert"
            />
          </Link>
          <span className="ml-2 px-2 py-0.5 bg-[#ffa726] text-white text-[10px] font-bold rounded-md">
            CRS
          </span>
        </div>

        {/* Agency Info */}
        <div className="px-4 py-3.5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#ffa726] flex items-center justify-center text-white font-bold text-[14px] shrink-0">
              {(user.agencyName || user.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-[13px] font-bold text-white truncate flex items-center gap-1.5">
                {user.agencyName || user.name}
                {user.agencyRole === 'owner' && <span className="shrink-0 px-1.5 py-0.5 bg-amber-500/30 text-amber-200 text-[9px] font-bold rounded">사장</span>}
                {user.agencyRole === 'employee' && <span className="shrink-0 px-1.5 py-0.5 bg-white/20 text-white/90 text-[9px] font-bold rounded">직원</span>}
              </p>
              <p className="text-[11px] text-white/50 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {sidebarMenus.map((group) => (
            <div key={group.group} className="mb-4">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-1.5">
                {group.group}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((menu) => {
                  const isActive = pathname === menu.path || (menu.path !== '/agency/crs' && pathname.startsWith(menu.path + '/'));
                  const IconComponent = menu.icon;
                  return (
                    <li key={menu.path}>
                      <Link
                        href={menu.path}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                          isActive
                            ? 'bg-[#ffa726] text-white shadow-lg shadow-[#ffa726]/20'
                            : 'text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        {menu.name}
                        {menu.path === '/agency/crs' && !isActive && (
                          <span className="ml-auto px-1.5 py-0.5 bg-[#ffa726]/20 text-[#ffa726] text-[9px] font-bold rounded">
                            NEW
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom links */}
        <div className="p-3 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/50 hover:bg-white/10 hover:text-white transition-all"
          >
            <HomeIcon className="w-5 h-5" />
            고객용 홈으로
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
