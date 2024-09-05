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
import { Header } from "./features/header/Header";
import { Footer } from "./features/footer/Footer";
import { lazy, Suspense } from "react";
import "./styles/globals.scss";
import CircularProgress from "@mui/material/CircularProgress";
import * as git from "isomorphic-git";
import fs from "fs";
import { findAllProject } from "domain/filesystem";
import { useFileStore } from "store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRouter from "@/router";
import DialogLogin from "@/views/login/dialog-login.js";
import { writeFile } from "domain/filesystem";
import path from "path";
import latexCodeWelcome from "@/features/latexEditor/welcome";
// import "@blueprintjs/core/lib/css/blueprint.css";
// import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "./sentry.js";

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

await loadBrowserFS();
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
