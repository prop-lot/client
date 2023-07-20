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
      propLot: ["Inter", "sans-serif"],
      londrina: ["Londrina Solid"],
    },
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};
