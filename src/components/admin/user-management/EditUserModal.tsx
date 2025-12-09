"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateUser } from "@/lib/api";
import { CreateUserForm } from "./CreateUserForm";
import { User } from "@/hooks/useUserManagement";

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    password: "",
    phone: user.phone || "",
    role_ids: user.roles?.map((role) => role.id) || [],
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Set initial form data from user
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      role_ids: user.roles?.map((role) => role.id) || [],
    });
  }, [user]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Нэрийг оруулна уу");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Имэйл оруулна уу");
      return;
    }
    if (formData.role_ids.length === 0) {
      toast.error("Хамгийн багадаа нэг эрх сонгоно уу");
      return;
    }

    setUpdating(true);
    try {
      const userData: {
        name: string;
        email: string;
        password?: string;
        phone?: string;
        roles: number[];
      } = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        roles: formData.role_ids,
      };
      
      // Only include password if it's provided
      if (formData.password.trim() && formData.password.length >= 6) {
        userData.password = formData.password;
      }
      
      if (formData.phone.trim()) {
        userData.phone = formData.phone.trim();
      }
      
      const response = await updateUser(user.id, userData);
      
      // Check for errors: only check error field or status >= 400
      if (response.error || response.status >= 400) {
        const errorMessage = response.error || response.message || "Алдаа гарлаа";
        toast.error(errorMessage);
        return; // Don't call onSuccess if there's an error
      }
      
      // Success case
      toast.success("Хэрэглэгч амжилттай шинэчлэгдлээ");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[101] w-full max-w-md mx-4 bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
              <Edit className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Хэрэглэгч засах</h2>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <CreateUserForm formData={formData} onFormDataChange={setFormData} isEditMode={true} />
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} disabled={updating}>
            Цуцлах
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updating || !formData.name.trim() || !formData.email.trim() || formData.role_ids.length === 0}
          >
            {updating ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </div>
      </div>
    </div>
  );
};
