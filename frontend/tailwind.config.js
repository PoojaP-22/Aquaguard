/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a1628',
          800: '#0d1f3c',
          700: '#112244',
          600: '#1a3a5c',
          500: '#1e4976',
        },
        water: {
          500: '#0ea5e9',
          400: '#38bdf8',
          300: '#7dd3fc',
        },
      },
    },
  },
  plugins: [],
};
