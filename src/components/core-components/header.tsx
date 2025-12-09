"use client";

import { Bell, Search, Settings, Sun, LogOut } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";

import { Button } from "../ui/button";

const Header: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Remove token and user data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Redirect to sign-in page
    router.push("/sign-in");
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-6 border-b border-slate-200 bg-white px-8 py-5">

      <div className="flex items-center gap-3 rounded-2xl mr-auto  py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-black-500 text-black text-sm font-semibold">
            MN
          </div>
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-sm font-semibold text-slate-800">Мөнх-Эрдэнэ</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
        </div>
        
      <div className="hidden w-56 items-center gap-3 mr-auto rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 transition-all duration-300 focus-within:w-[28rem] focus-within:border-blue-300 focus-within:bg-white focus-within:shadow-lg lg:flex">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="search"
          placeholder="Хайлт хийх..."
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 transition-all duration-300"
        />
      </div>

      <div className="flex items-center gap-2">
        <HeaderIconButton icon={Sun} label="Гэрэл" />
        <HeaderIconButton icon={Settings} label="Тохиргоо" />
        <HeaderIconButton icon={Bell} label="Мэдэгдэл" badge={3} />
        <Button
          type="button"
          onClick={handleLogout}
          variant="outline"
          className="h-11 rounded-2xl border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 px-4 gap-2"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden sm:inline">Гарах</span>
        </Button>
      </div>
    </header>
  );
};

const HeaderIconButton: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}> = ({ icon: Icon, label, badge }) => (
  <Button
    type="button"
    variant="outline"
    size="icon"
    className="relative h-11 w-11 rounded-2xl border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
    aria-label={label}
  >
    <Icon className="h-5 w-5" />
    {badge && badge > 0 ? (
      <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
        {badge}
      </span>
    ) : null}
  </Button>
);

export default Header;