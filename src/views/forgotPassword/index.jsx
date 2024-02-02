import { Box, Container, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useForm, FormProvider } from "react-hook-form";
import { object, string } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/FormInput";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { LoadingButton as _LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";
import * as layoutStyles from "@/styles";
import { forgotPassword } from "services"; // Import the service

const LoadingButton = styled(_LoadingButton)`
  padding: 0.6rem 0;
  background-color: var(--primary);
  font-weight: 500;

  &:hover {
    background-color: var(--primary);
    transform: translateY(-2px);
  }
`;

const forgotPasswordSchema = object({
  email: string()
    .nonempty("An email address is required")
    .email("The email address is illegal"),
});

const ForgotPasswordPage = () => {
  const methods = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitSuccessful },
  } = methods;

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  const onSubmitHandler = (data) => {
    const { email } = data;
    forgotPassword(email)
      .then((response) => {
        // Handle success
        toast.success(response.data.message);
      })
      .catch((error) => {
        // Handle error
        toast.error(error.response?.data?.message || "An error occurred");
      });
  };

  return (
    <Container maxWidth={false} sx={layoutStyles.container}>
      <Box sx={layoutStyles.box}>
        <Typography
          textAlign="center"
          component="h1"
          sx={layoutStyles.TypographySm}
        >
          Forget Password
        </Typography>
        <Typography
          sx={{
            fontSize: 15,
            width: "100%",
            textAlign: "center",
            mb: "1rem",
            color: "var(--primary)",
          }}
        >
          Enter your email address and we will send you a verification email
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
            <FormInput
              name="email"
              label="email"
              type="email"
              style={{ color: "var(--primary)" }}
            />
            <LoadingButton
              variant="contained"
              sx={{ mt: 1 }}
              fullWidth
              disableElevation
              type="submit"
            >
              Get the password reset link
            </LoadingButton>

            <Typography
              sx={{ fontSize: "0.9rem", mt: "1rem", textAlign: "center" }}
            >
              <Link to="/login" style={{ color: "var(--primary)" }}>
                Back Login
              </Link>
            </Typography>
          </Box>
        </FormProvider>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;
