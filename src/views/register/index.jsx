import React, { useState, useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { object, string, TypeOf } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as layoutStyles from "@/styles";
import FormInput from "@/components/FormInput";
import { LoadingButton as _LoadingButton } from "@mui/lab";

import { registerUser } from "services";

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
  color: var(--primary);
  &:hover {
    text-decoration: underline;
  }
`;

const registerSchema = object({
  name: string().min(1, "Full username required").max(100),
  email: string()
    .min(1, "Need to fill in the mailbox")
    .email("Incorrect email address"),
  password: string()
    .min(1, "Need to fill in the password")
    .min(8, "Passwords are longer than eight characters")
    .max(32, "Passwords should be shorter than 32 characters"),
  passwordConfirm: string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.passwordConfirm, {
  path: ["passwordConfirm"],
  message: "Password mismatch",
});

const RegisterPage = () => {
  const methods = useForm({
    resolver: zodResolver(registerSchema),
  });

  const navigate = useNavigate();

  const {
    reset,
    handleSubmit,
    formState: { isSubmitSuccessful },
  } = methods;

  const [isLoading, setIsLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful]);

  const onSubmitHandler = async (values) => {
    setIsLoading(true);
    setRegistrationError(null);
    try {
      const response = await registerUser(values);
      toast.success(response.message);
      navigate("/verifyemail");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      toast.error(errorMessage, {
        position: "top-right",
      });
      setRegistrationError(errorMessage);
    } finally {
      setIsLoading(false);
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
        <Typography component="h2" sx={{ mb: 2 }}>
          Sign up for your account!
        </Typography>

        <FormProvider {...methods}>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmitHandler)}
            noValidate
            autoComplete="off"
            maxWidth="27rem"
            width="100%"
            sx={layoutStyles.formBox}
          >
            <FormInput name="name" label={"username"} type="input" />
            <FormInput name="email" label="email" type="email" />
            <FormInput name="password" label="password" type="password" />
            <FormInput
              name="passwordConfirm"
              label={"confirm password"}
              type="password"
            />
            <Typography sx={{ fontSize: "0.9rem", mb: "1rem" }}>
              Have an account already?
              <LinkItem to="/login">Login Here</LinkItem>
            </Typography>

            <LoadingButton
              variant="contained"
              sx={{ mt: 1 }}
              fullWidth
              disableElevation
              type="submit"
              loading={isLoading}
            >
              {"register"}
            </LoadingButton>
          </Box>
        </FormProvider>
      </Box>
    </Container>
  );
};

export default RegisterPage;
