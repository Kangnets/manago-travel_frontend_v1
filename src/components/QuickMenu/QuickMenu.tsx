'use client';

import Link from 'next/link';
import {
  BuildingOfficeIcon,
  GlobeAsiaAustraliaIcon,
  MapIcon,
  TruckIcon,
  SparklesIcon,
  TicketIcon,
  FlagIcon,
  ShieldCheckIcon,
  WifiIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

const categories = [
  { name: '호텔', icon: BuildingOfficeIcon, path: '/hotel' },
  { name: '골프', icon: GlobeAsiaAustraliaIcon, path: '/golf' },
  { name: '투어', icon: MapIcon, path: '/tour' },
  { name: '차량', icon: TruckIcon, path: '/transport' },
  { name: '스파/마사지', icon: SparklesIcon, path: '/spa' },
  { name: '입장권', icon: TicketIcon, path: '/ticket' },
  { name: '가이드', icon: FlagIcon, path: '/guide' },
  { name: '여행자보험', icon: ShieldCheckIcon, path: '/insurance' },
  { name: '와이파이/유심', icon: WifiIcon, path: '/wifi' },
  { name: '공항픽업', icon: PaperAirplaneIcon, path: '/pickup' },
];

export default function QuickMenu() {
  return (
    <div className="w-full max-w-[1280px] mx-auto section-padding py-6 sm:py-8">
      <div className="grid grid-cols-5 gap-y-5 gap-x-3 sm:gap-y-6 sm:gap-x-4">
        {categories.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.name}
              href={item.path}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#ffa726] group-hover:to-[#ff9800] group-hover:border-transparent transition-all duration-200 shadow-sm group-hover:shadow-md">
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[11px] sm:text-[13px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors text-center leading-tight">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
