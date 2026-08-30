/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        cyber: {
          dark: '#0F0F0F',
          darker: '#000000',
          gray: '#353535',
          lightGray: '#F5F5F5',
          border: '#E5E5E5',
          muted: '#7C7C7C',
          accent: '#000000',
          badgeRed: '#FF3B30',
        },
      },
    },
  },
  plugins: [],
};
