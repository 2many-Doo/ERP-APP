"use client";

import React from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoginFormProps {
  formData: {
    email: string;
    password: string;
  };
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  formData,
  isLoading,
  onChange,
  onSubmit,
  onForgotPassword,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
          Имэйл хаяг
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            required
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg"
            placeholder="name@example.com"
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
          Нууц үг
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={onChange}
            required
            className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg "
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Forgot Password */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Нууц үг мартсан уу?
        </button>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full py-3 text-base bg-slate-800 font-semibold" disabled={isLoading}>
        {isLoading ? "Нэвтэрч байна..." : "Нэвтрэх"}
      </Button>
    </form>
  );
};

