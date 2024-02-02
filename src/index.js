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
// Redux
import { Provider } from "react-redux";
import store from "./store";
import { lazy, Suspense } from "react";
import "./styles/globals.scss";
import CircularProgress from "@mui/material/CircularProgress";
import * as git from "isomorphic-git";
import fs from "fs";
import { findAllProject } from "domain/filesystem";
import { useFileStore } from "store";

const Home = lazy(() => import("./views/home"));
const Arxtect = lazy(() => import("./views/arxtect"));
const GitText = lazy(() => import("./views/git-test"));

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
    <Provider store={store}>
      <HashRouter>
        {" "}
        {/* Replace BrowserRouter with HashRouter */}
        <Header />
        <Suspense fallback={<CircularProgress />}>
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/arxtect" element={<Arxtect />}></Route>
            <Route path="/git-test" element={<GitText />}></Route>
          </Routes>
        </Suspense>
        {/* <Footer /> */}
      </HashRouter>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
