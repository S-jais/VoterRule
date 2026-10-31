import { en } from './locales/en.js';
import { hi } from './locales/hi.js';
import { as } from './locales/as.js';
import { bn } from './locales/bn.js';
import { kok } from './locales/kok.js';
import { gu } from './locales/gu.js';
import { ml } from './locales/ml.js';
import { or } from './locales/or.js';
import { pa } from './locales/pa.js';
import { ta } from './locales/ta.js';
import { te } from './locales/te.js';
import { mr } from './locales/mr.js';
import { kn } from './locales/kn.js';
import { ur } from './locales/ur.js';

export type Locale =
  | 'en'
  | 'hi'
  | 'as'
  | 'bn'
  | 'kok'
  | 'gu'
  | 'ml'
  | 'or'
  | 'pa'
  | 'ta'
  | 'te'
  | 'mr'
  | 'kn'
  | 'ur';

export type TranslationDictionary = typeof en;

export interface SupportedLanguage {
  code: Locale;
  name: string;
  nativeName: string;
  label: string;
  dir: 'ltr' | 'rtl';
}

/**
 * 14 Supported Languages in exact order matching official ECI selector
 */
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', label: 'English', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', label: 'Hindi/हिंदी', dir: 'ltr' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', label: 'Assamese/অসমীয়া', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', label: 'Bengali/বাংলা', dir: 'ltr' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', label: 'Konkani/कोंकणी', dir: 'ltr' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', label: 'Gujarati/ગુજરાતી', dir: 'ltr' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', label: 'Malayalam/മലയാളം', dir: 'ltr' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', label: 'Odia/ଓଡ଼ିଆ', dir: 'ltr' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', label: 'Punjabi/ਪੰਜਾਬੀ', dir: 'ltr' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', label: 'Tamil/தமிழ்', dir: 'ltr' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', label: 'Telugu/తెలుగు', dir: 'ltr' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', label: 'Marathi/मराठी', dir: 'ltr' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', label: 'Kannada/ಕನ್ನಡ', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', label: 'Urdu/اردو', dir: 'rtl' },
];

export const dictionaries: Record<Locale, TranslationDictionary> = {
  en,
  hi,
  as,
  bn,
  kok,
  gu,
  ml,
  or,
  pa,
  ta,
  te,
  mr,
  kn,
  ur,
};

/**
 * Get a nested translation value by dot notation e.g. 'landing.heroTitle'
 */
export function t(
  locale: Locale,
  path: string,
  variables?: Record<string, string | number>
): string {
  const dict = dictionaries[locale] ?? dictionaries.en;
  const keys = path.split('.');
  let current: any = dict;

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      // Fallback to English
      let fallback: any = dictionaries.en;
      for (const fk of keys) {
        if (fallback && typeof fallback === 'object' && fk in fallback) {
          fallback = fallback[fk];
        } else {
          return path;
        }
      }
      current = fallback;
      break;
    }
  }

  if (Array.isArray(current)) {
    return current as any;
  }

  if (typeof current !== 'string') {
    return path;
  }

  let result = current;
  if (variables) {
    for (const [vKey, vVal] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{${vKey}}`, 'g'), String(vVal));
    }
  }

  return result;
}

export function tList(locale: Locale, path: string): string[] {
  const dict = dictionaries[locale] ?? dictionaries.en;
  const keys = path.split('.');
  let current: any = dict;

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      let fallback: any = dictionaries.en;
      for (const fk of keys) {
        if (fallback && typeof fallback === 'object' && fk in fallback) {
          fallback = fallback[fk];
        } else {
          return [];
        }
      }
      current = fallback;
      break;
    }
  }

  return Array.isArray(current) ? current : [];
}

const INTL_LOCALE_MAP: Record<Locale, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  as: 'as-IN',
  bn: 'bn-IN',
  kok: 'kok-IN',
  gu: 'gu-IN',
  ml: 'ml-IN',
  or: 'or-IN',
  pa: 'pa-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  kn: 'kn-IN',
  ur: 'ur-IN',
};

export function formatDateLocale(date: Date | string, locale: Locale): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const intlLocale = INTL_LOCALE_MAP[locale] || 'en-IN';
  return new Intl.DateTimeFormat(intlLocale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatNumberLocale(num: number, locale: Locale): string {
  const intlLocale = INTL_LOCALE_MAP[locale] || 'en-IN';
  return new Intl.NumberFormat(intlLocale).format(num);
}
