/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-25 12:25:23
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        link: "#13678a",
        primary: "#e7f8ff",
      },
      height: {
        "minus-125": "calc(100vh - 125px)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".border-gradient-top": {
          "@apply border-t relative": {},
          "&:after": {
            content: '""',
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "1px",
            background:
              "linear-gradient(to right, #yourStartColor, #yourEndColor)",
          },
        },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
  important: true,
};
