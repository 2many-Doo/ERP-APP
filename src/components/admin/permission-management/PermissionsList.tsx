"use client";

import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { Key, Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";
import { CreatePermissionModal } from "./CreatePermissionModal";
import { EditPermissionModal } from "./EditPermissionModal";

export const PermissionsList: React.FC = () => {
  const { permissions, loading, error, fetchPermissions, deletePermission } =
    usePermissions();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const filteredPermissions = useMemo(() => {
    return permissions.filter((perm) =>
      perm.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [permissions, searchQuery]);

  const handleDelete = async (id: number) => {
    if (confirm("Энэ зөвшөөрлийг устгахдаа итгэлтэй байна уу?")) {
      try {
        await deletePermission(id);
        toast.success("Зөвшөөрөл амжилттай устгагдлаа");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Алдаа гарлаа");
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse h-24 bg-slate-200 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-800 font-medium">Алдаа: {error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchPermissions}>
          Дахин оролдох
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-800">Зөвшөөрлүүд</h2>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Шинэ зөвшөөрөл нэмэх
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
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
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        {filteredPermissions.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            Зөвшөөрөл олдсонгүй
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPermissions.map((permission) => (
              <div
                key={permission.id}
                className="group rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white">
                      <Key className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {permission.title}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setEditingPermission(permission)}
                      title="Засварлах"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDelete(permission.id)}
                      title="Устгах"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                {/* жижиг "footer" мөр (optional) */}
                {/* <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1">
                    Permission
                  </span>
                  <span className="hidden sm:inline">⋯</span>
                </div> */}
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreatePermissionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchPermissions();
          }}
        />
      )}

      {editingPermission && (
        <EditPermissionModal
          permission={editingPermission}
          onClose={() => setEditingPermission(null)}
          onSuccess={() => {
            setEditingPermission(null);
            fetchPermissions();
          }}
        />
      )}
    </div>
  );
};
