import { useState, useEffect } from "react";
import { getPermissions, createRole } from "@/lib/api";
import { PermissionOption } from "@/components/admin/permission-management/CreateRoleModal";

export const useCreateRole = (showModal: boolean, onSuccess: () => void) => {
  const [availablePermissions, setAvailablePermissions] = useState<PermissionOption[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    permission_ids: [] as number[],
  });

  useEffect(() => {
    if (showModal) {
      setLoadingPermissions(true);
      getPermissions()
        .then((response) => {
          if (response.data?.data) {
            setAvailablePermissions(response.data.data);
          }
        })
        .catch(() => {
          // Handle error
        })
        .finally(() => {
          setLoadingPermissions(false);
        });
    }
  }, [showModal]);

  const handleCreateRole = async () => {
    if (!formData.title.trim()) {
      alert("Эрхийн нэрийг оруулна уу");
      return;
    }
    if (formData.permission_ids.length === 0) {
      alert("Хамгийн багадаа нэг зөвшөөрөл сонгоно уу");
      return;
    }
    setCreating(true);
    try {
      const response = await createRole({
        title: formData.title,
        permission_ids: formData.permission_ids,
      });
      if (response.error) {
        alert(response.error);
      } else {
        setFormData({ title: "", permission_ids: [] });
        onSuccess();
      }
    } catch (err) {
      alert("Алдаа гарлаа");
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", permission_ids: [] });
  };

  return {
    availablePermissions,
    loadingPermissions,
    creating,
    formData,
    setFormData,
    handleCreateRole,
    resetForm,
  };
};

