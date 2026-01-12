"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { updateLegalDocumentContent } from "@/lib/api";
import type { LegalDocument } from "./LegalDocuments";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

const formatIndexPath = (path: (string | number)[], currentIndex?: number) => {
  const indices = [...path, currentIndex]
    .filter((p): p is number => typeof p === "number")
    .map((n) => (Number(n) + 1).toString());
  return indices.length ? indices.join(".") : currentIndex !== undefined ? String(currentIndex + 1) : "";
};

type LegalDocumentContentEditorProps = {
  legalDocumentId: number;
  document: LegalDocument | null;
  loading?: boolean;
  onSaved?: (updated?: LegalDocument | null, payload?: any) => void;
};

const parseContent = (raw: any): { parsed: JsonValue; text: string } => {
  if (raw === null || raw === undefined) {
    return { parsed: {}, text: "{}" };
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return { parsed, text: JSON.stringify(parsed, null, 2) };
    } catch {
      return { parsed: raw, text: raw };
    }
  }

  if (typeof raw === "object") {
    return { parsed: raw as JsonValue, text: JSON.stringify(raw, null, 2) };
  }

  return { parsed: String(raw), text: String(raw) };
};

const setValueAtPath = (obj: any, path: (string | number)[], value: JsonValue): JsonValue => {
  if (path.length === 0) return value;

  const [key, ...rest] = path;
  const clone: any = Array.isArray(obj) ? [...obj] : { ...(obj ?? {}) };
  clone[key as any] = setValueAtPath(
    obj && typeof obj === "object" ? (obj as any)[key] : undefined,
    rest,
    value
  );

  return clone;
};

const EditableNode: React.FC<{
  value: JsonValue;
  path: (string | number)[];
  onChange: (path: (string | number)[], value: JsonValue) => void;
  label?: string;
}> = ({ value, path, onChange, label }) => {
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState<"string" | "number" | "boolean" | "object" | "array" | "null">("string");

  const handlePrimitiveChange = (val: string) => {
    if (typeof value === "number") {
      const num = val === "" ? 0 : Number(val);
      onChange(path, Number.isNaN(num) ? 0 : num);
    } else if (typeof value === "boolean") {
      onChange(path, val === "true");
    } else {
      onChange(path, val);
    }
  };

  if (Array.isArray(value)) {
    const createNewArrayItem = (): JsonValue => {
      if (value.length > 0) {
        const sample = value[0];
        if (typeof sample === "number") return 0;
        if (typeof sample === "boolean") return false;
        if (Array.isArray(sample)) return [];
        if (sample !== null && typeof sample === "object") return {};
      }
      return "";
    };

    return (
      <div className="space-y-3">
        {label && <p className="text-xs font-semibold text-slate-500">{label}</p>}
        {value.length === 0 && <p className="text-sm text-slate-500">Хоосон массив</p>}
        {value.map((item, idx) => (
          <div key={`${path.join(".")}-${idx}`} className="rounded-lg  p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xл font-semibold text-slate-600">{formatIndexPath(path, idx)}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  const next = value.filter((_, i) => i !== idx);
                  onChange(path, next);
                }}
              >
                <Trash2 className="h-4 w-4 text-slate-500" />
              </Button>
            </div>
            <EditableNode value={item} path={[...path, idx]} onChange={onChange} />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => {
            const next = [...value, createNewArrayItem()];
            onChange(path, next);
          }}
        >
          <Plus className="h-4 w-4" />
          Элемент нэмэх
        </Button>
      </div>
    );
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value);
    return (
      <div className="space-y-3">
        {label && <p className="text-xs font-semibold text-slate-500">{label}</p>}
        {entries.length === 0 && <p className="text-sm text-slate-500">Хоосон объект</p>}
        <div className="grid gap-3">
          {entries.map(([key, val]) => (
            <div key={`${path.join(".")}-${key}`} className="space-y-2 rounded-lg  p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <EditableNode value={val} path={[...path, key]} onChange={onChange} />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    const next = { ...(value as Record<string, JsonValue>) };
                    delete next[key];
                    onChange(path, next);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-slate-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-2 rounded-lg  -dashed p-3">
          <p className="text-xs font-semibold text-slate-600">Шинэ талбар нэмэх</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="field нэр"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="sm:w-48"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              className="h-10 rounded-md  bg-white px-3 text-sm text-slate-700"
            >
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
              <option value="object">object</option>
              <option value="array">array</option>
              <option value="null">null</option>
            </select>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => {
                const key = newKey.trim();
                if (!key) {
                  toast.error("Key нэрээ оруулна уу");
                  return;
                }
                if (Object.prototype.hasOwnProperty.call(value, key)) {
                  toast.error("Давхардсан key байна");
                  return;
                }
                let newVal: JsonValue = "";
                if (newType === "number") newVal = 0;
                if (newType === "boolean") newVal = false;
                if (newType === "object") newVal = {};
                if (newType === "array") newVal = [];
                if (newType === "null") newVal = null;

                const next = { ...(value as Record<string, JsonValue>), [key]: newVal };
                onChange(path, next);
                setNewKey("");
                setNewType("string");
              }}
            >
              <Plus className="h-4 w-4" />
              Талбар нэмэх
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {label && <p className="text-xs font-semibold text-slate-500">{label}</p>}
      {typeof value === "boolean" ? (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handlePrimitiveChange(String(e.target.checked))}
            className="h-4 w-4 accent-black"
          />
          <span className="text-sm text-slate-700">{value ? "True" : "False"}</span>
        </div>
      ) : (
        <Input
          value={value === null ? "" : String(value)}
          onChange={(e) => handlePrimitiveChange(e.target.value)}
          className="w-full"
        />
      )}
    </div>
  );
};

const LegalDocumentContentEditor: React.FC<LegalDocumentContentEditorProps> = ({
  legalDocumentId,
  document,
  loading,
  onSaved,
}) => {
  const { parsed: initialParsed, text: initialText } = useMemo(
    () => parseContent(document?.content),
    [document?.content]
  );

  const [open, setOpen] = useState(false);
  const [draftContent, setDraftContent] = useState<JsonValue>(initialParsed);
  const [jsonText, setJsonText] = useState<string>(initialText);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraftContent(initialParsed);
    setJsonText(initialText);
    setJsonError(null);
  }, [initialParsed, initialText]);

  const handleNodeChange = (path: (string | number)[], value: JsonValue) => {
    setDraftContent((prev) => {
      const next = setValueAtPath(prev, path, value);
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  };

  const handleJsonTextChange = (value: string) => {
    setJsonText(value);
    try {
      const parsed = JSON.parse(value);
      setDraftContent(parsed);
      setJsonError(null);
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : "JSON parse алдаа");
    }
  };

  const handleSave = async () => {
    if (jsonError) {
      toast.error("JSON-оо зөв болгож байж хадгална уу");
      return;
    }

    setSaving(true);
    try {
      const response = await updateLegalDocumentContent(legalDocumentId, draftContent);
      if (response.error) {
        toast.error(response.error || "Алдаа гарлаа");
        return;
      }

      const payload: any = response.data?.data || response.data || draftContent;
      toast.success("Контент амжилттай шинэчлэгдлээ");
      onSaved?.(payload as LegalDocument, draftContent);
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  const isObjectLike = draftContent !== null && typeof draftContent === "object";

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={loading}
        className="whitespace-nowrap"
      >
        <Pencil className="h-4 w-4" />
        Контент засах
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="text-black">Үйлчилгээний нөхцөл засах</DialogTitle>
            <DialogDescription className="text-slate-600">
              Доорх талбаруудаар JSON-оор ирсэн контентыг нэг бүрчлэн засах эсвэл баруун талын JSON textarea-д шууд өөрчлөөд хадгална.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 lg:grid-cols-1">
            <div className=" max-h-[480px] overflow-auto rounded-lg  p-3">
              <p className="text-sm font-semibold text-slate-800">Талбарууд</p>
              {isObjectLike ? (
                <EditableNode value={draftContent as JsonValue} path={[]} onChange={handleNodeChange} />
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Энгийн текст контент</p>
                  <Input
                    value={draftContent === null ? "" : String(draftContent)}
                    onChange={(e) => {
                      setDraftContent(e.target.value);
                      setJsonText(e.target.value);
                      setJsonError(null);
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)} className="gap-2">
              <X className="h-4 w-4" />
              Болих
            </Button>
            <Button onClick={handleSave} disabled={saving || loading} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Хадгалах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LegalDocumentContentEditor;

