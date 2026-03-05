'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import type { Language } from '@/contexts/LanguageContext';

export const ADMIN_LANGUAGE_STORAGE_KEY = 'mango-admin-lang';

interface AdminLanguageContextType {
  adminLanguage: Language;
  setAdminLanguage: (lang: Language) => void;
  toggleAdminLanguage: () => void;
}

const AdminLanguageContext = createContext<AdminLanguageContextType | undefined>(undefined);

function getStoredAdminLanguage(): Language {
  if (typeof window === 'undefined') return 'ko';
  try {
    const stored = localStorage.getItem(ADMIN_LANGUAGE_STORAGE_KEY);
    if (stored === 'ko' || stored === 'en') return stored;
  } catch {
    // ignore
  }
  return 'ko';
}

export function AdminLanguageProvider({ children }: { children: ReactNode }) {
  const [adminLanguage, setAdminLanguageState] = useState<Language>('ko');

  useEffect(() => {
    setAdminLanguageState(getStoredAdminLanguage());
  }, []);

  const setAdminLanguage = (lang: Language) => {
    setAdminLanguageState(lang);
    try {
      localStorage.setItem(ADMIN_LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const toggleAdminLanguage = () => {
    setAdminLanguage(adminLanguage === 'ko' ? 'en' : 'ko');
  };

  return (
    <AdminLanguageContext.Provider value={{ adminLanguage, setAdminLanguage, toggleAdminLanguage }}>
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  const ctx = useContext(AdminLanguageContext);
  if (ctx === undefined) {
    throw new Error('useAdminLanguage must be used within AdminLanguageProvider');
  }
  return ctx;
}
