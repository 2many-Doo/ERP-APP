import React, { useMemo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  open: boolean;
  loading: boolean;
  title: string;
  description: string;
  dueDate: string;
  tags: { id: number; name: string }[];
  users: { id: number; name: string }[];
  selectedTags: number[];
  selectedParticipants: number[];
  attachmentName?: string;
  uploading: boolean;
  onClose: () => void;
  onChangeTitle: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onChangeDueDate: (v: string) => void;
  onSelectTag: (id: number) => void;
  onRemoveTag: (id: number) => void;
  onSelectParticipant: (id: number) => void;
  onRemoveParticipant: (id: number) => void;
  onUpload: (file: File) => Promise<boolean>;
  onSubmit: () => Promise<void>;
  setUploading: (v: boolean) => void;
  titleText?: string;
  submitText?: string;
}

const CreateTaskModal: React.FC<Props> = ({
  open,
  loading,
  title,
  description,
  dueDate,
  tags,
  users,
  selectedTags,
  selectedParticipants,
  attachmentName,
  uploading,
  onClose,
  onChangeTitle,
  onChangeDescription,
  onChangeDueDate,
  onSelectTag,
  onRemoveTag,
  onSelectParticipant,
  onRemoveParticipant,
  onUpload,
  onSubmit,
  setUploading,
  titleText = "Даалгавар үүсгэх",
  submitText = "Үүсгэх",
}) => {
  const selectedTagObjects = useMemo(
    () => tags.filter((tag) => selectedTags.includes(tag.id)),
    [tags, selectedTags],
  );

  const selectedUserObjects = useMemo(
    () => users.filter((u) => selectedParticipants.includes(u.id)),
    [users, selectedParticipants],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl">
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

        <div className="px-6 py-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Нэр *</label>
              <Input placeholder="Даалгаврын нэр" value={title} onChange={(e) => onChangeTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Дуусах огноо</label>
              <Input type="date" value={dueDate} onChange={(e) => onChangeDueDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Тайлбар</label>
            <Textarea
              rows={4}
              placeholder="Тайлбар оруулах..."
              value={description}
              onChange={(e) => onChangeDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-1 ">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Тааг</label>
              <Select onValueChange={(v) => onSelectTag(Number(v))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Тааг сонгох" />
                </SelectTrigger>
                <SelectContent className="z-100 bg-white">
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={String(tag.id)}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTagObjects.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTagObjects.map((tag) => (
                    <button
                      key={tag.id}
                      className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                      onClick={() => onRemoveTag(tag.id)}
                    >
                      <span>{tag.name}</span>
                      <X className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Оролцогчид</label>
              <Select onValueChange={(v) => onSelectParticipant(Number(v))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Оролцогч сонгох" />
                </SelectTrigger>
                <SelectContent className="z-100 bg-white">
                  {users.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedUserObjects.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedUserObjects.map((user) => (
                    <button
                      key={user.id}
                      className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                      onClick={() => onRemoveParticipant(user.id)}
                    >
                      <span>{user.name}</span>
                      <X className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Файл хавсаргах</label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                className="cursor-pointer"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  const ok = await onUpload(file);
                  if (!ok) {
                    e.target.value = "";
                  }
                  setUploading(false);
                }}
              />
              {uploading && <span className="text-sm text-slate-600">Хуулж байна...</span>}
            </div>
            {attachmentName ? (
              <p className="text-sm text-slate-600">Хавсралт: {attachmentName}</p>
            ) : (
              <p className="text-sm text-slate-500">Файл оруулах нь сонголттой</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Болих
          </Button>
          <Button onClick={onSubmit} disabled={loading || uploading}>
            {loading ? "Хадгалж байна..." : submitText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
