/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-10-09 16:46:03
 */
/* eslint-disable no-console */

const debugging =
  new URLSearchParams(window.location.search).get("debug") === "true";

const debugConsole = debugging
  ? console
  : {
      debug: function () {},
      log: function () {},
      warn: console.warn.bind(console),
      error: console.error.bind(console),
    };

export { debugging, debugConsole };
