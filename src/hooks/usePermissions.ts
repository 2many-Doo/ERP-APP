import { useState, useEffect } from "react";
import { getPermissions, createPermission, updatePermission, deletePermission } from "@/lib/api";

export interface Permission {
  id: number;
  title: string;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPermissions();
      
      if (response.error) {
        setError(response.error);
      } else if (response.data?.data) {
        setPermissions(response.data.data);
      } else {
        setError("Зөвшөөрөл олдсонгүй");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (title: string) => {
    const response = await createPermission({ title });
    if (response.error) {
      throw new Error(response.error);
    }
    await fetchPermissions();
  };

  const handleUpdate = async (id: number, title: string) => {
    const response = await updatePermission(id, { title });
    if (response.error) {
      throw new Error(response.error);
    }
    await fetchPermissions();
  };

  const handleDelete = async (id: number) => {
    const response = await deletePermission(id);
    if (response.error) {
      throw new Error(response.error);
    }
    await fetchPermissions();
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return {
    permissions,
    loading,
    error,
    fetchPermissions,
    createPermission: handleCreate,
    updatePermission: handleUpdate,
    deletePermission: handleDelete,
  };
};

