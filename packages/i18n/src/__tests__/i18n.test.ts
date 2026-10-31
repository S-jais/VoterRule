import { describe, it, expect } from 'vitest';
import {
  t,
  formatDateLocale,
  formatNumberLocale,
  SUPPORTED_LANGUAGES,
  dictionaries,
  Locale,
} from '../index.js';

describe('i18n Package Unit Tests', () => {
  it('supports all 14 official Indian election languages', () => {
    expect(SUPPORTED_LANGUAGES.length).toBe(14);
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toEqual([
      'en',
      'hi',
      'as',
      'bn',
      'kok',
      'gu',
      'ml',
      'or',
      'pa',
      'ta',
      'te',
      'mr',
      'kn',
      'ur',
    ]);
  });

  it('provides dictionaries for every supported locale with common namespaces', () => {
    SUPPORTED_LANGUAGES.forEach((lang) => {
      const dict = dictionaries[lang.code as Locale];
      expect(dict).toBeDefined();
      expect(dict.common).toBeDefined();
      expect(dict.landing).toBeDefined();
      expect(dict.wizard).toBeDefined();
      expect(dict.auth).toBeDefined();
      expect(dict.dashboard).toBeDefined();
      expect(dict.cases).toBeDefined();
      expect(dict.glossary).toBeDefined();
    });
  });

  it('translates nested keys accurately across languages', () => {
    expect(t('en', 'landing.heroTitle')).toContain('Check your voter status');
    expect(t('hi', 'landing.heroTitle')).toContain('अपनी मतदाता सूची स्थिति जांचें');
    expect(t('bn', 'landing.heroTitle')).toContain('আপনার ভোটার তালিকার স্থিতি যাচাই করুন');
    expect(t('ta', 'landing.heroTitle')).toContain('உங்கள் வாக்காளர் நிலையை சரிபார்க்கவும்');
    expect(t('te', 'landing.heroTitle')).toContain('మీ ఓటరు స్థితిని తనిఖీ చేయండి');
    expect(t('mr', 'landing.heroTitle')).toContain('आपली मतदार यादीतील स्थिती तपासा');
    expect(t('gu', 'landing.heroTitle')).toContain('તમારી મતદારયાદીની સ્થિતિ તપાસો');
    expect(t('kn', 'landing.heroTitle')).toContain('ನಿಮ್ಮ ಮತದಾರರ ಪಟ್ಟಿಯ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ');
    expect(t('ml', 'landing.heroTitle')).toContain('നിങ്ങളുടെ വോട്ടർ പട്ടിക പരിശോധിക്കുക');
    expect(t('pa', 'landing.heroTitle')).toContain('ਆਪਣੀ ਵੋਟਰ ਸੂਚੀ ਦੀ ਸਥਿਤੀ ਦੀ ਜਾਂਚ ਕਰੋ');
    expect(t('or', 'landing.heroTitle')).toContain('ଆପଣଙ୍କ ଭୋଟର ତାଲିକା ସ୍ଥିତି ଯାଞ୍ଚ କରନ୍ତୁ');
    expect(t('as', 'landing.heroTitle')).toContain('আপোনাৰ ভোটাৰ তালিকাৰ স্থিতি পৰীক্ষা কৰক');
    expect(t('kok', 'landing.heroTitle')).toContain('तुमची मतदार वळेरी स्थिती तपासात');
    expect(t('ur', 'landing.heroTitle')).toContain('اپنی ووٹر لسٹ کی حیثیت چیک کریں');
  });

  it('falls back to English when a key is missing', () => {
    const val = t('kok', 'common.appName');
    expect(val).toContain('VoterRule');
  });

  it('formats dates appropriately for Indian English and regional locales', () => {
    const testDate = new Date('2026-01-26T00:00:00Z');
    expect(formatDateLocale(testDate, 'en')).toContain('2026');
    expect(formatDateLocale(testDate, 'hi')).toContain('2026');
    expect(formatDateLocale(testDate, 'bn')).toContain('২০২৬');
    expect(formatDateLocale(testDate, 'ta')).toContain('2026');
  });

  it('formats numbers properly', () => {
    const formattedEn = formatNumberLocale(100000, 'en');
    expect(formattedEn).toBe('1,00,000'); // Indian numbering standard
  });

  it('marks Urdu with RTL directionality', () => {
    const urdu = SUPPORTED_LANGUAGES.find((l) => l.code === 'ur');
    expect(urdu?.dir).toBe('rtl');
    const hindi = SUPPORTED_LANGUAGES.find((l) => l.code === 'hi');
    expect(hindi?.dir).toBe('ltr');
  });
});
