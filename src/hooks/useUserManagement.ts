import { useState, useEffect } from "react";
import { getUsers } from "@/lib/api";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  roles?: Array<{ id: number; title: string; pivot?: { user_id: number; role_id: number } }>;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers();
      
      if (response.error) {
        setError(response.error);
      } else if (response.data?.data) {
        setUsers(response.data.data);
      } else {
        setError("User мэдээлэл олдсонгүй");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
  };
};

