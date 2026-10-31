/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
        ink: {
          DEFAULT: 'var(--ink)',
          2: 'var(--ink-2)',
          3: 'var(--ink-3)',
        },
        link: 'var(--link)',
        btn: {
          bg: 'var(--btn-bg)',
          hover: 'var(--btn-bg-hover)',
          fg: 'var(--btn-fg)',
        },
        saffron: {
          DEFAULT: 'var(--saffron)',
          deep: 'var(--saffron-deep)',
          wash: 'var(--saffron-wash)',
        },
        green: {
          DEFAULT: 'var(--green)',
          deep: 'var(--green-deep)',
          wash: 'var(--green-wash)',
        },
        strip: {
          bg: 'var(--strip-bg)',
          fg: 'var(--strip-fg)',
        },
        foot: {
          bg: 'var(--foot-bg)',
          fg: 'var(--foot-fg)',
          'fg-2': 'var(--foot-fg-2)',
          line: 'var(--foot-line)',
        },
        brand: {
          saffron: '#FF9933',
          saffronText: '#A84F00',
          saffronBg: '#FFF1DE',
          green: '#138808',
          greenText: '#0D6A05',
          greenBg: '#E7F5E4',
          navy: '#000080',
          navyText: '#0B1030',
          navyBg: '#EFF2FE',
          warmWhite: '#FFFBF5',
        },
      },
      fontFamily: {
        display: [
          '"Bricolage Grotesque"',
          '"Noto Sans Devanagari"',
          'system-ui',
          'sans-serif',
        ],
        sans: [
          'Figtree',
          '"Noto Sans Devanagari"',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'sans-serif',
        ],
        body: [
          'Figtree',
          '"Noto Sans Devanagari"',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'sans-serif',
        ],
      },
      boxShadow: {
        civic: '0 1px 0 rgba(11,16,48,.04),0 10px 28px -14px rgba(11,16,48,.22)',
      },
      borderRadius: {
        'r-lg': '20px',
        'r-md': '12px',
      },
    },
  },
  plugins: [],
};
