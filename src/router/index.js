import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "./Layout.js";
import { lazy } from "react";

const Home = lazy(() => import("@/views/home"));
const Arxtect = lazy(() => import("@//views/arxtect"));
const GitText = lazy(() => import("@//views/git-test"));
const Login = lazy(() => import("@//views/login"));
const Register = lazy(() => import("@//views/register"));
const Verifyemail = lazy(() => import("@//views/verifyemail"));
const ResetPasswordPage = lazy(() => import("@//views/resetPasswordPage"));
const ForgotPassword = lazy(() => import("@//views/forgotPassword"));
const Einstein = lazy(() => import("@//views/einstein"));

// Routes that require a header (and possibly a footer)
export const headerRoutes = [
  { path: "/", component: Home, withHeader: true },
  { path: "/arxtect", component: Arxtect, withHeader: true },
  { path: "/einstein", component: Einstein, withHeader: true },
  // { path: "/git-test", component: GitText, withHeader: true },
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
