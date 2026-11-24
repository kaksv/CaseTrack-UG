import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#faf8fb',
          100: '#f2edf4',
          200: '#e5dbe8',
          300: '#cbbbd1',
          400: '#62676C',
          500: '#62676C',
          600: '#62676C',
          700: '#5D2B62',
          800: '#5D2B62',
          900: '#2A003A',
          950: '#2A003A',
        },
        gold: {
          50: '#faf7fa',
          100: '#f6edf4',
          200: '#efdce8',
          300: '#E7BDD9',
          400: '#E7BDD9',
          500: '#E7BDD9',
          600: '#5D2B62',
          700: '#5D2B62',
          800: '#2A003A',
          900: '#2A003A',
        },
        cream: '#FFFFFF',
        sand: '#FFFFFF',
        paper: '#FFFFFF',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(42, 0, 58, 0.04), 0 12px 32px -20px rgba(42, 0, 58, 0.18)',
        lift: '0 2px 4px rgba(42, 0, 58, 0.05), 0 22px 50px -24px rgba(42, 0, 58, 0.28)',
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
