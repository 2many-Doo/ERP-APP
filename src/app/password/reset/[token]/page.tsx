"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updateForgotPassword } from "@/lib/api";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const ResetPasswordPage = ({ params }: { params: Promise<{ token: string }> }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";
  const resolvedParams = React.use(params);
  const token = resolvedParams?.token || "";

  const [password, setPassword] = React.useState("");
  const [passwordConfirmation, setPasswordConfirmation] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!emailFromQuery) {
      const message = "Имэйл параметр алга байна. Холбоосоо дахин шалгана уу.";
      setError(message);
      toast.error(message);
      return;
    }

    if (!token) {
      const message = "Token алга байна. Холбоосоо дахин шалгана уу.";
      setError(message);
      toast.error(message);
      return;
    }

    if (!password || !passwordConfirmation) {
      const message = "Шинэ нууц үг болон давталтыг бөглөнө үү.";
      setError(message);
      toast.error(message);
      return;
    }

    if (password !== passwordConfirmation) {
      const message = "Нууц үг хоорондоо таарахгүй байна.";
      setError(message);
      toast.error(message);
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateForgotPassword({
        email: emailFromQuery,
        password,
        password_confirmation: passwordConfirmation,
        token,
      });

      if (response.status === 0) {
        const message = response.error || "Сервертэй холбогдох боломжгүй. Интернет холболтоо шалгана уу.";
        setError(message);
        toast.error(message);
        return;
      }

      if (response.error || ![200, 201].includes(response.status)) {
        const message = response.error || response.message || `Алдаа: HTTP ${response.status}`;
        setError(message);
        toast.error(message);
        return;
      }

      const message =
        response.message ||
        (typeof response.data === "string"
          ? response.data
          : "Нууц үг амжилттай шинэчлэгдлээ. Шинэ нууц үгээрээ нэвтэрнэ үү.");
      setSuccessMessage(message);
      toast.success(message);

      setTimeout(() => {
        router.push("/sign-in");
      }, 800);
    } catch (err) {
      const message = "Нууц үг шинэчлэхэд алдаа гарлаа. Дахин оролдоно уу.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-500 via-white to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Нууц үг шинэчлэх</h1>
          <p className="text-sm text-slate-500 mt-1">
            Имэйл: <span className="font-medium text-slate-700">{emailFromQuery || "—"}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Шинэ нууц үг
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 pr-12 py-3 border border-slate-300 rounded-lg"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-700 mb-2">
              Нууц үг давтах
            </label>
            <div className="relative">
              <input
                id="password_confirmation"
                name="password_confirmation"
                type={showPasswordConfirmation ? "text" : "password"}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                className="w-full px-3 pr-12 py-3 border border-slate-300 rounded-lg"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirmation((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                aria-label={showPasswordConfirmation ? "Hide password confirmation" : "Show password confirmation"}
              >
                {showPasswordConfirmation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-base bg-slate-800 text-white rounded-lg font-semibold disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? "Шинэчилж байна..." : "Нууц үг шинэчлэх"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

