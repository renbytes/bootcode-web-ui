/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary': '#232a31',
        'secondary': '#313a43',
        'accent': '#c53929',
        'light-gray': '#f6f8fa',
        'medium-gray': '#e1e4e8',
        'dark-gray': '#586069',
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
