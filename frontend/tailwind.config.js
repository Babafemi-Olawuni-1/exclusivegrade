/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        sora: ['Sora', 'sans-serif'],
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        'card-lg': '0 10px 25px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.05)',
        'logo':    '0 2px 12px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
