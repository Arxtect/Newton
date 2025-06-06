/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-26 09:57:49
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom"; // Use HashRouter
// Styles and components
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import "./styles/globals.scss";
import { findAllProject } from "domain/filesystem";
import { useFileStore } from "store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRouter from "@/router";
import DialogLogin from "@/views/login/dialog-login.js";
import { writeFile } from "domain/filesystem";
import path from "path";
import latexCodeWelcome from "@/features/latexEditor/welcome";
import "./sentry.js";
import "primereact/resources/themes/saga-blue/theme.css"; // 主题样式
import "primereact/resources/primereact.min.css"; // 核心样式

async function loadBrowserFS() {
  return new Promise((resolve) => {
    const BrowserFS = require("browserfs");
    BrowserFS.install(window);
    BrowserFS.configure({ fs: "IndexedDB", options: {} }, (err) => {
      if (err) {
        throw err;
      }

      resolve();
    });
  });
}

async function initializeFileSystem() {
  try {
    await loadBrowserFS();
  } catch (error) {
    console.error("Failed to initialize BrowserFS:", error);
  }
}

await initializeFileSystem();

let projectLists = await findAllProject(".");
if (projectLists.length == 0) {
  let rootPath = "arxtect";
  let filepath = path.join(rootPath, "main.tex");
  await useFileStore.getState().createProject(rootPath);
  await writeFile(filepath, latexCodeWelcome);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.Fragment>
    <ToastContainer />
    <AppRouter />
    <DialogLogin></DialogLogin>
  </React.Fragment>
);

reportWebVitals();
