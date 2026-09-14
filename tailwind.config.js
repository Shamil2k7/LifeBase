/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#2C3E8C",
          light: "#EBEEFA",
          dark: "#7C8FF5",
        },
        accent: {
          DEFAULT: "#0BA97A",
          light: "#E2F7EF",
          dark: "#3BDDAA",
        },
      },
      borderRadius: {
        card: "20px",
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(30,40,90,0.14)",
        softDark: "0 10px 30px -12px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};
