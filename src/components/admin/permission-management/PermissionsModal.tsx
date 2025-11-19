"use client";

import React from "react";
import { Shield, Key, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PermissionsModalProps {
  roleId: number;
  roleName: string;
  permissions: string[];
  onClose: () => void;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
  roleName,
  permissions,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-[101] w-full max-w-2xl mx-4 bg-white rounded-xl shadow-xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{roleName}</h2>
              <p className="text-sm text-slate-500">Зөвшөөрлүүдийн жагсаалт</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {permissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Зөвшөөрөлгүй</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {permissions.map((perm, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg bg-blue-100 text-blue-800 border border-blue-200"
                >
                  <Key className="h-4 w-4" />
                  {perm}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Хаах
          </Button>
        </div>
      </div>
    </div>
  );
};

