/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 12:37:50
 */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  important: false,
  theme: {
    extend: {
      borderWidth: {
        1: "1px",
      },
      fontFamily: {
        sans: ["Lato", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        arx: ["ui-monospace", "sans-serif"],
      },
      colors: {
        link: "#13678a",
        primary: "#e7f8ff",
        "g-color-87": "var(--g-color-87)",
        arxTheme: "#4caf4f ",
        "arx-theme-hover": "#5daf4fde",
        arxThemeDark: "#18191F",
        arxTextGray: "#000000f5",
        arxOdd: "#f5f7fa",
        "white-hover": "#edededcc",
        footer: "#263238",
      },
      height: {
        "minus-125": "calc(100vh - 125px)",
      },
      zIndex: {
        999: "999",
      },
      width: {
        "1/9": "calc(100% / 9)",
      },
      animation: {
        "spin-slow": "spin 2s linear infinite", // 修改这里的3s为你想要的速度
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
    function ({ addVariant }) {
      addVariant("nth-child-2n", "&:nth-child(2n)");
      addVariant("nth-child-3n", "&:nth-child(3n)");
    },
  ],
  important: true,
};
