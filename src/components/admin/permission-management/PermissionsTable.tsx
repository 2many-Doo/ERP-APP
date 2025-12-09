"use client";

import React from "react";
import { Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Permission } from "@/hooks/usePermissionManagement";
import { PermissionList } from "./PermissionList";

interface PermissionsTableProps {
  permissions: Permission[];
  loading: boolean;
  onViewPermissions: (roleId: number) => void;
  onEditPermissions: (roleId: number) => void;
  onDeleteRole: (roleId: number) => void;
}

export const PermissionsTable: React.FC<PermissionsTableProps> = ({
  permissions,
  loading,
  onViewPermissions,
  onEditPermissions,
  onDeleteRole,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (permissions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-12 text-center text-slate-500">
          Эрх олдсонгүй
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                ID
              </th>
              {/* ✅ Дэс дугаар */}
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider w-16">
                №
              </th>

              <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Эрх
              </th>

              <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                Зөвшөөрөл
              </th>

              <th className="px-6 py-4 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                Үйлдэл
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-slate-200">
            {permissions.map((permission, index) => (
              <tr
                key={permission.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-900">#{permission.id}</span>
                </td>
                {/* ✅ Дэс дугаар */}
                <td className="px-6 py-4 text-sm text-slate-600">
                  {index + 1}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-slate-900">
                      {permission.name}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <PermissionList
                    permissions={permission.permissions}
                    roleId={permission.id}
                    roleName={permission.name}
                  />
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onViewPermissions(permission.id)}
                      title="Зөвшөөрлүүдийг харах"
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onEditPermissions(permission.id)}
                      title="Эрх засах"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onDeleteRole(permission.id)}
                      title="Эрх устгах"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
