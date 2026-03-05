'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useTranslations } from '@/lib/useTranslations';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder,
}: SearchBarProps) {
  const { t } = useTranslations();
  const [query, setQuery] = useState('');
  const displayPlaceholder = placeholder ?? t('common.searchPlaceholder');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full h-16 bg-white rounded-2xl flex items-center px-6 gap-4 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all"
    >
      <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={displayPlaceholder}
        className="flex-1 min-w-0 bg-transparent border-none outline-none text-[16px] font-pretendard placeholder:text-gray-400 text-gray-900"
      />
      <button
        type="submit"
        className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white rounded-xl text-[15px] font-bold hover:from-[#f57c00] hover:to-[#ffa726] transition-all hover:scale-105 shadow-md"
        aria-label={t('common.search')}
      >
        {t('common.search')}
      </button>
    </form>
  );
}
