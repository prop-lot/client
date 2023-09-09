/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./pages/*.{js,ts,jsx,tsx}",
    "./components/*.{js,ts,jsx,tsx}",
    "./utils/virtualTagColors.ts",
  ],
  theme: {
    fontFamily: {
      ptRootUI: ["PT Root UI", "sans-serif"],
      inter: ["Inter", "sans-serif"],
      londrina: ["Londrina Solid"],
      londrinaLight: ["Londrina Light"],
    },
    fontSize: {
      xs: ["12px", "16px"],
      sm: ['14px', '20px'],
      base: ['16px', '24px'],
      lg: ['20px', '28px'],
      xl: ['24px', '32px'],
      xxl: ['44px', 'normal'],
    },
    spacing: {
      'xs': '4px',
      'sm': '8px',
      'md': '16px',
      'lg': '24px',
      'xl': '32px',
    },
    colors: {
      'white': '#FFFFFF',
      'black': '#202327',
      'slate': '#68778D',
      'light-green': '#34AC80',
      'purple': '#1929F4',
      'blue': '#26B1F3',
      'yellow': '#FFB913',
      'pink': '#FB4694',
      'green': '#068940',
      'grey': '#E2E8F0',
      'orange': '#FF7216',
      'light-purple': '#395ED1',
      'dark-grey': '#8C8D92',
    },
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};
