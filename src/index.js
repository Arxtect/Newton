/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-26 09:57:49
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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

const Home = lazy(() => import("./views/home"));
const Arxtect = lazy(() => import("./views/arxtect"));
const GitText = lazy(() => import("./views/git-test"));

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Header />
        <div className="overflow-scroll">
          <Suspense fallback={<CircularProgress />}>
            <Routes>
              <Route active path="/" element={<Home />}></Route>
              <Route active path="/arxtect" element={<Arxtect />}></Route>
              <Route active path="/git-test" element={<GitText />}></Route>
            </Routes>
          </Suspense>
        </div>

        <Footer />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
