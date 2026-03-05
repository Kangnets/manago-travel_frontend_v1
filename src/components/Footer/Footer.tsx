'use client';

import Link from 'next/link';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  CheckBadgeIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useTranslations } from '@/lib/useTranslations';
import { isPrimaryRegion, notifyComingSoon } from '@/lib/regionPolicy';

const footerLinkKeys = [
  { titleKey: 'footer.about', href: '/about' },
  { titleKey: 'footer.terms', href: '/terms' },
  { titleKey: 'footer.privacy', href: '/privacy', bold: true },
  { titleKey: 'footer.travelTerms', href: '/travel-terms' },
  { titleKey: 'footer.insurance', href: '/insurance' },
  { titleKey: 'footer.partnership', href: '/partnership' },
];

const travelCategoryKeys = [
  { titleKey: 'footer.vietnamHotel', href: '/hotel' },
  { titleKey: 'footer.vietnamTour', href: '/tour' },
  { titleKey: 'footer.vietnamGolf', href: '/golf' },
  { titleKey: 'footer.vietnamSpa', href: '/spa' },
];

const cityKeys = [
  { nameKey: 'home.cities.phuquoc', region: '푸꾸옥', href: '/destination/phuquoc' },
  { nameKey: 'home.cities.hochiminh', region: '호치민', href: '/destination/hochiminh' },
  { nameKey: 'home.cities.hanoi', region: '하노이', href: '/destination/hanoi' },
  { nameKey: 'home.cities.nhatrang', region: '나트랑', href: '/destination/nhatrang' },
];

export default function Footer() {
  const { t } = useTranslations();
  return (
    <footer className="bg-[#2a2a2a] text-white">
      {/* 메인 Footer 콘텐츠 */}
      <div className="max-w-[1280px] mx-auto section-padding py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* 회사 정보 */}
          <div>
            <h3 className="text-[18px] font-bold mb-4 text-white">Mango Travel</h3>
            <p className="text-[13px] text-gray-400 leading-relaxed mb-5 whitespace-pre-line">
              {t('footer.companyDesc')}
            </p>
            <div className="flex gap-2.5">
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-gradient-to-br hover:from-[#ffa726] hover:to-[#ffb74d] rounded-lg flex items-center justify-center transition-all group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-gradient-to-br hover:from-[#ffa726] hover:to-[#ffb74d] rounded-lg flex items-center justify-center transition-all group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-gradient-to-br hover:from-[#ffa726] hover:to-[#ffb74d] rounded-lg flex items-center justify-center transition-all group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* 여행 카테고리 */}
          <div>
            <h3 className="text-[16px] font-bold mb-4">{t('footer.travelProducts')}</h3>
            <ul className="space-y-2.5">
              {travelCategoryKeys.map((category) => (
                <li key={category.titleKey}>
                  <Link 
                    href={category.href}
                    className="text-[13px] text-gray-400 hover:text-white transition-colors"
                  >
                    {t(category.titleKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 인기 도시 */}
          <div>
            <h3 className="text-[16px] font-bold mb-4">{t('footer.popularDest')}</h3>
            <ul className="space-y-2.5">
              {cityKeys.map((city) => (
                <li key={city.nameKey}>
                  {isPrimaryRegion(city.region) ? (
                    <Link 
                      href={city.href}
                      className="text-[13px] text-gray-400 hover:text-white transition-colors"
                    >
                      {t(city.nameKey)}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => notifyComingSoon(city.region)}
                      className="text-[13px] text-gray-400 hover:text-white transition-colors"
                    >
                      {t(city.nameKey)}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* 고객센터 */}
          <div>
            <h3 className="text-[16px] font-bold mb-4">{t('footer.customerCenter')}</h3>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <PhoneIcon className="w-5 h-5 text-[#ffa726]" />
                <p className="text-[24px] font-bold text-[#ffa726] font-pretendard">
                  1588-8899
                </p>
              </div>
              <div className="text-[13px] text-gray-400 space-y-1.5 ml-7">
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="w-3.5 h-3.5" />
                  <p>{t('footer.weekdayHours')}</p>
                </div>
                <p className="ml-5">{t('footer.lunchBreak')}</p>
                <p className="ml-5">{t('footer.weekendClosed')}</p>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-gray-400 mt-3 ml-7">
                <EnvelopeIcon className="w-3.5 h-3.5" />
                <p>help@mangotravel.com</p>
              </div>
            </div>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-gradient-to-r hover:from-[#ffa726] hover:to-[#ffb74d] rounded-lg text-[13px] font-medium transition-all"
            >
              <EnvelopeIcon className="w-4 h-4" />
              {t('footer.contactUs')}
            </Link>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-white/10 my-8"></div>

        {/* 링크 메뉴 */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 text-[13px]">
          {footerLinkKeys.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className={`text-gray-400 hover:text-white transition-colors ${
                link.bold ? 'font-bold' : 'font-medium'
              }`}
            >
              {t(link.titleKey)}
            </Link>
          ))}
        </div>

        {/* 회사 상세 정보 */}
        <div className="text-[12px] text-gray-500 leading-relaxed space-y-1.5">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <p className="font-medium text-gray-400">Mango Travel</p>
            <p>{t('footer.ceo')}</p>
            <p>{t('footer.bizNo')}</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <p>{t('footer.tourBizNo')}</p>
            <p>{t('footer.saleNo')}</p>
          </div>
          <p>{t('footer.address')}</p>
          <p>{t('footer.privacyManager')}</p>
          <p className="mt-3 text-[11px]">
            {t('footer.disclaimer')}
          </p>
          <p className="mt-4 text-gray-600">
            Copyright © 2026 Mango Travel Corp. All Rights Reserved.
          </p>
        </div>
      </div>

      {/* 최하단 배너 */}
      <div className="bg-[#1a1a1a] py-4">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-gray-500">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 rounded text-[10px]">
                <CheckBadgeIcon className="w-3 h-3" />
                {t('footer.lowPrice')}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 rounded text-[10px]">
                <ShieldCheckIcon className="w-3 h-3" />
                {t('footer.safePay')}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 rounded text-[10px]">
                <ClockIcon className="w-3 h-3" />
                {t('footer.consult24')}
              </span>
            </div>
            <p className="text-[13px]">{t('footer.trustDesc')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
