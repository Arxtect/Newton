/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-29 10:50:34
 */
import React, { useEffect } from "react";

export default function useSwitchTheme() {
  const config = {
    theme: "light",
  };

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const themeColor = getComputedStyle(document.body)
      .getPropertyValue("--theme-color")
      .trim();
    const metaDescription = document.querySelector('meta[name="theme-color"]');
    metaDescription?.setAttribute("content", themeColor);
  }, [config.theme]);
}
