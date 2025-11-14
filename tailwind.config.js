/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'content-secondary': '#525F7A',
        'content-primary': '#000000',
        'content-tertiary': '#7B8AA7',
        'background-primary': '#FFFFFF',
        'background-secondary': '#F0F1F5',
        'border-default': '#DDE2E9',
        'button-primary': '#7F53FD',
        'button-primary-border': '#6935FD',
        'gift-wrap': '#FF9E9E',
      },
      fontFamily: {
        'goody-sans': ['Goody Sans', 'sans-serif'],
        'hw-cigars': ['HW Cigars', 'serif'],
      },
    },
  },
  plugins: [],
}
