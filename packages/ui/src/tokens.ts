/**
 * Design Tokens for VoterRule
 * Original Tiranga-inspired civic palette with WCAG 2.2 AA compliant contrast pairs
 */

export const colors = {
  brand: {
    saffron: '#FF9933', // Decorative fills and accents
    saffronText: '#9A4500', // WCAG AA text contrast on white/warm-white (4.8:1)
    saffronDeep: '#A84F00',
    saffronBgLight: '#FFF5EB',
    saffronWash: '#FFF1DE',
    white: '#FFFFFF',
    warmWhite: '#FFFBF5',
    green: '#138808', // Primary civic green
    greenText: '#0D5C05', // WCAG AA text contrast on white (5.5:1)
    greenDeep: '#0D6A05',
    greenBgLight: '#EDF8EE',
    greenWash: '#E7F5E4',
    chakraNavy: '#000080', // Chakra navy
    navyText: '#0B1030', // Deep primary body text (17.2:1 contrast)
    navyLight: '#1A237E',
    navyBgLight: '#EFF2FE',
    ink: '#0B1030',
    ink2: '#3A4160',
    ink3: '#5A6180',
    line: '#E8E0D0',
    lineStrong: '#CFC3AA',
  },
  neutral: {
    50: '#FFFBF5',
    100: '#F8F2E6',
    200: '#E8E0D0',
    300: '#CFC3AA',
    400: '#8D94BD',
    500: '#5A6180',
    600: '#3A4160',
    700: '#1F2937',
    800: '#111827',
    900: '#0B1030',
  },
  status: {
    success: '#0D5C05',
    successBg: '#EDF8EE',
    warning: '#9A4500',
    warningBg: '#FFF5EB',
    error: '#B91C1C',
    errorBg: '#FEF2F2',
    info: '#000080',
    infoBg: '#EFF2FE',
  },
};

export const typography = {
  fontFamily: {
    display: '"Bricolage Grotesque", "Noto Sans Devanagari", system-ui, sans-serif',
    body: 'Figtree, "Noto Sans Devanagari", system-ui, -apple-system, "Segoe UI", sans-serif',
    sans: 'Figtree, "Noto Sans Devanagari", system-ui, -apple-system, "Segoe UI", sans-serif',
    devanagari: '"Noto Sans Devanagari", system-ui, sans-serif',
  },
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px (minimum body per spec)
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
};

export const motion = {
  durations: {
    fast: '160ms',
    normal: '240ms',
    moderate: '400ms',
    slow: '600ms',
  },
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
};
