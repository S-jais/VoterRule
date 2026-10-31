/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          saffron: '#FF9933',
          saffronText: '#9A4500',
          green: '#138808',
          greenText: '#0D5C05',
          navy: '#000080',
          navyText: '#0B1030',
        },
      },
    },
  },
  plugins: [],
};
