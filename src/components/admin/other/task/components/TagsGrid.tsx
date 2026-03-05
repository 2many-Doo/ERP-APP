import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";

interface Props {
  tags: { id: number; name: string }[];
  loading: boolean;
  onCreateTag: () => void;
  onEditTag: (tag: { id: number; name: string }) => void;
  onDeleteTag: (tag: { id: number; name: string }) => void;
}

const TagsGrid: React.FC<Props> = ({ tags, loading, onCreateTag, onEditTag, onDeleteTag }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-800">Тааг</h2>
      <Button type="button" onClick={onCreateTag}>
        <Plus className="h-4 w-4" />
        Таг нэмэх
      </Button>
    </div>
    {loading ? (
      <div className="p-4 text-center text-slate-600">Уншиж байна...</div>
    ) : tags.length === 0 ? (
      <div className="p-4 text-center text-slate-600">Таг олдсонгүй</div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-800">#{tag.id}</span>
              <div className="text-slate-700">{tag.name}</div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-600 hover:text-slate-900"
                  onClick={() => onEditTag(tag)}
                  aria-label="edit tag"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                  onClick={() => onDeleteTag(tag)}
                  aria-label="delete tag"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default TagsGrid;
