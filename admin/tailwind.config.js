/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          brown: {
            50: '#faf8f5',
            100: '#f5f0e8',
            200: '#e8dcc8',
            300: '#d4c0a0',
            400: '#b89968',
            500: '#8b6f47',
            600: '#6b5435',
            700: '#4a3a24',
            800: '#2d2416',
            900: '#1a150d',
          },
          cream: {
            50: '#fefdfb',
            100: '#fdfbf7',
            200: '#faf6ed',
            300: '#f5ede0',
            400: '#ede0cc',
            500: '#e0ccb3',
            600: '#c9b299',
            700: '#a89070',
            800: '#7a6650',
            900: '#4d4032',
          },
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
