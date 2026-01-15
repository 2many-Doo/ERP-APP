 "use client";

import React, { useState } from "react";
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
import { createPropertyType } from "@/lib/api";
import { toast } from "sonner";

type CreatePropertyTypeDialogProps = {
  trigger: React.ReactNode;
  onCreated?: () => void;
};

const CreatePropertyTypeDialog: React.FC<CreatePropertyTypeDialogProps> = ({ trigger, onCreated }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Нэр заавал бөглөнө.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await createPropertyType({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      if (res.error) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      toast.success("Амжилттай нэмэгдлээ");
      setOpen(false);
      setName("");
      setDescription("");
      onCreated?.();
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
          <DialogTitle>Талбайн төрөл нэмэх</DialogTitle>
          <DialogDescription>Нэр болон тайлбарыг оруулаад хадгална уу.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Нэр*</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Жишээ: Агуулах" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Тайлбар</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              rows={3}
              placeholder="тайлбар"
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

export default CreatePropertyTypeDialog;
