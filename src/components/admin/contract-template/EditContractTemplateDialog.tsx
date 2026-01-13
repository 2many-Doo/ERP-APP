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
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadTempMedia, getContractTemplateCreateMeta, updateContractTemplate } from "@/lib/api";

interface EditContractTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
  trigger: React.ReactNode;
  template: any;
}

const EditContractTemplateDialog: React.FC<EditContractTemplateDialogProps> = ({
  open,
  onOpenChange,
  onUpdated,
  trigger,
  template,
}) => {
  const [name, setName] = useState<string>("");
  const [contractType, setContractType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [typeOptions, setTypeOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [propertyType, setPropertyType] = useState<string>("");
  const [loadingMeta, setLoadingMeta] = useState<boolean>(false);

  useEffect(() => {
    if (template) {
      setName(template.name || template.title || "");
      setContractType(
        template.contract_type ||
          template.type ||
          template.contractType ||
          template.type_id ||
          template.typeId ||
          ""
      );
      setPropertyType(
        template.property_type_id ||
          template.propertyTypeId ||
          template.property_type ||
          template.propertyType ||
          ""
      );
      setUploadedUrl(template.file_url || template.template_file || template.file || null);
      setUploadedFileName(template.file_name || template.filename || template.template_file || null);
    }
  }, [template]);

  const isDisabled = useMemo(() => {
    return !name.trim() || !contractType.trim();
  }, [name, contractType]);

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
        toast.error(err instanceof Error ? err.message : "Мета мэдээлэл татахад алдаа гарлаа");
        setPropertyTypes([]);
      } finally {
        setLoadingMeta(false);
      }
    };
    if (open) {
      fetchMeta();
    }
  }, [open, contractType]);

  const resetUploadState = () => {
    setFile(null);
    setUploadedUrl(template?.file_url || template?.template_file || null);
    setUploadedFileName(template?.file_name || template?.filename || null);
    setUploadError(null);
    setUploading(false);
  };

  const extractUpload = (res: any, fileNameFallback?: string) => {
    const data = res?.data || {};
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

    const fname =
      data.original_name ||
      nested.original_name ||
      data.template_file ||
      data.filename ||
      data.file_name ||
      nested.template_file ||
      nested.filename ||
      nested.file_name ||
      fileNameFallback ||
      (url ? url.split("/").pop()?.split("?")[0] : "");

    return { url: url || null, fileName: fname || null };
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Файл сонгоно уу.");
      return;
    }
    setUploading(true);
    try {
      const uploadRes = await uploadTempMedia(file, { name: file.name });
      if (uploadRes.error) {
        toast.error(uploadRes.error || "Файл илгээхэд алдаа гарлаа");
        setUploadError(uploadRes.error || "Файл илгээхэд алдаа гарлаа");
        return;
      }
      const { url, fileName } = extractUpload(uploadRes, file.name);
      setUploadedUrl(url);
      setUploadedFileName(fileName);
      setUploadError(null);
      toast.success("Файл амжилттай илгээлээ");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Файл илгээхэд алдаа гарлаа");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!template?.id) {
      toast.error("Template ID алга.");
      return;
    }
    if (!name.trim() || !contractType.trim()) {
      toast.error("Нэр, гэрээний төрлийг бөглөнө үү.");
      return;
    }
    setSubmitting(true);
    try {
      let fileUrl: string | null = null;
      let fileName: string | null = null;

      // Зөвхөн шинэ файл сонгосон үед upload хийнэ
      if (file) {
        setUploading(true);
        const uploadRes = await uploadTempMedia(file, { name: file.name });
        setUploading(false);
        if (uploadRes.error) {
          toast.error(uploadRes.error || "Файл илгээхэд алдаа гарлаа");
          setUploadError(uploadRes.error || "Файл илгээхэд алдаа гарлаа");
          setSubmitting(false);
          return;
        }
        const { url, fileName: parsedName } = extractUpload(uploadRes, file.name);
        fileUrl = url;
        fileName = parsedName;
        setUploadSuccess(true);
      }

      const payload: any = {
        name: name.trim(),
        type: contractType.trim(), // backend expects "type": individual | organization
        contract_type: contractType.trim(), // backward compatibility
        property_type_id: propertyType || null,
      };

      if (fileUrl) {
        // Backend expects temp upload filename/path
        payload.file_url = fileUrl;
        payload.file_name = fileName || undefined;
        payload.template_file = fileUrl;
      }

      const res = await updateContractTemplate(template.id, payload);
      if (res.error) {
        toast.error(res.error || "Шинэчлэхэд алдаа гарлаа");
        return;
      }
      toast.success("Гэрээний загвар шинэчлэгдлээ");
      onUpdated();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Гэрээний загвар засах</DialogTitle>
          <DialogDescription>Файл болон үндсэн мэдээллийг шинэчилнэ.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Нэр</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Талбайн төрөл</label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Сонгох" />
              </SelectTrigger>
              <SelectContent className="z-[100] bg-white">
                {(propertyTypes || []).map((p) => {
                  const key = String(p.id ?? p.value ?? p.code ?? p.slug ?? p.name);
                  const label = p.name ?? p.title ?? p.label ?? key;
                  return (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Гэрээний төрөл</label>
            <Select value={contractType} onValueChange={setContractType}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Сонгох" />
              </SelectTrigger>
              <SelectContent className="z-[100] bg-white">
                {typeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Файл</label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                className="flex-1"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setFile(f || null);
                  if (f) {
                    setUploadedUrl(null);
                    setUploadedFileName(f.name);
                    setUploadSuccess(false);
                  }
                }}
              />
              <Button variant="outline" size="sm" onClick={handleUpload} disabled={uploading || !file}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload
              </Button>
            </div>
            {uploadedUrl && (
              <p className="text-xs text-slate-600 break-all">
                Одоогийн файл: {uploadedFileName || uploadedUrl}
              </p>
            )}
            {uploadSuccess && (
              <p className="text-xs text-green-600">Файл амжилттай илгээгдлээ.</p>
            )}
            {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Болих
          </Button>
          <Button onClick={handleSubmit} disabled={isDisabled || submitting || uploading || loadingMeta}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Шинэчлэх
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditContractTemplateDialog;
