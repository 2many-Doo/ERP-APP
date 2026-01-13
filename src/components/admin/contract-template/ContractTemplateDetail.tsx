"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, Loader2, Pencil } from "lucide-react";
import { Button } from "../../ui/button";
import { getContractTemplateById } from "@/lib/api";
import EditContractTemplateDialog from "./EditContractTemplateDialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  contract_type?: string;
  property_type_id?: number | string;
  property_type?: any;
  propertyType?: any;
  file_url?: string;
  template_file?: string;
  file_name?: string;
  [key: string]: any;
};

interface ContractTemplateDetailProps {
  templateId: number;
}

const ContractTemplateDetail: React.FC<ContractTemplateDetailProps> = ({ templateId }) => {
  const [propertyTypesMap, setPropertyTypesMap] = useState<Record<string, string>>({});
  const [template, setTemplate] = useState<ContractTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const router = useRouter();

  const fetchTemplate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getContractTemplateById(templateId);
      if (res.error) {
        setError(res.error);
        setTemplate(null);
        return;
      }
      const data =
        res.data?.data?.data ||
        res.data?.data ||
        res.data ||
        res;
      const propertyArr =
        data?.property_types ||
        data?.propertyTypes ||
        data?.meta?.property_types ||
        data?.meta?.propertyTypes ||
        [];
      const pMap: Record<string, string> = {};
      (Array.isArray(propertyArr) ? propertyArr : []).forEach((p: any) => {
        if (!p) return;
        const key = String(p.id ?? p.value ?? p.code ?? p.slug ?? p.name);
        const label = p.name ?? p.title ?? p.label ?? key;
        pMap[key] = label;
      });

      // Fallback: if response already contains property_type/name, map by its id so name shows
      const propId =
        data?.property_type_id ??
        data?.propertyTypeId ??
        data?.property_type?.id ??
        data?.propertyType?.id;
      const propLabel =
        data?.property_type?.name ??
        data?.propertyType?.name ??
        data?.property_type?.title ??
        data?.propertyType?.title ??
        null;
      if (propId !== undefined && propId !== null && propLabel) {
        const key = String(propId);
        if (!pMap[key]) {
          pMap[key] = propLabel;
        }
      }

      setPropertyTypesMap(pMap);
      setTemplate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
      setTemplate(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  const pickFirstUrl = (...vals: any[]) => {
    for (const v of vals) {
      if (typeof v === "string" && v.trim()) return v;
    }
    return null;
  };

  const findUrlDeep = (val: any, depth = 0): string | null => {
    if (!val || depth > 4) return null;
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (!trimmed) return null;
      if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) return trimmed;
      return null;
    }
    if (Array.isArray(val)) {
      for (const item of val) {
        const found = findUrlDeep(item, depth + 1);
        if (found) return found;
      }
    } else if (typeof val === "object") {
      for (const key of Object.keys(val)) {
        const found = findUrlDeep(val[key], depth + 1);
        if (found) return found;
      }
    }
    return null;
  };

  const downloadUrl = useMemo(() => {
    const media =
      (template as any)?.media?.[0] ||
      (template as any)?.media?.data?.[0] ||
      (template as any)?.data?.media?.[0] ||
      (template as any)?.data?.media?.data?.[0];
    const mediaUrl = media?.original_url || media?.url;
    const directUrl = pickFirstUrl(
      mediaUrl,
      template?.file_url,
      template?.template_file,
      template?.file,
      template?.url,
      template?.file_path,
      template?.path,
      template?.location,
      template?.link,
      (template as any)?.data?.file_url,
      (template as any)?.data?.template_file,
      (template as any)?.data?.file
    );
    return directUrl || findUrlDeep(template) || null;
  }, [template]);

  const displayFileName = useMemo(() => {
    const media =
      (template as any)?.media?.[0] ||
      (template as any)?.media?.data?.[0] ||
      (template as any)?.data?.media?.[0] ||
      (template as any)?.data?.media?.data?.[0];
    const mediaName = media?.name || media?.file_name || null;
    return (
      mediaName ||
      template?.file_name ||
      (template as any)?.data?.file_name ||
      template?.original_name ||
      template?.filename ||
      template?.template_file ||
      (downloadUrl ? downloadUrl.split("/").pop()?.split("?")[0] : null) ||
      "-"
    );
  }, [template, downloadUrl]);

  const handleDownload = () => {
    if (!downloadUrl) {
      toast.error("Файл олдсонгүй");
      return;
    }
    window.open(downloadUrl, "_blank", "noopener,noreferrer");
  };

  const formatStatus = (status?: string | boolean) => {
    if (typeof status === "boolean") return status ? "Идэвхтэй" : "Идэвхгүй";
    const map: Record<string, string> = {
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
    const key = (status || "").toString().toLowerCase();
    return map[key] || status || "-";
  };

  const formatContractType = (value?: string) => {
    if (!value) return "-";
    const key = value.toLowerCase();
    if (key === "individual") return "Хувь хүн";
    if (key === "organization") return "Байгууллага";
    return value;
  };

  if (loading) {
    return (
      <div className="flex h-[240px] items-center justify-center text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Ачааллаж байна...
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="flex h-[240px] items-center justify-center text-slate-500">
        {error || "Мэдээлэл олдсонгүй"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="back" size="sm" onClick={() => router.push("/main?view=contract-layout")}>
            <ArrowLeft className="h-4 w-4" />
            Буцах
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{template.name || "-"}</h1>
            <p className="text-sm text-slate-500">{template.code || template.key || "-"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {downloadUrl && (
            <Button variant="outline" size="sm" className="gap-2" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Файл татах
            </Button>
          )}
          <EditContractTemplateDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            onUpdated={fetchTemplate}
            template={template}
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <Pencil className="h-4 w-4" />
                Засах
              </Button>
            }
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Гэрээний төрөл</p>
            <p className="text-sm font-medium text-slate-900">{formatContractType(template.contract_type || template.type)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Талбайн төрөл</p>
            <p className="text-sm font-medium text-slate-900">
              {propertyTypesMap[
                String(
                  template.property_type_id ??
                    template.propertyTypeId ??
                    template.property_type ??
                    template.propertyType ??
                    ""
                )
              ] ||
                template.property_type?.name ||
                template.propertyType?.name ||
                template.property_type_id ||
                template.propertyTypeId ||
                "-"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Статус</p>
            <p className="text-sm font-medium text-slate-900">
              {formatStatus(template.status ?? template.is_active ?? template.active)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Файл татах</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleDownload}
                disabled={!downloadUrl}
              >
                <Download className="h-4 w-4" />
                {downloadUrl ? displayFileName : "Файл байхгүй"}
              </Button>
              {!downloadUrl && <span className="text-xs text-slate-500">Холбоос олдсонгүй</span>}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Шинэчлэгдсэн</p>
            <p className="text-sm font-medium text-slate-900">
              {template.updated_at || template.created_at || "-"}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContractTemplateDetail;
