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
        "g-color-87": "var(--g-color-87)",
        arxTheme: "#4caf4f",
        "arx-theme-hover": "#5daf4fde",
        arxThemeDark: "#18191F",
        arxOdd: "#f5f7fa",
        "white-hover": "#edededcc",
        footer: "#263238",
        borderWidth: {
          1: "1px", // 如果 Tailwind 默认没有提供 1px 宽度，可以在这里添加
        },
      },
      height: {
        "minus-125": "calc(100vh - 125px)",
      },
      zIndex: {
        '999': '999',
      },
      width: {
        "1/9": "calc(100% / 9)",
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
        ".p-home-layout": {
          paddingRight: "var(--custom-padding)",
          paddingLeft: "var(--custom-padding)",
        },
        "@screen md": {
          ".p-home-layout": {
            paddingRight: "var(--custom-padding-md)",
            paddingLeft: "var(--custom-padding-md)",
          },
        },
        "@screen lg": {
          ".p-home-layout": {
            paddingRight: "var(--custom-padding-lg)",
            paddingLeft: "var(--custom-padding-lg)",
          },
        },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
  important: true,
};
