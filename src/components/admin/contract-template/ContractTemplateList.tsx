"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus, Search, Pencil } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { getContractTemplates, getContractTemplateCreateMeta } from "@/lib/api";
import CreateContractTemplateDialog from "./CreateContractTemplateDialog";
import EditContractTemplateDialog from "./EditContractTemplateDialog";
import { useRouter } from "next/navigation";

type ContractTemplate = {
  id?: number;
  name?: string;
  code?: string;
  key?: string;
  version?: string;
  revision?: string;
  is_active?: boolean;
  active?: boolean;
  status?: string;
  description?: string;
  summary?: string;
  note?: string;
  updated_at?: string;
  created_at?: string;
  [key: string]: any;
};

const PER_PAGE = 32;
const ContractTemplateList: React.FC = () => {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [metaLoading, setMetaLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState<string>("");
  const [appliedSearch, setAppliedSearch] = useState<string>("");
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editOpenId, setEditOpenId] = useState<number | null>(null);
  const [typeMap, setTypeMap] = useState<Record<string, string>>({});
  const [propertyTypeMap, setPropertyTypeMap] = useState<Record<string, string>>({});
  const router = useRouter();

  const fetchTemplates = async (page: number = 1, query: string = appliedSearch) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getContractTemplates(page, PER_PAGE, "name", "asc", query.trim());

      if (response.error) {
        setError(response.error);
        setTemplates([]);
        return;
      }

      const payload = response.data;
      let dataArray: any[] = [];
      let paginationInfo: any = {};

      if (payload?.data && Array.isArray(payload.data)) {
        dataArray = payload.data;
        paginationInfo = payload;
      } else if (Array.isArray(payload)) {
        dataArray = payload;
      }

      setTemplates(dataArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        setMetaLoading(true);
        const res = await getContractTemplateCreateMeta();
        if (res.error) {
          return;
        }
        const payload = res.data || {};
        const propertyArr =
          payload.property_types ||
          payload.propertyTypes ||
          payload.data?.property_types ||
          payload.data?.propertyTypes ||
          [];
        const typeSelect =
          payload.type_select ||
          payload.typeSelect ||
          payload.data?.type_select ||
          payload.data?.typeSelect ||
          {};
        const tMap: Record<string, string> = {};
        Object.entries(typeSelect || {}).forEach(([key, val]) => {
          if (typeof key === "string" && key.trim()) {
            tMap[key] = typeof val === "string" ? val : key;
          }
        });
        setTypeMap(tMap);
        const pMap: Record<string, string> = {};
        (Array.isArray(propertyArr) ? propertyArr : []).forEach((p: any) => {
          if (p && (p.id !== undefined || p.name)) {
            const key = String(p.id ?? p.value ?? p.code ?? p.slug ?? p.name);
            const label = p.name ?? p.title ?? p.label ?? key;
            pMap[key] = label;
          }
        });
        setPropertyTypeMap(pMap);
      } catch {
        // ignore meta errors
      } finally {
        setMetaLoading(false);
      }
    };
    fetchMeta();
    fetchTemplates(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const q = searchInput.trim();
      setAppliedSearch(q);
      fetchTemplates(1, q);
    }
  };

  const renderStatus = (template: ContractTemplate) => {
    const hasBoolStatus = typeof template.is_active === "boolean" || typeof template.active === "boolean";
    const boolStatus = template.is_active ?? template.active;

    const raw = hasBoolStatus ? (boolStatus ? "active" : "inactive") : (template.status || "").toString().trim();
    if (!raw) return <span className="text-sm text-slate-500">-</span>;

    const normalized = raw.toLowerCase();
    const statusMap: Record<string, string> = {
      active: "Идэвхтэй",
      inactive: "Идэвхгүй",
      disabled: "Идэвхгүй",
      enabled: "Идэвхтэй",
      draft: "Ноорог",
      pending: "Хүлээгдэж байна",
      waiting: "Хүлээгдэж байна",
      processing: "Боловсруулж байна",
      approved: "Зөвшөөрөгдсөн",
      rejected: "Татгалзсан",
      published: "Нийтлэгдсэн",
      archived: "Архивласан",
      archive: "Архивласан",
      deleted: "Устгасан",
    };

    const label = statusMap[normalized] || raw;

    const style =
      normalized === "active" ||
      normalized === "approved" ||
      normalized === "published" ||
      normalized === "enabled"
        ? "border-green-500 text-green-700 bg-green-50"
        : normalized === "inactive" ||
          normalized === "disabled" ||
          normalized === "deleted" ||
          normalized === "archived" ||
          normalized === "archive" ||
          normalized === "rejected"
        ? "border-red-500 text-red-700 bg-red-50"
        : normalized === "draft" || normalized === "pending" || normalized === "waiting" || normalized === "processing"
        ? "border-amber-400 text-amber-700 bg-amber-50"
        : "border-green-500 text-green-700 bg-green-50";

    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${style}`}>
        {label}
      </span>
    );
  };

  const renderName = (template: ContractTemplate) => {
    return template.name || template.title || template.key || template.code || "-";
  };

  const renderCode = (template: ContractTemplate) => {
    return template.code || template.key || template.slug || "-";
  };

  const renderVersion = (template: ContractTemplate) => {
    return template.version || template.revision || template.template_version || "-";
  };

  const renderDescription = (template: ContractTemplate) => {
    const value = template.description || template.summary || template.note || "";
    if (!value) return "-";
    return value.length > 120 ? `${value.slice(0, 120)}...` : value;
  };

  const renderContractType = (template: ContractTemplate) => {
    // Data can come in multiple shapes; iterate keys to find match
    const candidates: Array<[string, any]> = Object.entries(template || {}).filter(
      ([k]) =>
        ["type", "contract_type", "contractType", "type_id", "typeId"].includes(k)
    );
    for (const [, val] of candidates) {
      if (val === null || val === undefined) continue;
      const key = String(val).toLowerCase();
      if (typeMap[key]) return typeMap[key];
      if (typeMap[String(val)]) return typeMap[String(val)];
      if (key === "individual") return "Хувь хүн";
      if (key === "organization") return "Байгууллага";
      return String(val);
    }
    return "-";
  };

  const renderUpdatedAt = (template: ContractTemplate) => {
    return template.updated_at || template.created_at || "-";
  };

  const renderPropertyType = (template: ContractTemplate) => {
    const raw =
      template.property_type_id ??
      template.propertyTypeId ??
      template.property_type ??
      template.propertyType;
    if (raw === null || raw === undefined) return "-";
    const key = String(raw);
    return propertyTypeMap[key] || key || "-";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Гэрээний загвар</h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9 w-full sm:w-64"
              placeholder="Нэрээр хайх..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchEnter}
            />
          </div>
          <CreateContractTemplateDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            onCreated={() => fetchTemplates(1, appliedSearch)}
            trigger={<Button><Plus className="h-4 w-4" /> Шинэ загвар</Button>}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        

        {error && <div className="px-6 py-4 text-sm text-red-600">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                  Нэр
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                  Гэрээний төрөл
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                  Талбайн төрөл
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                  Шинэчлэгдсэн
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Ачааллаж байна...
                    </div>
                  </td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    Мэдээлэл олдсонгүй
                  </td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr
                    key={template.id ?? renderName(template)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => template.id && router.push(`/main/contract-templates/${template.id}`)}
                  >
                    <td className="px-6 py-4 text-sm text-slate-900">#{template.id ?? "-"}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{renderName(template)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{renderContractType(template)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{renderPropertyType(template)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{renderStatus(template)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{renderUpdatedAt(template)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContractTemplateList;
