/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
      colors: {
        primary: "#ff4747", // 🎯 primary color
      },
      animation: {
        'fade-in-left': 'fadeInLeft 1s ease-out',
      },
      keyframes: {
        fadeInLeft: {
          '0%': { opacity: 0, transform: 'translateX(-50px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};
