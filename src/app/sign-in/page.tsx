"use client";

import React from "react";
import { login, getAuthUser, requestPasswordReset } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { toast } from "sonner";

const SignInPage = () => {
  const router = useRouter();
  const [authMode, setAuthMode] = React.useState<"login" | "reset">("login");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });
  const [resetForm, setResetForm] = React.useState({
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      // API key is sent in headers
      const response = await login(formData.email, formData.password);
      
      // Check for network/connection errors
      if (response.status === 0) {
        const message = response.error || "Сервертэй холбогдох боломжгүй. Интернэт холболтоо шалгана уу.";
        setError(message);
        toast.error(message);
        return;
      }
      
      // Check for error
      if (response.error) {
        const message = response.error || response.message || "Нэвтрэхэд алдаа гарлаа";
        setError(message);
        toast.error(message);
        return;
      }

      // Check response status
      if (response.status !== 200 && response.status !== 201) {
        const message = `Алдаа: HTTP ${response.status}`;
        setError(message);
        toast.error(message);
        return;
      }

      // Check if response.data is a string (IP address or other)
      if (typeof response.data === "string") {
        const message = `${response.data}.`;
        setError(message);
        toast.error(message);
        return;
      }
      
      // Check for token in response (try multiple possible locations)
      const token = 
        response.data?.token || 
        response.data?.access_token || 
        response.data?.data?.token ||
        response.data?.data?.access_token ||
        (typeof response.data === "object" && response.data !== null ? (response.data as any).token : null);
      
      if (token && typeof token === "string") {
        // Save token to localStorage
        localStorage.setItem("token", token);
        
        // Fetch current authenticated user (with roles/permissions) using token
        try {
          const userResp = await getAuthUser();
          const authUser = userResp?.data?.data || userResp?.data || null;
          if (authUser) {
            localStorage.setItem("user", JSON.stringify(authUser));
          } else {
            // No user data returned; keep going
          }
        } catch (err) {
          // Ignore fetch error, user stays unauthenticated
        }

        // Redirect to main page
        router.push("/main");
      } else {
        const message = "Token хүлээн авсангүй. Response structure: " + JSON.stringify(response.data).substring(0, 300);
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      const message = "Алдаа гарлаа. Дахин оролдоно уу.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResetForm({
      ...resetForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    const email = resetForm.email.trim();
    if (!email) {
      const message = "Имэйлээ оруулна уу.";
      setError(message);
      toast.error(message);
      return;
    }

    setIsLoading(true);
    try {
      const response = await requestPasswordReset(email);

      if (response.status === 0) {
        const message = response.error || "Сервертэй холбогдох боломжгүй. Интернет холболтоо шалгана уу.";
        setError(message);
        toast.error(message);
        return;
      }

      if (response.error || ![200, 201, 202].includes(response.status)) {
        const message = response.error || response.message || `Алдаа: HTTP ${response.status}`;
        setError(message);
        toast.error(message);
        return;
      }

      const message =
        response.message ||
        (typeof response.data === "string"
          ? response.data
          : "Нууц үг сэргээх холбоос таны имэйл рүү илгээгдлээ. Шуудангаа шалгана уу.");
      setSuccessMessage(message);
      toast.success(message);

      // Prefill email for login
      setFormData((prev) => ({
        ...prev,
        email,
        password: "",
      }));
      setResetForm({
        email: "",
      });
    } catch (err) {
      const message = "Нууц үг сэргээх хүсэлт илгээхэд алдаа гарлаа. Дахин оролдоно уу.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-500 via-white to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center ">
          <div className="flex justify-center py-6">
        <Image
          src="/Sutailogo.jpg"
          alt="Сутайн буянт лого"
          width={160}
          height={160}
          priority
          className="h-28 w-28 rounded-2xl object-cover"
        />
      </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Сутайн буянт
          </h1>
          <p className="text-slate-500">
            Энэ систем нь Сутайн буянт захын дотоод систем юм.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          {/* Form */}
          {authMode === "login" ? (
            <LoginForm
              formData={formData}
              isLoading={isLoading}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onForgotPassword={() => {
                setAuthMode("reset");
                setError(null);
                setSuccessMessage(null);
              }}
            />
          ) : (
            <ResetPasswordForm
              formData={resetForm}
              isLoading={isLoading}
              onChange={handleResetChange}
              onSubmit={handleResetSubmit}
              onBackToLogin={() => {
                setAuthMode("login");
                setError(null);
                setSuccessMessage(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
