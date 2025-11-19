import { useState, useEffect } from "react";
import { getRoles } from "@/lib/api";

export interface Role {
  id: number;
  title: string;
  permissions?: Array<{ id: number; title: string }>;
}

export interface Permission {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  permissionIds?: number[]; // Store permission IDs for editing
}

export const usePermissionManagement = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRoles();
      
      if (response.error) {
        setError(response.error);
      } else if (response.data?.data) {
        // Transform API data to component format
        const transformedPermissions: Permission[] = response.data.data.map((role: Role) => ({
          id: role.id,
          name: role.title,
          description: role.title, // You can add description field to API if needed
          permissions: role.permissions?.map((perm) => perm.title) || [],
          permissionIds: role.permissions?.map((perm) => perm.id) || [],
        }));
        setPermissions(transformedPermissions);
      } else {
        setError("Эрх мэдээлэл олдсонгүй");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return {
    permissions,
    loading,
    error,
    fetchPermissions,
  };
};

