import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { object, string } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "services";
import { Link } from "react-router-dom";
import ArButton from "@/components/arButton";
import ArInput from "@/components/arInput";
import passwordSvg from "@/assets/website/password.svg";

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
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const navigate = useNavigate();

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

  const onSubmitHandler = (values) => {
    setIsLoading(true);
    resetPassword({ ...values, resetToken: resetToken })
      .then(() => {
        navigate("/login");
        toast.success("Password updated successfully, please login", {
          position: "top-right",
        });
        setIsLoading(false);
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        setIsLoading(false);
        toast.error(errorMessage, {
          position: "top-right",
        });
      });
  };

  return (
    <div className="flex items-center justify-center h-full overflow-auto bg-[#ffffff]">
      <div
        className="flex flex-col items-center justify-center bg-white p-8 rounded shadow-md"
        style={{ maxWidth: "33rem", width: "100%" }}
      >
        <h1 className="text-4xl font-bold text-center mb-6 pt-2 text-arxTheme lg:text-5xl">
          Reset Password
        </h1>
        <h2 className="text-md mb-6 font-sans">Please enter a new password</h2>

        <FormProvider {...methods}>
          <form
            noValidate
            autoComplete="off"
            className="w-full"
            onSubmit={handleSubmit(onSubmitHandler)}
          >
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
            <div className="my-8"></div>
            <ArButton
              loading={isLoading}
              className="w-full bg-arxTheme text-white py-2 rounded hover:bg-primary-dark"
              type="submit"
            >
              Reset Password
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

export default ResetPasswordPage;
