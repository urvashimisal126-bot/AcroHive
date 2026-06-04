/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
        }
      }
    },
  },
  plugins: [],
}
