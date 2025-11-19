"use client";

import React, { useState, useMemo } from "react";
import { Edit, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionOption } from "./CreateRoleModal";

interface EditRoleModalProps {
  roleId: number;
  roleName: string;
  availablePermissions: PermissionOption[];
  loadingPermissions: boolean;
  updating: boolean;
  formData: {
    title: string;
    permission_ids: number[];
  };
  onFormDataChange: (data: { title: string; permission_ids: number[] }) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export const EditRoleModal: React.FC<EditRoleModalProps> = ({
  roleName,
  availablePermissions,
  loadingPermissions,
  updating,
  formData,
  onFormDataChange,
  onClose,
  onSubmit,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPermissions = useMemo(() => {
    if (!searchQuery.trim()) return availablePermissions;
    return availablePermissions.filter((perm) =>
      perm.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availablePermissions, searchQuery]);

  const allFilteredSelected = useMemo(() => {
    if (filteredPermissions.length === 0) return false;
    return filteredPermissions.every((perm) => formData.permission_ids.includes(perm.id));
  }, [filteredPermissions, formData.permission_ids]);

  const handlePermissionToggle = (permissionId: number) => {
    const isSelected = formData.permission_ids.includes(permissionId);
    onFormDataChange({
      ...formData,
      permission_ids: isSelected
        ? formData.permission_ids.filter((id) => id !== permissionId)
        : [...formData.permission_ids, permissionId],
    });
  };

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      // Deselect all filtered permissions
      const filteredIds = filteredPermissions.map((p) => p.id);
      onFormDataChange({
        ...formData,
        permission_ids: formData.permission_ids.filter((id) => !filteredIds.includes(id)),
      });
    } else {
      // Select all filtered permissions
      const filteredIds = filteredPermissions.map((p) => p.id);
      const newIds = [...new Set([...formData.permission_ids, ...filteredIds])];
      onFormDataChange({
        ...formData,
        permission_ids: newIds,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-[101] w-full max-w-2xl mx-4 bg-white rounded-xl shadow-xl border border-slate-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
              <Edit className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Эрх засах</h2>
              <p className="text-sm text-slate-500">{roleName}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label htmlFor="edit-role-title" className="block text-sm font-medium text-slate-700 mb-2">
              Эрхийн нэр <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-role-title"
              type="text"
              value={formData.title}
              onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
              placeholder="Жишээ: Админ, Менежер..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Зөвшөөрлүүд <span className="text-red-500">*</span>
            </label>
            {loadingPermissions ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-slate-500">Уншиж байна...</div>
              </div>
            ) : availablePermissions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">Зөвшөөрөл олдсонгүй</div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-blue-300 focus-within:bg-white focus-within:shadow-sm transition-all">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Зөвшөөрөл хайх..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>
                <div className="border border-slate-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {filteredPermissions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      Хайлтын үр дүн олдсонгүй
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border-b border-slate-200 pb-2 mb-2">
                        <input
                          type="checkbox"
                          checked={allFilteredSelected}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        />
                        <span className="text-sm font-semibold text-slate-700">
                          Бүгдийг сонгох
                        </span>
                      </label>
                      {filteredPermissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.permission_ids.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          />
                          <span className="text-sm text-slate-700">{permission.title}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {formData.permission_ids.length > 0 && (
              <p className="mt-2 text-xs text-slate-500">
                {formData.permission_ids.length} зөвшөөрөл сонгогдсон
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} disabled={updating}>
            Цуцлах
          </Button>
          <Button onClick={onSubmit} disabled={updating || !formData.title.trim() || formData.permission_ids.length === 0}>
            {updating ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </div>
      </div>
    </div>
  );
};

