'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LangToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      title={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md hover:shadow-lg hover:bg-gray-50 active:scale-95 flex items-center justify-center text-gray-700 hover:text-[#ffa726] transition-all duration-200"
      aria-label={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
    >
      <span className="text-[13px] font-semibold leading-none">
        {language === 'ko' ? 'A' : '한'}
      </span>
    </button>
  );
}
