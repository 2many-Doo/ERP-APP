"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Download, Loader2, Pencil } from "lucide-react";
import { Button } from "../../ui/button";
import { getContractTemplateById } from "@/lib/api";
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
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const router = useRouter();

  const extractFileUrlFromMedia = (media?: any[]) => {
    if (!Array.isArray(media)) return "";
    const prioritized = media.find(
      (m) =>
        m?.collection_name === "template_file" ||
        m?.collectionName === "template_file" ||
        m?.collection_name === "file" ||
        m?.collectionName === "file"
    );
    const first = prioritized || media[0];
    return first?.original_url || first?.url || "";
  };

  const findUrlDeep = (value: any): string => {
    // Recursively find a string that looks like a URL
    if (!value) return "";
    if (typeof value === "string") {
      if (/^https?:\/\//i.test(value) || /\.(docx?|pdf|xlsx?|pptx?)$/i.test(value)) return value;
      return "";
    }
    if (Array.isArray(value)) {
      for (const v of value) {
        const found = findUrlDeep(v);
        if (found) return found;
      }
      return "";
    }
    if (typeof value === "object") {
      for (const key of Object.keys(value)) {
        if (/(url|file|path)$/i.test(key) && typeof value[key] === "string") {
          const maybe = findUrlDeep(value[key]);
          if (maybe) return maybe;
        }
        const found = findUrlDeep(value[key]);
        if (found) return found;
      }
    }
    return "";
  };

  const extractFileUrlFromTemplate = (tpl?: any) => {
    if (!tpl) return "";
    if (tpl.file_url || tpl.template_file || tpl.file || tpl.fileUrl || tpl.templateFile) {
      return (
        tpl.file_url ||
        tpl.template_file ||
        tpl.file ||
        tpl.fileUrl ||
        tpl.templateFile ||
        ""
      );
    }
    // Nested shapes: tpl.data?.media, tpl.meta?.media, tpl.medias, tpl.media
    const mediaSources: any[] = [
      tpl.media,
      tpl.medias,
      tpl.files,
      tpl.attachments,
      tpl?.data?.media,
      tpl?.data?.medias,
      tpl?.meta?.media,
      tpl?.meta?.medias,
    ].flat().filter(Boolean);

    const urlFromMedia = extractFileUrlFromMedia(mediaSources);
    if (urlFromMedia) return urlFromMedia;

    // Direct url fields
    const direct = tpl.original_url || tpl.url;
    if (direct) return direct;

    // Deep search as last resort
    return findUrlDeep(tpl);
  };

  const normalizeBaseUrl = (value: string) => {
    if (!value) return "";
    const cleaned = value.trim().replace(/\/+$/, "");
    if (/^https?:\/\//i.test(cleaned)) return cleaned;
    return `https://${cleaned}`;
  };

  const resolveFileUrl = (url?: string | null) => {
    if (!url) return "";

    // If backend returns absolute URL, avoid mixed-content on Vercel (HTTPS)
    if (/^https?:\/\//i.test(url)) {
      if (typeof window !== "undefined" && window.location.protocol === "https:" && url.startsWith("http://")) {
        return url.replace(/^http:\/\//i, "https://");
      }
      return url;
    }

    const base =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_PRODUCTION_URL ||
      process.env.NEXT_PUBLIC_BASE_URL_TEST ||
      "";
    const normalizedBase = normalizeBaseUrl(base);
    if (!normalizedBase) return url;

    return `${normalizedBase}/${String(url).replace(/^\/+/, "")}`;
  };

  const downloadUrl = resolveFileUrl(extractFileUrlFromTemplate(template));
  if (process.env.NODE_ENV === "development") {
    // Helpful during integration issues
    // eslint-disable-next-line no-console
    console.debug("Contract template download URL:", downloadUrl, template);
  }

  const handleDownloadFile = async () => {
    const url = downloadUrl;

    if (!url) {
      window.alert("Татах файл олдсонгүй.");
      return;
    }

    try {
      setDownloading(true);
      const headers: Record<string, string> = {};
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error("Файл татахад алдаа гарлаа.");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileNameFromUrl = url.split("/").pop() || "contract-template";
      link.href = downloadUrl;
      link.download = template?.file_name || template?.name || fileNameFromUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
      window.alert("Файл татахад алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setDownloading(false);
    }
  };

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
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleDownloadFile}
            disabled={downloading || !downloadUrl}
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Файл татах
          </Button>
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
