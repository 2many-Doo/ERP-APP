 "use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updatePropertyType } from "@/lib/api";
import { toast } from "sonner";

type EditPropertyTypeDialogProps = {
  trigger: React.ReactNode;
  onUpdated?: () => void;
  id: number | string;
  defaultName?: string;
  defaultDescription?: string;
};

const EditPropertyTypeDialog: React.FC<EditPropertyTypeDialogProps> = ({
  trigger,
  onUpdated,
  id,
  defaultName = "",
  defaultDescription = "",
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState(defaultDescription);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(defaultName);
    setDescription(defaultDescription || "");
  }, [defaultName, defaultDescription, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Нэр заавал бөглөнө.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await updatePropertyType(id, {
        name: name.trim(),
        description: description.trim() || undefined,
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
          <DialogTitle>Талбайн төрөл засах</DialogTitle>
          <DialogDescription>Нэр болон тайлбарыг өөрчилж хадгална уу.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Нэр*</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Нэр" />
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

export default EditPropertyTypeDialog;
