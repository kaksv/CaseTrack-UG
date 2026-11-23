import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f4f7f5',
          100: '#e5ece8',
          200: '#ccd9d1',
          300: '#a5bdb0',
          400: '#769b88',
          500: '#527e69',
          600: '#3d6452',
          700: '#325143',
          800: '#2a4238',
          900: '#0e1f19',
          950: '#07130f',
        },
        gold: {
          50: '#fbf8ec',
          100: '#f5edd0',
          200: '#ead99d',
          300: '#ddc065',
          400: '#d2a93d',
          500: '#c9a227',
          600: '#a87d1c',
          700: '#875d19',
          800: '#714b1b',
          900: '#613f1c',
        },
        cream: '#faf7f0',
        sand: '#f1ebdd',
        paper: '#fffdf8',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(14, 31, 25, 0.04), 0 12px 32px -20px rgba(14, 31, 25, 0.25)',
        lift: '0 2px 4px rgba(14, 31, 25, 0.05), 0 22px 50px -24px rgba(14, 31, 25, 0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
