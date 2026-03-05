import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  open: boolean;
  loading: boolean;
  value: string;
  onClose: () => void;
  onChange: (v: string) => void;
  onSubmit: () => Promise<void>;
  titleText?: string;
  submitText?: string;
}

const CreateTagModal: React.FC<Props> = ({
  open,
  loading,
  value,
  onClose,
  onChange,
  onSubmit,
  titleText = "Тааг үүсгэх",
  submitText = "Хадгалах",
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">{titleText}</h3>
          <button
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
            aria-label="close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Нэр</label>
            <Input placeholder="Таагийн нэр" value={value} onChange={(e) => onChange(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Болих
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? "Хадгалж байна..." : submitText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateTagModal;
