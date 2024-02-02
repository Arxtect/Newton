// Layout.js
import React from "react";
import { Header } from "@/features/header/Header";
import { Footer } from "@/features/footer/Footer";

const Layout = ({ children, withHeader, withFooter }) => {
  return (
    <>
      {withHeader && <Header />}
      {children}
      {/* withFooter && <Footer /> Uncomment if Footer is needed */}
    </>
  );
};

export default Layout;
