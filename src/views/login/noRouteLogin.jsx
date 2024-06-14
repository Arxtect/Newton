

// LoginPage.js
import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { object, string } from "zod";
import { toast } from "react-toastify";
import { updateAccessToken } from "store";
import {
  loginUser,
} from "@/services";
import { useUserStore } from "store";
import emailSvg from "@/assets/website/email.svg";
import passwordSvg from "@/assets/website/password.svg";
import ArButton from "@/components/arButton";
import ArInput from "@/components/arInput";

const loginSchema = object({
  email: string()
    .min(1, "Need to fill in the email")
    .email("Incorrect email address"),
  password: string()
    .min(8, "The password must be at least 8 characters long")
    .max(32, "The password cannot exceed 32 characters"),
});

const NoRouteLogin = ({ handleClose }) => {
  const methods = useForm({
    resolver: zodResolver(loginSchema),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState();

  const updateUser = useUserStore((state) => state.updateUser);

  const handleRouteClick = (href) => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const onSubmitHandler = async (values) => {
    setIsSubmitting(true);
    setLoginError(null);
    try {
      const data = await loginUser(values);
      toast.success("You successfully logged in");
      updateAccessToken(data.access_token);
      updateUser(data.user);

      setTimeout(() => {
        handleClose();
      }, [0])
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

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
            noValidate
            autoComplete="off"
            className="w-full"
            onSubmit={handleSubmit(onSubmitHandler)}
          >
            <ArInput
              label="Email"
              type="email"
              name="email"
              placeholder="Email"
              register={register}
              errors={errors}
              icon={emailSvg}
            />
            <ArInput
              label="Password"
              type="password"
              name="password"
              placeholder="Password"
              register={register}
              errors={errors}
              icon={passwordSvg}
            />

            <div className="flex justify-end mb-4">
              <a
                href="/project/#/forgotpassword"
                target="_blank"
                rel="noopener noreferrer"
                className="text-arxTheme hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <ArButton
              loading={isSubmitting}
              className="w-full bg-arxTheme text-white py-2 rounded hover:bg-primary-dark"
              type="submit"
            >
              Log In
            </ArButton>
            <div className="mt-4">
              Need an account?{" "}
              <a
                href="/project/#/register"
                target="_blank"
                rel="noopener noreferrer"
                className="text-arxTheme hover:underline"
              >
                Register
              </a>

            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default NoRouteLogin;
