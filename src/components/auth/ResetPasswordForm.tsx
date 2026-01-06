"use client";

import React from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResetPasswordFormProps {
  formData: {
    email: string;
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
          <p className="text-sm text-slate-500">Имэйлээ оруулбал сэргээх холбоос илгээнэ.</p>
        </div>
      </div>

      {/* Email Field */}
      <div>
        <div className="flex items-center justify-between">
        <label htmlFor="reset-email" className="block text-sm font-medium text-black mb-2">
          Имэйл хаяг
        </label>
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
          Нэвтрэх рүү буцах
        </button>
          </div>
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
        <p className="mt-2 text-xs text-slate-500">
          Сэргээх холбоос 1-2 минутын дотор ирэхгүй бол spam хавтас шалгана уу.
        </p>
        
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full py-3 text-base bg-slate-800 font-semibold" disabled={isLoading}>
        {isLoading ? "Илгээж байна..." : "Имэйл илгээх"}
      </Button>
    </form>
  );
};

