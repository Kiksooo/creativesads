export type Locale = 'ru' | 'en' | 'es';

export const locales: Locale[] = ['ru', 'en', 'es'];

// Translation keys type - now supports any dot-path string
export type TranslationKey = string;

// Legacy translations object - kept for backward compatibility
// New code should use getMessages() instead
const translations: Record<Locale, Record<string, string>> = {
  ru: {},
  en: {},
  es: {},
};

import { getMessages } from './getMessages';
import type { I18nKey } from './keys';

export function t(
  locale: Locale, 
  key: I18nKey | string,
  vars?: Record<string, string | number>
): string {
  const messages = getMessages(locale);
  
  // Support dot-path notation (e.g., 'common.ok' -> messages.common.ok)
  const keys = key.split('.');
  let value: any = messages;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback: return key if not found
      return key;
    }
  }
  
  let result = typeof value === 'string' ? value : key;
  
  // Interpolation: replace {key} with values
  if (vars) {
    for (const [varKey, varValue] of Object.entries(vars)) {
      result = result.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(varValue));
    }
  }
  
  return result;
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

