/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange:    '#FF6B00',
          black:     '#1A1A1A',
          darkgray:  '#333333',
          lightgray: '#F5F5F5',
          bordergray:'#E5E5E5',
          success:   '#10B981',
          error:     '#EF4444',
          warning:   '#F59E0B',
          info:      '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        sora: ['Sora', 'sans-serif'],
      },
      boxShadow: {
        card:    '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        'card-lg':'0 10px 25px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.05)',
        logo:    '0 2px 12px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
