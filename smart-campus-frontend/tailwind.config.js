/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7950F2',
          light: '#9775FA',
          dark: '#6741D9',
        },
        accent: {
          DEFAULT: '#14B8A6',
          light: '#2DD4BF',
          dark: '#0D9488',
        },
        background: {
          DEFAULT: '#FFFFFF',
          dark: '#010D2C',
        },
        backgroundAlt: {
          DEFAULT: '#F8F9FA',
          dark: '#0A1628',
        },
        text: {
          DEFAULT: '#010D2C',
          dark: '#F9F8FF',
          secondary: '#6C757D',
          'secondary-dark': '#ADB5BD',
        },
        border: {
          DEFAULT: '#DEE2E6',
          dark: '#1E293B',
        },
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
      },
      fontFamily: {
        display: ['Lexend', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'premium': '0 10px 40px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'gradient': 'gradient 8s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

