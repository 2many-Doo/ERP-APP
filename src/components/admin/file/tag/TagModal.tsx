import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TagModalProps {
    isOpen: boolean;
    newTagName: string;
    setNewTagName: (value: string) => void;
    isSubmitting: boolean;
    handleCreateTag: () => void;
    handleModalClose: () => void;
}

const TagModal: React.FC<TagModalProps> = ({
    isOpen,
    newTagName,
    setNewTagName,
    isSubmitting,
    handleCreateTag,
    handleModalClose,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800">
                        Шинэ таг нэмэх
                    </h2>
                    <button
                        onClick={handleModalClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        disabled={isSubmitting}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="tagName" className="block text-sm font-medium text-slate-700 mb-2">
                            Таг нэр
                        </label>
                        <Input
                            id="tagName"
                            type="text"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !isSubmitting) {
                                    e.preventDefault();
                                    handleCreateTag();
                                }
                            }}
                            placeholder="Таг нэр оруулах..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                            disabled={isSubmitting}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleModalClose}
                        disabled={isSubmitting}
                    >
                        Цуцлах
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleCreateTag}
                        disabled={isSubmitting || !newTagName.trim()}
                        className="text-white"
                    >
                        {isSubmitting ? "Үүсгэж байна..." : "Үүсгэх"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TagModal;
