import React, { Suspense } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CircularProgress as Nprogress } from "@mui/material";
import config from "./config";

const renderRoutes = (routes) => {
  if (!Array.isArray(routes)) {
    return null;
  }

  return (
    <Routes>
      {routes.map((route, index) => {
        const Component = route.component;
        console.log(route, "route");
        if (route.redirect) {
          console.log(route.redirect, "route.redirect");
          return (
            <Route
              key={route.path || index}
              path={route.path}
              element={<Navigate replace to={route.redirect} />}
            />
          );
        }
        return (
          <Route
            key={route.path || index}
            path={route.path}
            element={
              <Suspense fallback={<Nprogress />}>
                {Component && <Component route={route} />}
              </Suspense>
            }
          >
            {route.childRoutes &&
              route.childRoutes.map((item) => {
                if (item.redirect) {
                  return (
                    <Route
                      key={item.path || index}
                      path={item.path}
                      element={<Navigate replace to={item.redirect} />}
                    />
                  );
                }
                return (
                  <Route
                    key={item.path}
                    path={item.path}
                    exact={item.exact}
                    element={item.component && <item.component />}
                  ></Route>
                );
              })}
          </Route>
        );
      })}
    </Routes>
  );
};

const AppRouter = () => {
  return <Router>{renderRoutes(config)}</Router>;
};

export default AppRouter;
