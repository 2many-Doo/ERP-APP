"use client";

import React from "react";
import { Permission } from "@/hooks/usePermissionManagement";

interface PermissionStatisticsProps {
  permissions: Permission[];
  loading: boolean;
}

export const PermissionStatistics: React.FC<PermissionStatisticsProps> = ({
  permissions,
  loading,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="animate-pulse">
            <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
            <div className="h-8 w-16 bg-slate-200 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
            <div className="h-8 w-16 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 mb-2">Нийт эрх</p>
          <p className="text-3xl font-bold text-blue-600">{permissions.length}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600 mb-2">Нийт зөвшөөрөл</p>
          <p className="text-3xl font-bold text-green-600">
            {permissions.reduce((sum, perm) => sum + perm.permissions.length, 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

