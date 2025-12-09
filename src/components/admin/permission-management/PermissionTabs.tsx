"use client";

import React from "react";

interface PermissionTabsProps {
  activeTab: "roles" | "permissions";
  onTabChange: (tab: "roles" | "permissions") => void;
}

export const PermissionTabs: React.FC<PermissionTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="border-b border-slate-200">
      <nav className="flex gap-2">
        <button
          onClick={() => onTabChange("roles")}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "roles"
              ? "border-gray-600 text-black"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Эрхүүд
        </button>
        <button
          onClick={() => onTabChange("permissions")}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "permissions"
              ? "border-gray-600 text-balck"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Зөвшөөрлүүд
        </button>
      </nav>
    </div>
  );
};

