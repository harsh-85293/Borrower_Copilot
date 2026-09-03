/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FBF9FA',
        plum: {
          50: '#F7F2F6',
          100: '#EDE0E6',
          200: '#D4B8C6',
          300: '#B88CA6',
          400: '#8E5C76',
          500: '#6B3D54',
          600: '#4B2440',
          700: '#3A1B32',
          800: '#2D1528',
          900: '#1F0E1C',
        },
        sage: {
          50: '#F2F6F2',
          100: '#D9E8D9',
          200: '#B3D0B3',
          300: '#7AAB7A',
          400: '#4D8A4D',
          500: '#2E6B2E',
        },
        gold: {
          400: '#D4A843',
          500: '#B8932E',
          600: '#9A7A22',
        },
        rust: {
          400: '#C25B3F',
          500: '#A04528',
        },
      },
      fontFamily: {
        serif: ['"Fraunces"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
};
