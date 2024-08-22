/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
// Layout.js
import React, { useEffect } from "react";
import { Header } from "@/features/header/Header";
import { Footer } from "@/features/footer/Footer";
import { Routes, Route, Outlet } from "react-router-dom";
import { getMe } from "@/services";
import { useUserStore } from "store";

const Layout = ({ children, withHeader, withFooter }) => {
  const refresh = async () => {
    const { data: userData } = await getMe();
    updateUser(userData.user);
  };
  const { updateUser } = useUserStore((state) => ({
    updateUser: state.updateUser,
  }));

  useEffect(() => {
    refresh();
  }, []);

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
