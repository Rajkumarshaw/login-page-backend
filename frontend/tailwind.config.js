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
          50: '#f0f4fe',
          100: '#dbe4fc',
          200: '#bfd0fa',
          300: '#94b1f6',
          400: '#628cf0',
          500: '#3c66e9',
          600: '#254ad7',
          700: '#1d3bbd',
          800: '#1c339a',
          900: '#1c2e7a',
          950: '#111b4b',
        }
      }
    },
  },
  plugins: [],
}
