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
import RouterComponent from "@/router/index";

async function loadBrowserFS() {
  return new Promise((resolve) => {
    const BrowserFS = require("browserfs");
    git.plugins.set("fs", fs);
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
  useFileStore.getState().createProject("arxtect");
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ToastContainer />
    <HashRouter>
      <Suspense fallback={<CircularProgress />}>
        <RouterComponent></RouterComponent>
      </Suspense>
    </HashRouter>
  </React.StrictMode>
);

reportWebVitals();
