import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { object, string } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUser } from "services";
import ArButton from "@/components/arButton";
import ArInput from "@/components/arInput";
import emailSvg from "@/assets/website/email.svg";
import passwordSvg from "@/assets/website/password.svg";
import usernameSvg from "@/assets/website/username.svg";

const registerSchema = object({
  name: string().min(1, "Full username required").max(100),
  email: string()
    .min(1, "Need to fill in the mailbox")
    .email("Incorrect email address"),
  password: string()
    .min(1, "Need to fill in the password")
    .min(8, "Passwords are longer than eight characters")
    .max(32, "Passwords should be shorter than 32 characters"),
  password_confirm: string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.password_confirm, {
  path: ["password_confirm"],
  message: "Password mismatch",
});

const RegisterPage = () => {
  const methods = useForm({
    resolver: zodResolver(registerSchema),
  });

  const navigate = useNavigate();
  const {
    reset,
    register,
    handleSubmit,
    formState: { isSubmitSuccessful, errors },
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
    <div className="flex items-center justify-center h-full overflow-auto bg-[#ffffff]">
      <div
        className="flex flex-col items-center justify-center bg-white p-8 rounded shadow-md"
        style={{ maxWidth: "33rem", width: "100%" }}
      >
        <h1 className="text-4xl font-bold text-center mb-6 pt-2 text-arxTheme lg:text-5xl">
          Welcome to arXtect!
        </h1>
        <h2 className="text-md mb-6">Sign up for your account!</h2>

        <FormProvider {...methods}>
          <form
            noValidate
            autoComplete="off"
            className="w-full"
            onSubmit={handleSubmit(onSubmitHandler)}
          >
            <ArInput
              label="Username"
              type="input"
              name="name"
              placeholder="Email"
              register={register}
              errors={errors}
              icon={usernameSvg}
            />
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
            <ArInput
              label="Confirm Password"
              type="password"
              name="password_confirm"
              placeholder="Confirm Password"
              register={register}
              errors={errors}
              icon={passwordSvg}
            />
            <div className="my-4">
              Have an account already?
              <Link to="/login" className="text-arxTheme hover:underline">
                Login Here
              </Link>
            </div>
            <ArButton
              loading={isLoading}
              className="w-full bg-arxTheme text-white py-2 rounded hover:bg-primary-dark"
              type="submit"
            >
              Register
            </ArButton>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default RegisterPage;
