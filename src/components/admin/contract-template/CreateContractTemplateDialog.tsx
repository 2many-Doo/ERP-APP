"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Loader2, Upload } from "lucide-react";
import { createContractTemplate, uploadTempMedia, getContractTemplateCreateMeta } from "@/lib/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateContractTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  trigger: React.ReactNode;
}

const CreateContractTemplateDialog: React.FC<CreateContractTemplateDialogProps> = ({
  open,
  onOpenChange,
  onCreated,
  trigger,
}) => {
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [contractType, setContractType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [typeOptions, setTypeOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingMeta, setLoadingMeta] = useState<boolean>(false);

  const isDisabled = useMemo(() => {
    return (
      !name.trim() ||
      !category.trim() ||
      !contractType.trim() ||
      (!file && !uploadedUrl)
    );
  }, [name, category, contractType, file, uploadedUrl]);

  const resetForm = () => {
    setName("");
    setCategory("");
    setContractType(typeOptions[0]?.value || "");
    setFile(null);
    setUploadedUrl(null);
    setUploadedFileName(null);
    setUploadError(null);
    setUploading(false);
  };

  useEffect(() => {
    const fetchMeta = async () => {
      setLoadingMeta(true);
      try {
        const res = await getContractTemplateCreateMeta();
        if (res.error) {
          toast.error(res.error);
          setPropertyTypes([]);
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
        setPropertyTypes(Array.isArray(propertyArr) ? propertyArr : []);
        const opts: Array<{ value: string; label: string }> = [];
        Object.entries(typeSelect || {}).forEach(([key, val]) => {
          if (typeof key === "string" && key.trim()) {
            const label = typeof val === "string" ? val : key;
            opts.push({ value: key, label });
          }
        });
        setTypeOptions(opts);
        if (!contractType && opts.length > 0) {
          setContractType(opts[0].value);
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Мета мэдээлэл татахад алдаа гарлаа"
        );
        setPropertyTypes([]);
      } finally {
        setLoadingMeta(false);
      }
    };
    fetchMeta();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !category.trim() || !contractType.trim()) {
      toast.error("Нэр, талбайн төрөл, гэрээний төрлийг бөглөнө үү.");
      return;
    }
    if (!file && !uploadedUrl) {
      toast.error("Гэрээний загварын файл оруулна уу.");
      return;
    }

    setSubmitting(true);
    let fileUrl = uploadedUrl;
    let fileName = uploadedFileName || file?.name;

    // Хэрэв урьдчилан upload хийгдээгүй бол хадгалах дээр uploadTempMedia дуудах
    if (!fileUrl && file) {
      try {
        setUploading(true);
        const res = await uploadTempMedia(file, { name: file.name });
        if (res.error) {
          toast.error(res.error || "Файл илгээхэд алдаа гарлаа");
          setUploadError(res.error || "Файл илгээхэд алдаа гарлаа");
          setSubmitting(false);
          return;
        }

        const data = res.data || {};
        const nested = data.data || data.result || {};

        const pickUrl = (...vals: any[]) => {
          for (const v of vals) {
            if (typeof v === "string" && v.trim()) return v;
          }
          return "";
        };
        const findUrlDeep = (val: any, depth = 0): string | null => {
          if (!val || depth > 4) return null;
          if (typeof val === "string") {
            if (/^https?:\/\//i.test(val) || val.startsWith("/")) return val;
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

        const url = pickUrl(
          data.url,
          data.path,
          data.location,
          data.full_url,
          data.file,
          data.link,
          data.file_url,
          nested.url,
          nested.path,
          nested.location,
          nested.full_url,
          nested.file,
          nested.link,
          nested.file_url,
          findUrlDeep(data),
          findUrlDeep(nested)
        );

        const fname = pickUrl(
          data.template_file,
          data.filename,
          data.file_name,
          nested.template_file,
          nested.filename,
          nested.file_name,
          url ? url.split("/").pop()?.split("?")[0] : "",
          file.name
        );

        const storageKey =
          data.name ||
          nested.name ||
          data.original_name ||
          nested.original_name ||
          fname;

        fileUrl = url || storageKey || "";
        fileName =
          fname ||
          data.original_name ||
          nested.original_name ||
          data.name ||
          nested.name ||
          file.name;

        if (!fileUrl) {
          toast.error("Файл илгээсэн боловч URL олдсонгүй. API хариуг шалгана уу.");
          const debugKeys = [
            ...Object.keys(data || {}),
            ...(nested && typeof nested === "object" ? Object.keys(nested) : []),
          ].filter(Boolean);
          setUploadError(
            debugKeys.length
              ? `Хариу дотор URL талбар олдсонгүй. Түлхүүрүүд: ${debugKeys.join(", ")}`
              : "Хариу дотор URL талбар олдсонгүй."
          );
          setSubmitting(false);
          return;
        }
        setUploadedUrl(fileUrl);
        setUploadedFileName(fileName || null);
        setUploadError(null);
        toast.success("Файл илгээгдлээ");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Файл илгээхэд алдаа гарлаа";
        toast.error(message);
        setUploadError(message);
        setSubmitting(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    try {
      const response = await createContractTemplate({
        name: name.trim(),
        category: category.trim(),
        file_url: fileUrl || "",
        file_name: fileName || undefined,
        file: fileUrl || fileName || "",
        template_file: fileUrl || fileName || "",
        contract_type: contractType,
        property_type_id: Number(category) || category,
        type: contractType,
      });

      if (response.error) {
        toast.error(response.error || "Үүсгэж чадсангүй");
        return;
      }

      toast.success("Гэрээний загвар амжилттай үүслээ");
      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Үүсгэж чадсангүй");
    } finally {
      setSubmitting(false);
    }
  };

  const fileLabel = uploadedFileName || file?.name || "Файл оруулна уу";
  const uploadHint = uploadedUrl ? "Файл илгээгдсэн" : uploading ? "Илгээж байна..." : "Файл сонгох";

  const handleFileChange = (selected: File | null) => {
    if (!selected) return;
    setFile(selected);
    setUploadedUrl(null);
    setUploadedFileName(null);
    setUploadError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Гэрээний загвар үүсгэх</DialogTitle>
          <DialogDescription>Нэр, талбайн ангилал, файлыг заавал бөглөнө.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Нэр *</label>
            <Input
              placeholder="Гэрээний нэр оруулна уу"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Талбайн төрөл *</label>
            <Select
              value={category}
              onValueChange={(val) => setCategory(val)}
              disabled={loadingMeta || submitting || uploading || propertyTypes.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingMeta ? "Ачааллаж байна..." : "Ангилал сонгох"} />
              </SelectTrigger>
              <SelectContent className="z-[100] bg-white">
                {propertyTypes.length === 0 && (
                  <SelectItem value="__empty" disabled>
                    Сонголт алга
                  </SelectItem>
                )}
                {propertyTypes.map((item) => {
                  const value =
                    item.id?.toString?.() ||
                    item.value?.toString?.() ||
                    item.code ||
                    item.slug ||
                    item.name;
                  const label =
                    item.name ||
                    item.title ||
                    item.label ||
                    item.code ||
                    item.slug ||
                    value;
                  if (!value || !label) return null;
                  return (
                    <SelectItem key={value} value={value} className="cursor-pointer bg-white">
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Гэрээний төрөл *</label>
            <Select
              value={contractType}
              onValueChange={(val) => setContractType(val)}
              disabled={submitting || uploading || typeOptions.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Төрөл сонгох" />
              </SelectTrigger>
              <SelectContent className="z-[100] bg-white">
                {typeOptions.length === 0 ? (
                  <SelectItem value="__empty" disabled>
                    Сонголт алга
                  </SelectItem>
                ) : (
                  typeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="cursor-pointer bg-white">
                      {opt.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Файл *</label>
            <label className="flex items-center gap-2 rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-700 hover:border-slate-400 cursor-pointer">
              <Upload className="h-4 w-4 text-slate-500" />
              <span className="flex-1 truncate">
                {fileLabel}
                {uploadedUrl && <span className="ml-2 text-emerald-600 text-xs">(илгээгдсэн)</span>}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) {
                    handleFileChange(selected);
                  }
                }}
                disabled={uploading}
              />
            </label>
            <p className="text-xs text-slate-500">Зөвшөөрөгдсөн: pdf, doc, docx, txt</p>
            {uploading && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Loader2 className="h-3 w-3 animate-spin" />
                Файл илгээж байна...
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting || uploading}>
            Болих
          </Button>
          <Button onClick={handleSubmit} disabled={isDisabled || submitting || uploading}>
            {(submitting || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Хадгалах
          </Button>
        </DialogFooter>

        {uploadError && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 break-all">
            {uploadError}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateContractTemplateDialog;
