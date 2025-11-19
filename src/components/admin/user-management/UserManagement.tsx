"use client";

import React, { useMemo, useState } from "react";
import { Users, Plus, Edit, Trash2, Mail, Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserManagementStatisticsSkeleton from "@/components/skeletons/UserManagementStatisticsSkeleton";
import UserManagementTableSkeleton from "@/components/skeletons/UserManagementTableSkeleton";
import { useUserManagement, type User } from "@/hooks/useUserManagement";
import UserManagementSearchAndFilter from "./UserManagementSearchAndFilter";
import { CreateUserModal } from "./CreateUserModal";

const UserManagement = () => {
  const { users, loading, error, fetchUsers } = useUserManagement();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Бүх role-уудыг цуглуулах
  const allRoles = useMemo(() => {
    const rolesSet = new Set<string>();
    users.forEach((user) => {
      if (user.roles && user.roles.length > 0) {
        user.roles.forEach((role) => {
          rolesSet.add(role.title);
        });
      } else {
        rolesSet.add("Эрхгүй");
      }
    });
    return Array.from(rolesSet).sort();
  }, [users]);

  const filteredUsers = users.filter((user) => {
    // Search filter
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone && user.phone.includes(searchQuery));

    // Role filter
    const matchesRole =
      selectedRole === null ||
      (selectedRole === "Эрхгүй"
        ? !user.roles || user.roles.length === 0
        : user.roles?.some((role) => role.title === selectedRole));

    return matchesSearch && matchesRole;
  });

  // Role бүрт хэдэн хүн байгааг тоолох
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach((user) => {
      if (user.roles && user.roles.length > 0) {
        user.roles.forEach((role) => {
          counts[role.title] = (counts[role.title] || 0) + 1;
        });
      } else {
        counts["Эрхгүй"] = (counts["Эрхгүй"] || 0) + 1;
      }
    });
    return counts;
  }, [users]);

  // Role-уудыг тоогоор эрэмбэлэх
  const sortedRoles = Object.entries(roleCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-800">Хэрэглэгчийн удирдлага</h1>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          Шинэ хэрэглэгч нэмэх
        </Button>
      </div>

      {/* Statistics Cards - Role бүрт хэдэн хүн байгаа */}
      {loading ? (
        <UserManagementStatisticsSkeleton />
      ) : (
        <div className="flex flex-row justify-between items-center gap-4">
          {sortedRoles.length > 0 ? (
            sortedRoles.map(([roleName, count], index) => {
              const colors = [
                "text-blue-600",
                "text-green-600",
                "text-purple-600",
                "text-orange-600",
                "text-pink-600",
                "text-indigo-600",
              ];
              const color = colors[index % colors.length];
              return (
                <div key={roleName} className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-slate-600" />
                    <p className="text-sm text-slate-600">{roleName}</p>
                  </div>
                  <p className={`text-3xl font-bold ${color}`}>{count}</p>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <p className="text-sm text-slate-600 mb-2">Нийт хэрэглэгч</p>
              <p className="text-3xl font-bold text-slate-800">{users.length}</p>
            </div>
          )}
        </div>
      )}

      {/* Search Bar and Role Filter */}
      <UserManagementSearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        allRoles={allRoles}
        selectedRole={selectedRole}
        onRoleSelect={setSelectedRole}
        loading={loading}
      />

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-800 font-medium">Алдаа: {error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={fetchUsers}
          >
            Дахин оролдох
          </Button>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <UserManagementTableSkeleton />
      ) : !error && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Хэрэглэгч
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Имэйл
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Утас
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Эрх
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Үйлдэл
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Хэрэглэгч олдсонгүй
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{user.name}</div>
                            <div className="text-xs text-slate-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">{user.phone}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <span
                                key={role.id}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                              >
                                <Shield className="h-3 w-3" />
                                {role.title}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-400">Эрхгүй</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4">
          <div className="text-sm text-slate-600">
            Нийт <span className="font-medium">{filteredUsers.length}</span> хэрэглэгч
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Өмнөх
            </Button>
            <span className="text-sm text-slate-600">1 / 1</span>
            <Button variant="outline" size="sm" disabled>
              Дараах
            </Button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;