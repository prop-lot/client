/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      propLot: ["Inter", "sans-serif"],
      londrina: ["Londrina Solid"],
    },
    extend: {},
  },
  plugins: [],
};
