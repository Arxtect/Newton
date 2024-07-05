/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-02-06 14:10:44
 */
import React, { lazy } from "react";
import Layout from "./Layout";

const routerConfig = [
  { path: "/home", name: "home", component: "home" },
  // {
  //   path: "/arxtect",
  //   name: "/arxtect",
  //   component: "arxtect",
  //   exact: true,
  // },
  {
    path: "/project",
    name: "/project",
    component: "project",
    exact: true,
  },
  { path: "/einstein", name: "einstein", component: "einstein" },
  {
    path: "/documentdetails",
    name: "/documentdetails",
    component: "documentDetails",
    exact: true,
  },
  { path: "/git-test", name: "git-test", component: "git-test", exact: true },
  { path: "/", redirect: "/project", exact: true },
];

const noHeaderRoutes = [
  { path: "/login", name: "login", component: "login" },
  { path: "/newton", name: "newton", component: "layout" },
  {
    path: "/register",
    name: "register",
    component: "register",
  },
  {
    path: "/verifyemail/:verifyCode",
    name: "verifyemail",
    component: "verifyemail",
  },
  {
    path: "/verifyemail",
    name: "verifyemail",
    component: "verifyemail",
  },
  {
    path: "/resetpassword/:resetToken",
    name: "resetPasswordPage",
    component: "resetPasswordPage",
  },
  {
    path: "/forgotpassword",
    name: "forgotPassword",
    component: "forgotPassword",
  },
];

const renderChild = (routerConfig, config = []) => {
  if (!Array.isArray(routerConfig)) {
    return null;
  }
  routerConfig.map((item) => {
    if (item.childRoutes) {
      config = renderChild(item.childRoutes, config);
    }
    config.push({
      path: item.path,
      name: item?.name && item.name,
      exact: item.exact && item.exact,
      redirect: item.redirect && item.redirect,
      component:
        item.component && lazy(() => import(`@/views/${item.component}`)),
      meta: item.name && { title: item.name },
    });
  });

  return config;
};

const config = [
  {
    path: "/",
    component: Layout,
    childRoutes: [...renderChild(routerConfig)],
  },
  ...renderChild(noHeaderRoutes),
];

export default config;
