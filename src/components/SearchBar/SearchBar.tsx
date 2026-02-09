'use client';

import { useState } from 'react';
import { IconSearch } from '@/components/ui/Icons';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = '키워드를 입력해주세요',
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full h-12 sm:h-14 bg-primary-lightGray rounded-xl flex items-center px-4 gap-2"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 bg-transparent border-none outline-none text-[15px] sm:text-[16px] font-pretendard placeholder:text-primary-gray"
      />
      <button
        type="submit"
        className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
        aria-label="검색"
      >
        <IconSearch className="w-5 h-5" />
      </button>
    </form>
  );
}
