// Layout.js
import React from "react";
import { Header } from "@/features/header/Header";
import { Footer } from "@/features/footer/Footer";
import { Routes, Route, Outlet } from "react-router-dom";

const Layout = ({ children, withHeader, withFooter }) => {
  return (
    <React.Fragment>
      <Header />
      <main className="main overflow-auto h-[calc(100vh-64px)]">
        <Outlet />
      </main>
      {/* withFooter && <Footer /> Uncomment if Footer is needed */}
    </React.Fragment>
  );
};

export default Layout;
