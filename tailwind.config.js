/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        protein: "#534AB7",
        carb: "#BA7517",
        fat: "#0F6E56",
        ocal: {
          green: "#12462d",
          "green-deep": "#082515",
          "green-soft": "#e8f2ed",
          orange: "#f57916",
          ink: "#17211d",
          muted: "#627168",
        },
      },
    },
  },
  plugins: [],
};
