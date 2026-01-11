'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import type { Locale } from './messages';
import { isValidLocale, t as tFunction } from './messages';
import type { I18nKey } from './keys';

export function useT() {
  const params = useParams();
  const localeParam = params?.locale as string;
  
  // Validate locale, fallback to 'en' if invalid
  const locale: Locale = isValidLocale(localeParam) ? localeParam : 'en';
  
  const t = useMemo(() => {
    return (key: I18nKey, vars?: Record<string, string | number>): string => {
      return tFunction(locale, key, vars);
    };
  }, [locale]);
  
  return { t, locale };
}

