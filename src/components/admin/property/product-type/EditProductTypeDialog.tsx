 "use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getServiceCategories, updateProductType } from "@/lib/api";
import { toast } from "sonner";

type EditProductTypeDialogProps = {
  trigger: React.ReactNode;
  onUpdated?: () => void;
  id: number | string;
  defaultName?: string;
  defaultDescription?: string;
  defaultCode?: string;
  defaultCategoryId?: number | string;
};

const EditProductTypeDialog: React.FC<EditProductTypeDialogProps> = ({
  trigger,
  onUpdated,
  id,
  defaultName = "",
  defaultDescription = "",
  defaultCode = "",
  defaultCategoryId,
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState(defaultDescription);
  const [code, setCode] = useState(defaultCode);
  const [categoryId, setCategoryId] = useState<string>(defaultCategoryId ? String(defaultCategoryId) : "none");
  const [managementFeeRate, setManagementFeeRate] = useState<string>("");
  const [categories, setCategories] = useState<Array<{ id: number | string; name: string }>>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(defaultName);
    setDescription(defaultDescription || "");
    setCode(defaultCode || "");
    setCategoryId(defaultCategoryId ? String(defaultCategoryId) : "none");
    setManagementFeeRate("");
  }, [defaultName, defaultDescription, defaultCode, defaultCategoryId, open]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCatLoading(true);
        const res = await getServiceCategories(1, 200, "name", "asc", "");
        if (res.error) {
          toast.error(res.error);
          return;
        }
        const payload: any = res.data;
        const data = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
        const mapped = data
          .map((c: any) => ({
            id: c.id ?? c.value ?? "",
            name: c.name ?? c.title ?? c.label ?? "",
          }))
          .filter((c: any) => c.id && c.name);
        setCategories(mapped);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Ангилал ачаалах үед алдаа гарлаа";
        toast.error(msg);
      } finally {
        setCatLoading(false);
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Нэр заавал бөглөнө.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await updateProductType(id, {
        name: name.trim(),
        description: description.trim() || undefined,
        code: code.trim() || undefined,
        category_id: categoryId !== "none" ? Number(categoryId) : undefined,
        management_fee_rate: managementFeeRate ? Number(managementFeeRate) : undefined,
      });
      if (res.error) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      toast.success("Амжилттай засагдлаа");
      setOpen(false);
      onUpdated?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Алдаа гарлаа";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Бүтээгдэхүүний төрөл засах</DialogTitle>
          <DialogDescription>Нэр, код, тайлбарыг өөрчилж хадгална уу.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Нэр*</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Нэр" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Ангилал (шаардлагагүй)</label>
              <Select value={categoryId} onValueChange={(val) => setCategoryId(val)}>
                <SelectTrigger className="w-full justify-between">
                  <SelectValue placeholder={catLoading ? "Ачааллаж байна..." : "Сонгох"} />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white min-w-[220px]">
                  <SelectItem value="none" className="bg-white">
                    Сонгох
                  </SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)} className="bg-white">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Management fee rate</label>
              <Input
                type="number"
                value={managementFeeRate}
                onChange={(e) => setManagementFeeRate(e.target.value)}
                placeholder="Жишээ: 10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Тайлбар</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              rows={3}
              placeholder="Тайлбар"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Болих
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Хадгалж байна..." : "Хадгалах"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductTypeDialog;
