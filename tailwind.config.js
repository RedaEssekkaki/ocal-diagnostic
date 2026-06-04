/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        protein: "#534AB7",
        carb: "#BA7517",
        fat: "#0F6E56",
      },
    },
  },
  plugins: [],
};
