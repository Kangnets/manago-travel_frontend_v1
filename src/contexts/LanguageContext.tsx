'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ko' | 'en';

const STORAGE_KEY = 'mango-travel-lang';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'ko';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ko' || stored === 'en') return stored;
  } catch {
    // ignore
  }
  return 'ko';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ko');

  useEffect(() => {
    setLanguageState(getStoredLanguage());
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (ctx === undefined) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
