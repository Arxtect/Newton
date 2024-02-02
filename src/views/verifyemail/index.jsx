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
import { verifyEmail } from "services";

const LoadingButton = styled(_LoadingButton)`
  padding: 0.6rem 0;
  background-color: var(--primary);
  font-weight: 500;

  &:hover {
    background-color: var(--primary);
    transform: translateY(-2px);
  }
`;

const verificationCodeSchema = object({
  verificationCode: string().nonempty("Verification code is required"),
});

const EmailVerificationPage = () => {
  const { verificationCode } = useParams();

  const methods = useForm({
    resolver: zodResolver(verificationCodeSchema),
  });

  const navigate = useNavigate();

  const {
    reset,
    handleSubmit,
    formState: { isSubmitSuccessful },
  } = methods;

  // Removed useVerifyEmailMutation and related state

  useEffect(() => {
    if (verificationCode) {
      reset({ verificationCode });
    }
  }, [verificationCode, reset]);

  const onSubmitHandler = async (data) => {
    try {
      const response = await verifyEmail(data.verificationCode);
      toast.success(response.message);
      navigate("/login");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      toast.error(errorMessage);
    }
  };
  const LinkItem = styled(Link)`
    text-decoration: underline;
    color: var(--primary);
  `;

  return (
    <Container maxWidth={false} sx={layoutStyles.container}>
      <Box sx={layoutStyles.box}>
        <Typography
          textAlign="center"
          component="h1"
          sx={layoutStyles.TypographySm}
        >
          Verification Email
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
              name="verificationCode"
              label={"Verification Code"}
              type="input"
            />
            <LoadingButton
              variant="contained"
              sx={{ mt: 1 }}
              fullWidth
              disableElevation
              type="submit"
            >
              {"Verification Email"}
            </LoadingButton>
            <Typography
              sx={{ fontSize: "0.9rem", mt: "1rem", textAlign: "center" }}
            >
              <LinkItem>
                <Link to="/login">{"Back Login"}</Link>
              </LinkItem>
            </Typography>
          </Box>
        </FormProvider>
      </Box>
    </Container>
  );
};

export default EmailVerificationPage;
