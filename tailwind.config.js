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
          DEFAULT: '#D03E3E',
          dark: '#B83434',
          light: '#E05555'
        },
        secondary: {
          DEFAULT: '#F5EFE7',
          dark: '#E8DFD4'
        },
        accent: {
          gray: '#5F6368',
          lightgray: '#9AA0A6'
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}
