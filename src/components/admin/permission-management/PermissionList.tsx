"use client";

import React from "react";
import { Key } from "lucide-react";

interface PermissionListProps {
  permissions: string[];
  roleId: number;
  roleName: string;
}

export const PermissionList: React.FC<PermissionListProps> = ({
  permissions,
}) => {
  const MAX_VISIBLE = 3;
  const visiblePermissions = permissions.slice(0, MAX_VISIBLE);
  const hasMore = permissions.length > MAX_VISIBLE;

  if (permissions.length === 0) {
    return <span className="text-sm text-slate-400">Зөвшөөрөлгүй</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {visiblePermissions.map((perm, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gray-300 text-black"
        >
          <Key className="h-3 w-3" />
          {perm}
        </span>
      ))}
      {hasMore && (
        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-normal text-slate-400">
          +{permissions.length - MAX_VISIBLE}
        </span>
      )}
    </div>
  );
};

