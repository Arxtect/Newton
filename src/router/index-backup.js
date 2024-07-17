/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "./Layout.js";
import { lazy } from "react";

const Home = lazy(() => import("@/views/home"));
const Login = lazy(() => import("@/views/login"));
const Register = lazy(() => import("@/views/register"));
const Verifyemail = lazy(() => import("@/views/verifyemail"));
const ResetPasswordPage = lazy(() => import("@/views/resetPasswordPage"));
const ForgotPassword = lazy(() => import("@/views/forgotPassword"));
const Einstein = lazy(() => import("@/views/einstein"));
const DocumentDetails = lazy(() => import("@/views/documentDetails"));

// Routes that require a header (and possibly a footer)
export const headerRoutes = [
  { path: "/", component: Home, withHeader: true },
  { path: "/einstein", component: Einstein, withHeader: true },
  { path: "/documentdetails", component: DocumentDetails, withHeader: true },
  // Add more routes as needed
];

// Routes that do not require a header or footer
export const noHeaderRoutes = [
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/verifyemail", component: Verifyemail },
  { path: "/resetpassword", component: ResetPasswordPage },
  { path: "/forgotpassword", component: ForgotPassword },
  // Add more routes as needed
];
const RouterComponent = () => {
  return (
    <Routes>
      {headerRoutes.map(({ path, component: Component, withHeader }) => (
        <Route
          key={path}
          path={path}
          element={
            <Layout withHeader={withHeader}>
              <Component />
            </Layout>
          }
        />
      ))}
      {noHeaderRoutes.map(({ path, component: Component }) => (
        <Route
          key={path}
          path={path}
          element={
            <Layout>
              <Component />
            </Layout>
          }
        />
      ))}
    </Routes>
  );
};

export default RouterComponent;
