"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadTempMedia } from "@/lib/api";
import { FileText, UploadCloud, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ContractFileUploaderProps {
  onUploaded?: (url: string, response?: any) => void;
  onReadyPayload?: (payload: { name: string; product_types: number[]; template_file: string; url: string }) => void;
  maxSizeMb?: number;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

export const ContractFileUploader: React.FC<ContractFileUploaderProps> = ({
  onUploaded,
  onReadyPayload,
  maxSizeMb = 10,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [productTypesText, setProductTypesText] = useState("");

  const fileSizeMb = useMemo(() => (file ? (file.size / (1024 * 1024)).toFixed(2) : null), [file]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("PDF/Word эсвэл зураг (png/jpg/webp) сонгоно уу.");
      setFile(null);
      return;
    }

    const sizeMb = selected.size / (1024 * 1024);
    if (sizeMb > maxSizeMb) {
      setError(`Файлын хэмжээ ${maxSizeMb}MB-аас их байна.`);
      setFile(null);
      return;
    }

    setError(null);
    setFile(selected);
    setUploadedUrl(null);
  };

  const handleUpload = async (selected: File) => {
    setUploading(true);
    try {
      const productTypes = productTypesText
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
        .map((v) => Number(v))
        .filter((v) => !Number.isNaN(v));

      const res = await uploadTempMedia(selected, {
        name,
        product_types: productTypes,
      });
      if (res.error) {
        toast.error(res.error || "Файл илгээхэд алдаа гарлаа");
        setError(res.error || "Файл илгээхэд алдаа гарлаа");
        return;
      }
      const data = res.data || {};
      const url =
        data.url ||
        data.path ||
        data.location ||
        data.full_url ||
        data.file ||
        data.link ||
        (data.data && (data.data.url || data.data.path || data.data.location)) ||
        "";
      const templateFile =
        data.template_file ||
        data.filename ||
        (url ? url.split("/").pop()?.split("?")[0] : "") ||
        selected.name;

      if (!url) {
        toast.error("Амжилттай боловч URL олдсонгүй");
        setError("Амжилттай боловч URL олдсонгүй. API-ийн хариуг шалгана уу.");
      } else {
        setUploadedUrl(url);
        toast.success("Файл амжилттай илгээгдлээ");
        onUploaded?.(url, data);
        if (templateFile) {
          onReadyPayload?.({
            name,
            product_types: productTypes,
            template_file: templateFile,
            url,
          });
        }
      }
    } catch (err: any) {
      const message = err?.message || "Файл илгээхэд алдаа гарлаа";
      toast.error(message);
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl  bg-white p-4 ">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-base font-semibold text-slate-900">Гэрээний файл</p>
          <p className="text-sm text-slate-500">
            PDF, Word эсвэл зураг хавсаргаж сервер рүү шууд илгээнэ.
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
            file ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-600"
          }`}
        >
          <FileText className="h-3 w-3" />
          {file ? file.name : "Файл сонгогдоогүй"}
          {fileSizeMb && <span className="text-[11px] text-slate-500">({fileSizeMb} MB)</span>}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1 space-y-2">
          <Input
            type="text"
            placeholder="Гэрээний нэр (ж: Хувь хүн гэрээ 2025)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={uploading}
          />
          <Input
            type="text"
            placeholder="Бүтээгдэхүүний төрөл (ж: 1,2)"
            value={productTypesText}
            onChange={(e) => setProductTypesText(e.target.value)}
            disabled={uploading}
          />
        <label className="flex w-full cursor-pointer flex-1 items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50">
          <UploadCloud className="h-4 w-4" />
          <span>{uploading ? "Илгээж байна..." : "Файл сонгох (PDF/Word/зураг)"}</span>
          <Input
            type="file"
            accept=".pdf,.doc,.docx,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </label>
        </div>


        {file && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-1"
              onClick={() => handleUpload(file)}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              Илгээх
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="gap-1 text-red-600"
              onClick={() => {
                setFile(null);
                setError(null);
                setUploadedUrl(null);
              }}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
              Арилгах
            </Button>
          </div>
        )}
      </div>

      {uploading && (
        <div className="mt-3 inline-flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Файл илгээж байна...
        </div>
      )}

      {uploadedUrl && (
        <div className="mt-2 text-xs text-emerald-700 break-all">
          Илгээсэн URL: {uploadedUrl}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-500">
        <li>Зөвшөөрөгдсөн төрөл: PDF, DOC, DOCX, зураг (png/jpg/webp)</li>
        <li>Хэмжээний дээд хязгаар: {maxSizeMb}MB</li>
      </ul>
    </div>
  );
};
