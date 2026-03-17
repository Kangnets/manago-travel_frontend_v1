'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from '@/lib/useTranslations';
import {
  UserIcon,
  CameraIcon,
  CubeIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';

const menuItems = [
  { nameKey: 'header.menu.home',    path: '/' },
  { nameKey: 'header.menu.hotel',   path: '/hotel' },
  { nameKey: 'header.menu.tour',    path: '/tour' },
  { nameKey: 'header.menu.golf',    path: '/golf' },
  { nameKey: 'header.menu.spa',     path: '/spa' },
  { nameKey: 'header.menu.package', path: '/package' },
];

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" />
    </svg>
  );
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { t } = useTranslations();
  const { user, logout, isLoading } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-gray-100/80 shadow-sm'
          : 'bg-white/70 backdrop-blur-xl border-b border-white/30'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-5 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
        {/* 로고 + 네비게이션 */}
        <div className="flex items-center gap-8">
          <Link href="/" className="relative w-[120px] sm:w-[135px] h-9 flex-shrink-0 hover:opacity-90 transition-opacity">
            <Image
              src="/logo.png"
              alt="Mango Travel"
              fill
              sizes="(max-width: 640px) 120px, 135px"
              className="object-contain"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                    isActive
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {t(item.nameKey)}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 우측 액션 */}
        <div className="flex items-center gap-2">
          {isLoading ? (
          <div className="w-[140px] h-10 bg-gray-100 animate-pulse rounded-full" />
        ) : user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-full border transition-all ${
                showDropdown
                  ? 'bg-white border-[#ffa726] ring-2 ring-[#ffa726]/20 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#ffa726] group-hover:bg-[#ffa726] group-hover:text-white transition-colors">
                <IconUser className="w-5 h-5" />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[14px] font-bold text-gray-900">{user.name}</span>
                <span className="text-[11px] text-gray-400 font-medium">
                  {user.userType === 'agency' ? t('header.userTypeAgency') : t('header.userTypeUser')}
                </span>
              </div>
              <IconChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            <div
              className={`absolute right-0 mt-2 w-60 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 transition-all duration-200 origin-top-right ${
                showDropdown ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/80 rounded-t-2xl">
                <p className="text-[15px] font-bold text-gray-900">{user.name}님</p>
                <p className="text-[13px] text-gray-400 mt-0.5 truncate">{user.email}</p>
                {user.userType === 'agency' && user.agencyName && (
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">
                    {user.agencyName}
                  </div>
                )}
              </div>
              <div className="p-2">
                <Link href="/mypage" className="flex items-center gap-3 w-full px-3 py-2.5 text-[14px] font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors" onClick={() => setShowDropdown(false)}>
                  <UserIcon className="w-4 h-4 text-gray-400" /> {t('header.mypage')}
                </Link>
                <Link href="/passport-ocr" className="flex items-center gap-3 w-full px-3 py-2.5 text-[14px] font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors" onClick={() => setShowDropdown(false)}>
                  <CameraIcon className="w-4 h-4 text-gray-400" /> {t('header.passportScan')}
                </Link>
                {user.userType === 'agency' && (
                  <Link href="/agency/products" className="flex items-center gap-3 w-full px-3 py-2.5 text-[14px] font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors" onClick={() => setShowDropdown(false)}>
                    <CubeIcon className="w-4 h-4 text-gray-400" /> {t('header.productManage')}
                  </Link>
                )}
                <div className="h-px bg-gray-100 my-1 mx-2" />
                <button
                  onClick={() => { logout(); setShowDropdown(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-[14px] font-medium text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <ArrowRightStartOnRectangleIcon className="w-4 h-4" /> {t('header.logout')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="group flex items-center gap-2 bg-gray-900 text-white rounded-full px-5 py-2.5 h-10 hover:bg-[#ffa726] transition-all shadow-sm hover:shadow-glow-orange active:scale-95"
          >
            <IconUser className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-[14px] font-bold">{t('header.loginSignup')}</span>
          </Link>
        )}
          <button
            type="button"
            onClick={toggleLanguage}
            title={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
            className="h-10 px-3.5 rounded-full border border-gray-200 bg-white text-[13px] font-semibold text-gray-600 hover:border-[#ffa726] hover:text-[#ffa726] hover:bg-orange-50 active:scale-95 transition-all duration-200"
          >
            {language === 'ko' ? 'English' : '한국어'}
          </button>
        </div>
      </div>
    </header>
  );
}
