// Layout.js
import React from "react";
import { Header } from "@/features/header/Header";
import { Footer } from "@/features/footer/Footer";
import { Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/useHooks"

const Layout = ({ children, withHeader, withFooter }) => {
  return (
    <AuthProvider>
      <Header />
      <main className="main overflow-auto h-[calc(100vh-64px)]">
        <Outlet />
      </main>
      {/* withFooter && <Footer /> Uncomment if Footer is needed */}
    </AuthProvider>
  );
};

export default Layout;
