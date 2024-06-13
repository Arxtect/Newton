/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { object, string } from "zod";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { verifyEmail } from "services";
import ArButton from "@/components/arButton";
import ArInput from "@/components/arInput";
import codeSvg from "@/assets/website/code.svg";

const verificationCodeSchema = object({
  verificationCode: string().nonempty("Verification code is required"),
});

const EmailVerificationPage = () => {
  const { verificationCode } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm({
    resolver: zodResolver(verificationCodeSchema),
  });

  const navigate = useNavigate();

  const {
    reset,
    register,
    handleSubmit,
    formState: { isSubmitSuccessful, errors },
  } = methods;

  useEffect(() => {
    if (verificationCode) {
      reset({ verificationCode });
    }
  }, [verificationCode, reset]);

  const onSubmitHandler = async (data) => {
    setIsLoading(true);
    try {
      const response = await verifyEmail(data.verificationCode);
      toast.success(response.message);
      navigate("/login");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      toast.error(errorMessage);
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
          Verification Email
        </h1>

        <FormProvider {...methods}>
          <form
            noValidate
            autoComplete="off"
            className="w-full"
            onSubmit={handleSubmit(onSubmitHandler)}
          >
            <ArInput
              label="Verification Code"
              type="input"
              name="verificationCode"
              placeholder="Verification Code"
              register={register}
              errors={errors}
              icon={codeSvg}
            />
            <ArButton
              loading={isLoading}
              className="w-full bg-arxTheme text-white py-2 rounded hover:bg-primary-dark"
              type="submit"
            >
              Verification Email
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

export default EmailVerificationPage;
