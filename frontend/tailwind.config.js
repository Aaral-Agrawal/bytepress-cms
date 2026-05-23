/** @type {import('tailwindcss').Config} */
const config = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          brand: {
            50:  '#eff6ff',
            100: '#dbeafe',
            500: '#3b82f6',
            600: '#1a6dff',
            700: '#0f4fd4',
            900: '#0d1117',
          },
        },
        fontFamily: {
          display: ['Playfair Display', 'Georgia', 'serif'],
          body:    ['DM Sans', 'system-ui', 'sans-serif'],
        },
        animation: {
          'float':      'float 5s ease-in-out infinite',
          'float-2':    'float 6s ease-in-out 1s infinite',
          'float-3':    'float 4.5s ease-in-out 0.5s infinite',
          'fade-up':    'fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both',
          'tag-scroll': 'tagScroll 22s linear infinite',
          'shimmer':    'shimmer 1.3s linear infinite',
        },
        keyframes: {
          float:     { '0%,100%': { transform: 'translateY(0) rotate(-1deg)' }, '50%': { transform: 'translateY(-14px) rotate(1deg)' } },
          fadeUp:    { from: { opacity: 0, transform: 'translateY(28px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
          tagScroll: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
          shimmer:   { '0%': { backgroundPosition: '-600px 0' }, '100%': { backgroundPosition: '600px 0' } },
        },
        boxShadow: {
          'card':      '0 4px 20px rgba(0,0,0,0.08)',
          'card-hover':'0 16px 48px rgba(0,0,0,0.12)',
          'blue':      '0 8px 24px rgba(26,109,255,0.32)',
        },
      },
    },
    plugins: [],
  };
  
  export default config;