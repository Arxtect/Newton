/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-02-02 15:48:22
 */
import {
  loginUser,
  registerUser,
  refreshAuth,
  logoutUser,
  getMe,
} from "services";

// LoginPage.js
import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { object, string } from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { updateAccessToken } from "store";
import { useUserStore } from "store";
import * as layoutStyles from "@/styles";

const loginSchema = object({
  email: string()
    .min(1, "Need to fill in the email")
    .email("Incorrect email address"),
  password: string()
    .min(8, "The password must be at least 8 characters long")
    .max(32, "The password cannot exceed 32 characters"),
});

const LoginPage = ({ isDialog = false, handleClose }) => {
  const methods = useForm({
    resolver: zodResolver(loginSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState();

  const updateUser = useUserStore((state) => state.updateUser);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const onSubmitHandler = async (values) => {
    setIsSubmitting(true);
    setLoginError(null);
    try {
      const data = await loginUser(values);
      toast.success("You successfully logged in");
      updateAccessToken(data.access_token);
      updateUser(data.user);
      isDialog ? handleClose() : navigate(from, { replace: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "login failed";
      toast.error(errorMessage, {
        position: "top-right",
      });
      setLoginError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full overflow-auto bg-[#ffffff]">
      <div
        className="flex flex-col items-center justify-center bg-white p-8 rounded shadow-md"
        style={{ maxWidth: "33rem", width: "100%" }}
      >
        <h1 className="text-4xl font-bold text-center mb-6 pt-2 text-arxTheme lg:text-5xl ">
          Welcome to arXtect!
        </h1>
        <h2 className="text-md mb-6">Please log in to your account</h2>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmitHandler)}
            noValidate
            autoComplete="off"
            className="w-full"
          >
            <div className="mb-4">
              <label className="block text-arxTextGray text-sm font-bold mb-1 font-sans">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="input-field w-full px-3 py-2 bg-transparent border-b-2 border-gray-300 transition-colors duration-300 focus:outline-none focus:border-green-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-arxTextGray text-sm font-bold mb-1 font-sans">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="input-field w-full px-3 py-2 bg-transparent border-b-2 border-gray-300 transition-colors duration-300 focus:outline-none focus:border-green-500"
              />
            </div>
            <div className="flex justify-end mb-4">
              {!isDialog ? (
                <Link
                  to="/forgotpassword"
                  className="text-arxTheme hover:underline"
                >
                  Forgot Password?
                </Link>
              ) : (
                <a
                  href="/forgotpassword"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-arxTheme hover:underline"
                >
                  Forgot Password?
                </a>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-arxTheme text-white py-2 rounded hover:bg-primary-dark"
              disabled={isSubmitting}
            >
              Log In
            </button>
            <div className="mt-4">
              Need an account?{" "}
              {!isDialog ? (
                <Link to="/register" className="text-arxTheme hover:underline">
                  Register
                </Link>
              ) : (
                <a
                  href="/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-arxTheme hover:underline"
                >
                  Register
                </a>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default LoginPage;
