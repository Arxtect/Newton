import { Box, Container, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FormProvider, useForm } from "react-hook-form";
import { object, string } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/FormInput";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingButton as _LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import * as layoutStyles from "@/styles";
import { resetPassword } from "services"; // Make sure to update the import path to where your actual service is

const LoadingButton = styled(_LoadingButton)`
  padding: 0.6rem 0;
  background-color: var(--primary);
  font-weight: 500;

  &:hover {
    background-color: var(--primary);
    transform: translateY(-2px);
  }
`;

const resetPasswordSchema = object({
  password: string()
    .nonempty("Need to fill in the password")
    .min(8, "Password must be more than 8 characters"),
  password_confirm: string().nonempty("Please confirm your password"),
}).refine((data) => data.password === data.password_confirm, {
  message: "Password mismatch",
  path: ["password_confirm"],
});

const ResetPasswordPage = () => {
  const { resetToken } = useParams();

  const methods = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const navigate = useNavigate();

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

  const onSubmitHandler = (values) => {
    resetPassword({ ...values, resetToken: resetToken })
      .then(() => {
        navigate("/login");
        toast.success("Password updated successfully, please login", {
          position: "top-right",
        });
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        toast.error(errorMessage, {
          position: "top-right",
        });
      });
  };

  return (
    <Container maxWidth={false} sx={layoutStyles.container}>
      <Box sx={layoutStyles.box}>
        <Typography
          textAlign="center"
          component="h2"
          sx={layoutStyles.TypographySm}
        >
          Reset Password
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
          Please enter a new password
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
            <FormInput name="password" label="password" type="password" />
            <FormInput
              name="password_confirm"
              label="confirm password"
              type="password"
            />

            <LoadingButton
              variant="contained"
              sx={{ mt: 1 }}
              fullWidth
              disableElevation
              type="submit"
            >
              Reset Password
            </LoadingButton>

            <Typography
              sx={{ fontSize: "0.9rem", mt: "1rem", textAlign: "center" }}
            >
              <Link
                to="/login"
                style={{ textDecoration: "underline", color: "-webkit-link" }}
              >
                Back Login
              </Link>
            </Typography>
          </Box>
        </FormProvider>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;
