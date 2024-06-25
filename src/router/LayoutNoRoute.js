// LayoutNoRoute.js
import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/useHooks";

const LayoutNoRoute = (props) => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

export default LayoutNoRoute;
