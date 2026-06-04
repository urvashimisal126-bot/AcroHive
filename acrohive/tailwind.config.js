/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00D4FF',
          dark: '#0099CC',
          glow: 'rgba(0, 212, 255, 0.12)',
          border: 'rgba(0, 212, 255, 0.25)',
        },
        cyber: {
          bg: '#001a2e',
          card: '#0d1a2e',
        },
        surface: {
          primary: '#000000',
          card: '#0d0d0d',
          elevated: '#161616',
        },
        danger: '#FF1744',
        warning: '#FF9800',
        muted: '#888888',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '50%': { transform: 'scale(1.3)', opacity: '0.4' },
          '100%': { transform: 'scale(0.8)', opacity: '1' },
        },
        'fade-in-slide': {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0, 212, 255, 0.2)' },
          '50%': { boxShadow: '0 0 24px rgba(0, 212, 255, 0.5)' },
        },
        'counter-bump': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.5s ease-in-out infinite',
        'fade-in-slide': 'fade-in-slide 0.3s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'counter-bump': 'counter-bump 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
