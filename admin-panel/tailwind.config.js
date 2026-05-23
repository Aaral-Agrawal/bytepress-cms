/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f7f7f8', 100: '#efeff1', 200: '#d9d9de', 300: '#b8b8c1',
          400: '#9191a0', 500: '#737385', 600: '#5c5c6e', 700: '#4a4a5a',
          800: '#3e3e4a', 900: '#36363f', 950: '#1c1c23',
        },
        accent: {
          50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
          400: '#fb923c', 500: '#f97316', 600: '#ea6c0a', 700: '#c2570a',
        },
      },
      boxShadow: {
        soft:  '0 2px 20px rgba(0,0,0,0.06)',
        card:  '0 4px 32px rgba(0,0,0,0.08)',
        float: '0 8px 48px rgba(0,0,0,0.14)',
      },
    },
  },
  plugins: [],
}
