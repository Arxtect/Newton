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
import { Box, Container, Typography, Link as MuiLink } from "@mui/material";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { styled } from "@mui/material/styles";
import { zodResolver } from "@hookform/resolvers/zod";
import { object, string } from "zod";
import FormInput from "@/components/FormInput";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LoadingButton as _LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";
import { setCookie } from "@/util";
import { useUserStore } from "store";
import * as layoutStyles from "@/styles";

const LoadingButton = styled(_LoadingButton)`
  padding: 0.6rem 0;
  background-color: var(--primary);
  font-weight: 500;

  &:hover {
    background-color: var(--primary);
    transform: translateY(-2px);
  }
`;

const LinkItem = styled(Link)`
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const loginSchema = object({
  email: string()
    .min(1, "Need to fill in the email")
    .email("Incorrect email address"),
  password: string()
    .min(8, "The password must be at least 8 characters long")
    .max(32, "The password cannot exceed 32 characters"),
});

const LoginPage = () => {
  const methods = useForm({
    resolver: zodResolver(loginSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState();

  const updateUser = useUserStore((state) => state.updateUser);
  const navigate = useNavigate();
  const location = useLocation();
  // 从 location state 中获取重定向前的路径，如果没有则默认为首页 "/"
  const from = location.state?.from?.pathname || "/";

  const onSubmitHandler = async (values) => {
    setIsSubmitting(true);
    setLoginError(null);
    try {
      const data = await loginUser(values);
      toast.success("You successfully logged in");
      setCookie("mojolicious", data.access_token, 3000000);
      updateUser(data.user);
      navigate(from, { replace: true });
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
    <Container maxWidth={false} sx={layoutStyles.container}>
      <Box sx={layoutStyles.box}>
        <Typography
          textAlign="center"
          component="h1"
          sx={layoutStyles.TypographySm}
        >
          Welcome to arXtect!
        </Typography>
        <Typography variant="body1" component="h2" sx={{ mb: 2 }}>
          Please log in to your account
        </Typography>

        <FormProvider {...methods}>
          <Box
            component="form"
            onSubmit={methods.handleSubmit(onSubmitHandler)}
            noValidate
            autoComplete="off"
            maxWidth="27rem"
            width="100%"
            sx={layoutStyles.formBox}
          >
            <FormInput name="email" label="Email" type="email" />
            <FormInput name="password" label="Password" type="password" />

            <Typography
              sx={{ fontSize: "0.9rem", mb: "1rem", textAlign: "right" }}
            >
              <Link to="/forgotpassword" style={{ color: "var(--primary)" }}>
                Forgot Password?
              </Link>
            </Typography>

            <LoadingButton
              variant="contained"
              sx={{ mt: 1 }}
              fullWidth
              disableElevation
              type="submit"
              loading={isSubmitting}
            >
              Log In
            </LoadingButton>

            <Typography sx={{ fontSize: "0.9rem", mt: "1rem" }}>
              Need an account?{" "}
              <Link to="/register" style={{ color: "var(--primary)" }}>
                Register
              </Link>
            </Typography>
          </Box>
        </FormProvider>
      </Box>
    </Container>
  );
};

export default LoginPage;
