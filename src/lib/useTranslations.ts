'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useMemo } from 'react';
import { ko } from '@/lib/translations/ko';
import { en } from '@/lib/translations/en';

const dictionaries = { ko, en } as const;

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(text: string, params: Record<string, string | number>): string {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value)),
    text
  );
}

export function useTranslations() {
  const { language } = useLanguage();
  const dict = dictionaries[language];

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>): string => {
      const value = getNested(dict as Record<string, unknown>, key);
      const text = value ?? key;
      return params ? interpolate(text, params) : text;
    };
  }, [dict, language]);

  return { t, language };
}
