/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          500: '#3B4FE8',
          600: '#2D3FD3',
          700: '#1E2FAA',
          900: '#0F1860',
        },
        brand: {
          DEFAULT: '#1A3FBF',
          light:   '#3B5BDB',
          dark:    '#0F2080',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}