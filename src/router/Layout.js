// Layout.js
import React,{useEffect} from "react";
import { Header } from "@/features/header/Header";
import { Footer } from "@/features/footer/Footer";
import { Routes, Route, Outlet } from "react-router-dom";
import {refreshAuth} from "@/services"

const Layout = ({ children, withHeader, withFooter }) => {
  const refresh =async ()=>{
        await refreshAuth();
  }
  
  useEffect(()=>{
refresh()
  },[])

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
