import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { object, string } from "zod";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { forgotPassword } from "services";
import ArButton from "@/components/arButton";
import ArInput from "@/components/arInput";
import ArIcon from "@/components/arIcon";

const forgotPasswordSchema = object({
  email: string()
    .nonempty("An email address is required")
    .email("The email address is illegal"),
});

const ForgotPasswordPage = () => {
  const methods = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const [isLoading, setIsLoading] = useState(false);

  const {
    reset,
    register,
    handleSubmit,
    formState: { isSubmitSuccessful, errors },
  } = methods;

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  const onSubmitHandler = (data) => {
    setIsLoading(true);
    const { email } = data;
    forgotPassword(email)
      .then((response) => {
        toast.success(response.message);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        toast.error(errorMessage);
      });
  };

  return (
    <div className="flex items-center justify-center h-full overflow-auto bg-[#ffffff]">
      <div
        className="flex flex-col items-center justify-center bg-white p-8 rounded shadow-md"
        style={{ maxWidth: "33rem", width: "100%" }}
      >
        <h1 className="text-4xl font-bold text-center mb-6 pt-2 text-arxTheme lg:text-5xl">
          Forget Password
        </h1>
        <h2 className="text-md mb-6">
          Enter your email address and we will send you a verification email
        </h2>

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
              icon={<ArIcon name="Email" className="h-5 w-5" />}
            />
            <ArButton
              loading={isLoading}
              className="w-full bg-arxTheme text-white py-2 rounded hover:bg-primary-dark"
              type="submit"
            >
              Get The Password Reset Link
            </ArButton>
            <div className="my-4 text-center">
              <Link to="/login" className="text-arxTheme hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
