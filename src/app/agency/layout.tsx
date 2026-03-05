'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
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

const sidebarMenuDefs = [
  {
    group: { ko: 'CRS 시스템', en: 'CRS System' },
    items: [
      { name: { ko: 'CRS 예약 관리', en: 'CRS Reservations' }, path: '/agency/crs', icon: ComputerDesktopIcon },
    ],
  },
  {
    group: { ko: '운영 관리', en: 'Operations' },
    items: [
      { name: { ko: '대시보드', en: 'Dashboard' }, path: '/agency/dashboard', icon: ChartBarIcon },
      { name: { ko: '상품 관리', en: 'Products' }, path: '/agency/products', icon: CubeIcon },
      { name: { ko: '예약 목록', en: 'Reservations' }, path: '/agency/reservations', icon: ClipboardDocumentListIcon },
      { name: { ko: '리뷰 관리', en: 'Reviews' }, path: '/agency/reviews', icon: StarIcon },
    ],
  },
  {
    group: { ko: '정산 관리', en: 'Finance' },
    items: [
      { name: { ko: '통계 관리', en: 'Statistics' }, path: '/agency/statistics', icon: PresentationChartBarIcon },
      { name: { ko: '정산 대장', en: 'Settlements' }, path: '/agency/settlements', icon: BanknotesIcon },
      { name: { ko: '거래내역 조회', en: 'Transactions' }, path: '/agency/transactions', icon: ArrowsUpDownIcon },
    ],
  },
  {
    group: { ko: '내부 관리', en: 'Internal' },
    items: [
      { name: { ko: '결재 관리', en: 'Approvals' }, path: '/agency/approvals', icon: DocumentCheckIcon },
      { name: { ko: '근태 관리', en: 'Attendance' }, path: '/agency/attendance', icon: ClockIcon },
      { name: { ko: '고객 관리', en: 'Customers' }, path: '/agency/customers', icon: UsersIcon },
      { name: { ko: '파트너 관리', en: 'Partners' }, path: '/agency/partners', icon: BuildingOfficeIcon },
    ],
  },
  {
    group: { ko: '커뮤니케이션', en: 'Communication' },
    items: [
      { name: { ko: '알림', en: 'Notifications' }, path: '/agency/notifications', icon: BellIcon },
      { name: { ko: '공지사항', en: 'Notices' }, path: '/agency/notices', icon: MegaphoneIcon },
    ],
  },
  {
    group: { ko: '홈페이지 설정', en: 'Site Settings' },
    items: [
      { name: { ko: '홈페이지 커스터마이징', en: 'Customize Website' }, path: '/agency/customize', icon: PaintBrushIcon },
      { name: { ko: '여권 스캔', en: 'Passport Scan' }, path: '/agency/passport-scan', icon: CameraIcon },
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
  const { adminLanguage } = useAdminLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const isPublicAgencyPath = PUBLIC_AGENCY_PATHS.some((p) => pathname === p);
  const tr = (ko: string, en: string) => (adminLanguage === 'en' ? en : ko);
  const sidebarMenus = useMemo(() => {
    return sidebarMenuDefs.map((group) => ({
      group: tr(group.group.ko, group.group.en),
      items: group.items.map((item) => ({
        ...item,
        name: tr(item.name.ko, item.name.en),
      })),
    }));
  }, [adminLanguage]);

  useEffect(() => {
    if (isPublicAgencyPath) return;
    if (!isLoading && !user) {
      router.push('/agency/login');
    } else if (!isLoading && user && user.userType !== 'agency') {
      router.push('/');
    }
  }, [user, isLoading, router, isPublicAgencyPath]);

  // 로그인/회원가입 페이지는 인증 없이 그대로 렌더링 (사이드바 없음)
  if (isPublicAgencyPath) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#ffa726] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{tr('로딩 중...', 'Loading...')}</p>
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
                {user.agencyRole === 'owner' && <span className="shrink-0 px-1.5 py-0.5 bg-amber-500/30 text-amber-200 text-[9px] font-bold rounded">{tr('사장', 'OWNER')}</span>}
                {user.agencyRole === 'employee' && <span className="shrink-0 px-1.5 py-0.5 bg-white/20 text-white/90 text-[9px] font-bold rounded">{tr('직원', 'STAFF')}</span>}
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
            {tr('고객용 홈으로', 'Go to Customer Home')}
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
