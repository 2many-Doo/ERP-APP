"use client";

import React from "react";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResetPasswordFormProps {
  formData: {
    email: string;
    password: string;
    password_confirmation: string;
    token: string;
  };
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onBackToLogin: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  formData,
  isLoading,
  onChange,
  onSubmit,
  onBackToLogin,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Нууц үг сэргээх</h2>
          <p className="text-sm text-slate-500">Имэйлээ оруулж шинэ нууц үгээ тохируулна уу.</p>
        </div>
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Нэвтрэх рүү буцах
        </button>
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="reset-email" className="block text-sm font-medium text-black mb-2">
          Имэйл хаяг
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="email"
            id="reset-email"
            name="email"
            value={formData.email}
            onChange={onChange}
            required
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg"
            placeholder="name@example.com"
          />
        </div>
      </div>

      {/* New Password Field */}
      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-2">
          Шинэ нууц үг
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="password"
            id="new-password"
            name="password"
            value={formData.password}
            onChange={onChange}
            required
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg "
            placeholder="••••••••"
          />
        </div>
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-700 mb-2">
          Нууц үг давтах
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="password"
            id="password_confirmation"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={onChange}
            required
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg "
            placeholder="••••••••"
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full py-3 text-base bg-slate-800 font-semibold" disabled={isLoading}>
        {isLoading ? "Шинэчилж байна..." : "Нууц үг шинэчлэх"}
      </Button>
    </form>
  );
};

