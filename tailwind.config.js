/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b3ccff",
          300: "#82a9ff",
          400: "#5c86f5",
          500: "#3e63e0",
          600: "#2f4bc2",
          700: "#28399c",
          800: "#25327d",
          900: "#232d64",
        },
      },
    },
  },
  plugins: [],
};
