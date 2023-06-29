/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        link: "#13678a",
        primary: "#e7f8ff",
      },
    },
  },
  plugins: [],
  important: true,
};
