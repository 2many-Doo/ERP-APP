"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Search, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deletePropertyType, getPropertyTypes } from "@/lib/api";
import CreatePropertyTypeDialog from "./CreatePropertyTypeDialog";
import EditPropertyTypeDialog from "./EditPropertyTypeDialog";
import { toast } from "sonner";

type PropertyType = {
  id?: number | string;
  name?: string;
  title?: string;
  code?: string;
  slug?: string;
  status?: string | boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
};

const PER_PAGE = 32;

const PropertyTypeList: React.FC = () => {
  const [items, setItems] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [search, setSearch] = useState<string>("");
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  const fetchTypes = async (page: number = currentPage, searchText: string = search) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPropertyTypes(page, PER_PAGE, "id", "asc", searchText.trim());

      if (res.error) {
        setError(res.error);
        return;
      }

      const payload = res.data;
      let dataArray: any[] = [];
      let paginationInfo: any = {};

      if (payload?.data && Array.isArray(payload.data)) {
        dataArray = payload.data;
        paginationInfo = payload;
      } else if (Array.isArray(payload)) {
        dataArray = payload;
      }

      setItems(dataArray);

      if (paginationInfo.last_page !== undefined) {
        setTotalPages(paginationInfo.last_page);
      } else if (paginationInfo.total_pages !== undefined) {
        setTotalPages(paginationInfo.total_pages);
      } else {
        setTotalPages(1);
      }

      if (paginationInfo.current_page !== undefined) {
        setCurrentPage(paginationInfo.current_page);
      } else {
        setCurrentPage(page);
      }

      if (paginationInfo.total !== undefined) {
        setTotalItems(paginationInfo.total);
      } else {
        setTotalItems(dataArray.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchTypes(1, search);
  };

  const handleDelete = async (id: number | string) => {
    const confirmed = window.confirm("Энэ төрлийг устгах уу?");
    if (!confirmed) return;
    setDeletingId(id);
    try {
      const res = await deletePropertyType(id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Амжилттай устгалаа");
      // refresh current page; if page becomes empty, optionally go previous
      fetchTypes(currentPage);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Алдаа гарлаа";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const formatStatus = (status?: string | boolean) => {
    if (typeof status === "boolean") return status ? "Идэвхтэй" : "Идэвхгүй";
    const map: Record<string, string> = {
      active: "Идэвхтэй",
      inactive: "Идэвхгүй",
      enabled: "Идэвхтэй",
      disabled: "Идэвхгүй",
      archived: "Архивласан",
    };
    const key = (status || "").toString().toLowerCase();
    return map[key] || status || "-";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Талбайн төрөл</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                placeholder="Хайх..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="pl-9"
              />
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <Button variant="outline" size="sm" onClick={handleSearch} disabled={loading}>
              Хайх
            </Button>
            {search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  fetchTypes(1, "");
                }}
                disabled={loading}
              >
                Цэвэрлэх
              </Button>
            )}
          </div>
          <CreatePropertyTypeDialog
            onCreated={() => fetchTypes(1)}
            trigger={
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Нэмэх
              </Button>
            }
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Нийт {totalItems} төрөл · Хуудас {currentPage}/{totalPages}
          </p>
        </div>

        {error && <div className="px-6 py-4 text-sm text-red-600">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Нэр</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Ачааллаж байна...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    Мэдээлэл олдсонгүй
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const name = item.name || item.title || "-";
                  const code = item.code || item.slug || "-";
                  const status = formatStatus(item.status ?? item.is_active);
                  const dateValue = item.updated_at || item.created_at || "-";

                  return (
                    <tr key={item.id || `${name}-${code}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900">#{item.id ?? "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-900">{name}</td>

                      <td className="px-6 py-4 text-sm text-right space-x-1">
                        {item.id && (
                          <>
                            <EditPropertyTypeDialog
                              id={item.id}
                              defaultName={name}
                              defaultDescription={item.description}
                              onUpdated={() => fetchTypes(currentPage)}
                              trigger={
                                <Button variant="ghost" size="sm" className="gap-1">
                                  <Pencil className="h-4 w-4" />
                                  Засах
                                </Button>
                              }
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 gap-1"
                              onClick={() => item.id && handleDelete(item.id)}
                              disabled={deletingId === item.id}
                            >
                              <Trash2 className="h-4 w-4" />
                              {deletingId === item.id ? "Устгаж..." : "Устгах"}
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PropertyTypeList;
