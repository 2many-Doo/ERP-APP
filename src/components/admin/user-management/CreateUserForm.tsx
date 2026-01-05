"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Shield, Phone } from "lucide-react";
import { getRoles } from "@/lib/api";

interface Role {
  id: number;
  title: string;
}

interface CreateUserFormProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    roles: number[];
  };
  onFormDataChange: (data: {
    name: string;
    email: string;
    phone: string;
    roles: number[];
  }) => void;
  isEditMode?: boolean; // If true, password is optional
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({
  formData,
  onFormDataChange,
  isEditMode = false,
}) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    setLoadingRoles(true);
    getRoles()
      .then((response) => {
        if (response.data?.data) {
          setRoles(response.data.data);
        }
      })
      .catch(() => {
        // Handle error
      })
      .finally(() => {
        setLoadingRoles(false);
      });
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <div>
        <label htmlFor="user-name" className="block text-sm font-medium text-slate-700 mb-2">
          Нэр <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="user-name"
            type="text"
            value={formData.name}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            placeholder="Хэрэглэгчийн нэр"
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label htmlFor="user-email" className="block text-sm font-medium text-slate-700 mb-2">
          Имэйл <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="user-email"
            type="email"
            value={formData.email}
            onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
            placeholder="example@email.com"
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label htmlFor="user-phone" className="block text-sm font-medium text-slate-700 mb-2">
          Утасны дугаар
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="user-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => onFormDataChange({ ...formData, phone: e.target.value })}
            placeholder="99112233"
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Эрх <span className="text-red-500">*</span>
        </label>
        {loadingRoles ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-slate-500">Уншиж байна...</div>
          </div>
        ) : (
          <div className="border border-slate-300 rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
            {roles.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Эрх олдсонгүй</p>
            ) : (
              roles.map((role) => (
                <label
                  key={role.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onFormDataChange({
                          ...formData,
                          roles: [...formData.roles, role.id],
                        });
                      } else {
                        onFormDataChange({
                          ...formData,
                          roles: formData.roles.filter((id) => id !== role.id),
                        });
                      }
                    }}
                    className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-700">{role.title}</span>
                  </div>
                </label>
              ))
            )}
          </div>
        )}
        {formData.roles.length > 0 && (
          <p className="mt-2 text-xs text-slate-500">
            {formData.roles.length} эрх сонгогдсон
          </p>
        )}
      </div>
    </div>
  );
};

