"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { useMerchantManagement, Merchant } from "@/hooks/useMerchantManagement";
import { useVipMerchantManagement } from "@/hooks/useVipMerchantManagement";
import { Store, Search, Plus, Edit, Trash2, CheckCircle2, XCircle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { CreateMerchantModal } from "./CreateMerchantModal";
import { EditMerchantModal } from "./EditMerchantModal";
import { deleteMerchant } from "@/lib/api";

interface MerchantListProps {
  onMerchantClick?: (merchantId: number) => void;
  variant?: "default" | "vip";
}

const MerchantList = ({ onMerchantClick, variant = "default" }: MerchantListProps) => {
  const isVip = variant === "vip";
  const hook = isVip ? useVipMerchantManagement : useMerchantManagement;
  const {
    merchants,
    loading,
    error,
    searchQuery,
    currentPage,
    totalPages,
    totalItems,
    activeMerchants,
    inactiveMerchants,
    handlePageChange,
    handleSort,
    orderby,
    order,
    fetchMerchants,
    searchMerchants,
  } = hook();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [deletingMerchantId, setDeletingMerchantId] = useState<number | null>(null);

  const getStatusDisplay = (status: string | undefined): string => {
    if (!status) return "Тодорхойгүй";
    if (status === "active" || status === "Идэвхтэй") return "Идэвхтэй";
    if (status === "inactive" || status === "Идэвхгүй") return "Идэвхгүй";
    return status;
  };

  const isStatusActive = (status: string | undefined): boolean => {
    return status === "active" || status === "Идэвхтэй";
  };

  const handleDelete = async (merchantId: number) => {
    setDeletingMerchantId(merchantId);
    try {
      const response = await deleteMerchant(merchantId);
      if (response.error) {
        toast.error(response.error || "Алдаа гарлаа");
      } else {
        toast.success("Мерчант амжилттай устгагдлаа");
        handlePageChange(currentPage);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setDeletingMerchantId(null);
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Store className="h-8 w-8 text-gray-600" />
          <h1 className="text-3xl font-bold text-slate-800">
            {isVip ? "VIP мерчант жагсаалт" : "Мерчант жагсаалт"}
          </h1>
        </div>
        {!isVip && (
          <Button
            type="button"
            variant="secondary"
            className="flex items-center gap-2"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4" />
            Шинэ мерчант нэмэх
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">Нийт мерчант</p>
          <p className="text-3xl font-bold text-slate-800">{loading ? "..." : totalItems}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">Идэвхтэй мерчант</p>
          <p className="text-3xl font-bold text-green-600">{loading ? "..." : activeMerchants}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">Идэвхгүй мерчант</p>
          <p className="text-3xl font-bold text-red-600">{loading ? "..." : inactiveMerchants}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-300 focus-within:bg-white">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Мерчант хайх..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  searchMerchants(localSearch);
                }
              }}
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => searchMerchants(localSearch)}
            disabled={loading}
          >
            Хайх
          </Button>
        </div>
      </div>

      {/* Merchant List Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    Нэр
                    {orderby === "name" ? (
                      order === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-50" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Холбоо барих
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Хаяг
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Төлөв
                </th>
                {!isVip && (
                  <th className="px-6 py-4 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Үйлдэл
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Уншиж байна...
                  </td>
                </tr>
              ) : merchants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Мерчант олдсонгүй
                  </td>
                </tr>
              ) : (
                merchants.map((merchant) => (
                  <tr
                    key={merchant.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => onMerchantClick?.(merchant.id)}
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-900">#{merchant.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{merchant.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{merchant.contact || merchant.phone || "-"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 max-w-xs truncate">{merchant.address || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${isStatusActive(merchant.status)
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {isStatusActive(merchant.status) ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {getStatusDisplay(merchant.status)}
                      </span>
                    </td>
                    {!isVip && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setEditingMerchant(merchant)}
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              if (window.confirm("Энэ мерчантыг устгахдаа итгэлтэй байна уу?")) {
                                handleDelete(merchant.id);
                              }
                            }}
                            disabled={deletingMerchantId === merchant.id}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && merchants.length > 0 && totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          loading={loading}
        />
      )}

      {/* Create Merchant Modal */}
      {!isVip && showCreateModal && (
        <CreateMerchantModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            handlePageChange(currentPage);
          }}
        />
      )}

      {/* Edit Merchant Modal */}
      {!isVip && editingMerchant && (
        <EditMerchantModal
          merchant={editingMerchant}
          onClose={() => setEditingMerchant(null)}
          onSuccess={() => {
            setEditingMerchant(null);
            handlePageChange(currentPage);
          }}
        />
      )}
    </div>
  );
};

export default MerchantList;

