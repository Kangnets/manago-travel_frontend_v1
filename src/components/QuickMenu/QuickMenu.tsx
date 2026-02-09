'use client';

import Link from 'next/link';

const categories = [
  { name: '호텔', icon: '🏨', path: '/hotel' },
  { name: '골프', icon: '⛳', path: '/golf' },
  { name: '투어', icon: '🚌', path: '/tour' },
  { name: '차량', icon: '🚗', path: '/transport' },
  { name: '스파/마사지', icon: '💆', path: '/spa' },
  { name: '입장권', icon: '🎫', path: '/ticket' },
  { name: '가이드', icon: '🚩', path: '/guide' },
  { name: '여행자보험', icon: '🛡️', path: '/insurance' },
  { name: '와이파이/유심', icon: '📶', path: '/wifi' },
  { name: '공항픽업', icon: '✈️', path: '/pickup' },
];

export default function QuickMenu() {
  return (
    <div className="w-full max-w-[1280px] mx-auto section-padding py-6 sm:py-8">
      <div className="grid grid-cols-5 gap-y-5 gap-x-3 sm:gap-y-6 sm:gap-x-4">
        {categories.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#f8f9fa] rounded-xl flex items-center justify-center text-[22px] sm:text-[26px] group-hover:bg-[#fbd865] group-hover:text-white transition-all duration-200 shadow-sm group-hover:shadow-md">
              {item.icon}
            </div>
            <span className="text-[11px] sm:text-[13px] font-medium text-[#333] group-hover:text-black transition-colors text-center leading-tight">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
