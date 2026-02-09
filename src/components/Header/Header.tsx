'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const menuItems = [
  { name: '홈', path: '/' },
  { name: '호텔', path: '/hotel' },
  { name: '골프', path: '/golf' },
  { name: '투어', path: '/tour' },
  { name: '편의/티켓', path: '/convenience' },
  { name: '여행자보험', path: '/insurance' },
];

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 md:px-8 lg:px-10 bg-white border-b border-gray-100">
      <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
        <Link href="/" className="relative w-[120px] sm:w-[160px] md:w-[180px] h-10 sm:h-12 flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Mango Travel Logo"
            fill
            className="object-contain"
            priority
          />
        </Link>
        <nav className="hidden md:flex items-center gap-5 lg:gap-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`text-[14px] lg:text-[15px] font-pretendard transition-colors whitespace-nowrap ${
                  isActive ? 'text-black font-semibold' : 'text-primary-gray font-medium hover:text-black'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {user ? (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 bg-primary-lightGray rounded-lg px-3 py-2.5 h-9 sm:h-10 hover:bg-gray-200 transition-colors text-black"
          >
            <IconUser className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-[13px] sm:text-[14px] font-pretendard font-semibold hidden sm:inline">
              {user.name}
            </span>
            <span className="text-[10px] sm:text-[11px] text-gray-500 hidden md:inline">
              {user.userType === 'agency' ? '여행사' : '일반'}
            </span>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-[14px] font-bold text-black">{user.name}</p>
                <p className="text-[12px] text-gray-500">{user.email}</p>
              </div>
              <Link
                href="/mypage"
                className="block px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50"
                onClick={() => setShowDropdown(false)}
              >
                마이페이지
              </Link>
              <button
                onClick={() => {
                  logout();
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-[14px] text-red-600 hover:bg-gray-50"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link
          href="/login"
          className="flex items-center gap-2 bg-primary-lightGray rounded-lg px-3 py-2.5 h-9 sm:h-10 hover:bg-gray-200 transition-colors text-primary-gray"
        >
          <IconUser className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="text-[13px] sm:text-[14px] font-pretendard font-semibold hidden sm:inline">
            로그인 및 회원가입
          </span>
        </Link>
      )}
    </header>
  );
}
