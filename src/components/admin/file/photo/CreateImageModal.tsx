"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { getTags, getCategories, createImage, uploadTempMedia } from "@/lib/api";
import { Upload, X, Tag as TagIcon, FolderOpen } from "lucide-react";
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
import Image from "next/image";

interface Tag {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
    description: string | null;
}

interface CreateImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const parseDataItems = <T extends object>(data: any, keys: (keyof T)[]): T[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return Object.entries(data)
        .filter(([key]) => key !== "status")
        .map(([_, value]) => value)
        .filter(
            (item): item is T =>
                typeof item === "object" &&
                item !== null &&
                keys.every((key) => key in (item as object))
        );
};

const getTitleFromFile = (file: File): string => {
    return file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
};

const SelectedBadges = ({
    ids,
    options,
    onRemove,
}: {
    ids: number[];
    options: { id: number; name: string }[];
    onRemove: (id: number) => void;
}) => {
    const selected = options.filter((o) => ids.includes(o.id));
    if (selected.length === 0) return null;
    return (
        <div className="flex flex-wrap gap-1 mt-2">
            {selected.map((item) => (
                <span
                    key={item.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-md"
                >
                    {item.name}
                    <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="hover:bg-blue-200 rounded-sm"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            ))}
        </div>
    );
};

const CreateImageModal = ({ isOpen, onClose, onSuccess }: CreateImageModalProps) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    const [tagSelectKey, setTagSelectKey] = useState(0);
    const [categorySelectKey, setCategorySelectKey] = useState(0);

    const [tags, setTags] = useState<Tag[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) fetchData();
    }, [isOpen]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tagsRes, categoriesRes] = await Promise.all([
                getTags(),
                getCategories(),
            ]);
            setTags(parseDataItems<Tag>(tagsRes.data, ["id", "name"]));
            setCategories(parseDataItems<Category>(categoriesRes.data, ["id", "name"]));
        } catch (err: any) {
            toast.error("Мэдээлэл татахад алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        if (fileArray.some((f) => !f.type.startsWith("image/"))) {
            toast.error("Зөвхөн зураг файл сонгоно уу");
            return;
        }

        setSelectedFiles(fileArray);
        if (!title.trim() && fileArray.length > 0) {
            setTitle(getTitleFromFile(fileArray[0]));
        }

        const previews: string[] = new Array(fileArray.length);
        let loaded = 0;
        fileArray.forEach((file, index) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                previews[index] = reader.result as string;
                loaded++;
                if (loaded === fileArray.length) {
                    setPreviewUrls([...previews]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
        if (newFiles.length === 0) setTitle("");
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setSelectedFiles([]);
        setPreviewUrls([]);
        setSelectedTags([]);
        setSelectedCategories([]);
        setTagSelectKey((k) => k + 1);
        setCategorySelectKey((k) => k + 1);
    };

    const handleTagSelect = (value: string) => {
        const id = Number(value);
        if (!selectedTags.includes(id)) {
            setSelectedTags((prev) => [...prev, id]);
        }
        setTagSelectKey((k) => k + 1);
    };

    const handleCategorySelect = (value: string) => {
        const id = Number(value);
        if (!selectedCategories.includes(id)) {
            setSelectedCategories((prev) => [...prev, id]);
        }
        setCategorySelectKey((k) => k + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedFiles.length === 0) {
            toast.error("Зураг сонгоно уу");
            return;
        }
        if (!title.trim()) {
            toast.error("Гарчиг оруулна уу");
            return;
        }
        if (!description.trim()) {
            toast.error("Тайлбар оруулна уу");
            return;
        }
        if (selectedTags.length === 0) {
            toast.error("Дор хаяж нэг таг сонгоно уу");
            return;
        }
        if (selectedCategories.length === 0) {
            toast.error("Дор хаяж нэг ангилал сонгоно уу");
            return;
        }

        try {
            setIsSubmitting(true);
            toast.info(`${selectedFiles.length} зураг upload хийж байна...`);

            // ✅ 1-р алхам: файл бүрийг upload хийж filename авна
            const uploadResults = await Promise.all(
                selectedFiles.map((file) => uploadTempMedia(file))
            );

            // Upload алдаа шалгах
            const failedIndex = uploadResults.findIndex(
                (r) => r.status !== 200 && r.status !== 201
            );
            if (failedIndex !== -1) {
                toast.error(
                    `"${selectedFiles[failedIndex].name}" файл upload хийхэд алдаа гарлаа`
                );
                return;
            }

            const filenames = uploadResults
                .map((r) => r.data?.name)  // filename → name
                .filter(Boolean) as string[];

            if (filenames.length !== selectedFiles.length) {
                toast.error("Зарим зургийн нэр авахад алдаа гарлаа");
                return;
            }

            toast.info("Мэдээлэл хадгалж байна...");

            // ✅ 2-р алхам: filename-уудыг createImage-д илгээнэ
            const response = await createImage({
                images: filenames,
                title: title.trim(),
                description: description.trim(),
                tags: selectedTags,
                categories: selectedCategories,
            });

            if (response.status === 200 || response.status === 201) {
                toast.success("Зураг амжилттай хадгалагдлаа");
                resetForm();
                onSuccess();
            } else {
                toast.error(response.error || "Зураг хадгалахад алдаа гарлаа");
            }
        } catch (err: any) {
            toast.error(err.message || "Зураг хадгалахад алдаа гарлаа");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            resetForm();
            onClose();
        }
    };

    if (!isOpen) return null;

    const availableTags = tags.filter((t) => !selectedTags.includes(t.id));
    const availableCategories = categories.filter((c) => !selectedCategories.includes(c.id));

    const isFormValid =
        selectedFiles.length > 0 &&
        title.trim() !== "" &&
        description.trim() !== "" &&
        selectedTags.length > 0 &&
        selectedCategories.length > 0;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <Upload className="h-6 w-6 text-blue-600" />
                        <h2 className="text-2xl font-bold text-slate-800">Шинэ зураг нэмэх</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">

                        {/* Image Upload */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-1">
                                Зураг <span className="text-red-500">*</span>
                            </h3>
                            <p className="text-xs text-slate-400 mb-3">{selectedFiles.length} зураг сонгосон</p>
                            {previewUrls.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4 max-h-40 overflow-y-auto">
                                        {previewUrls.map((url, index) => (
                                            <div
                                                key={index}
                                                className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden group"
                                            >
                                                <Image
                                                    src={url}
                                                    alt={`Preview ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            document.getElementById("modal-file-input")?.click()
                                        }
                                        className="w-full"
                                        disabled={isSubmitting}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Зураг нэмэх
                                    </Button>
                                    <Input
                                        id="modal-file-input"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-42 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="h-12 w-12 text-slate-400 mb-3" />
                                        <p className="mb-2 text-sm text-slate-500">
                                            <span className="font-semibold">Зураг сонгох</span>{" "}
                                            эсвэл чирж оруулах
                                        </p>
                                        <p className="text-xs text-slate-400">PNG, JPG, GIF (MAX. 10MB)</p>
                                    </div>
                                    <Input
                                        id="modal-file-input"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        disabled={isSubmitting}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <label
                                htmlFor="modal-title"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Гарчиг <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="modal-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Зургийн гарчиг..."
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label
                                htmlFor="modal-description"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Тайлбар <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                id="modal-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Зургийн тайлбар..."
                                rows={4}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="flex items-center gap-2 mb-3">
                                <TagIcon className="h-5 w-5 text-slate-600" />
                                <span className="text-sm font-medium text-slate-700">
                                    Таг <span className="text-red-500">*</span>
                                </span>
                            </label>
                            {loading ? (
                                <div className="text-center py-4 text-slate-500 text-sm">
                                    Уншиж байна...
                                </div>
                            ) : (
                                <>
                                    <Select
                                        key={tagSelectKey}
                                        onValueChange={handleTagSelect}
                                        disabled={isSubmitting || availableTags.length === 0}
                                    >
                                        <SelectTrigger className="w-full bg-white">
                                            <SelectValue
                                                placeholder={
                                                    availableTags.length === 0
                                                        ? "Бүх таг сонгогдсон"
                                                        : "Таг нэмэх..."
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent className="z-[1000] bg-white">
                                            {availableTags.map((tag) => (
                                                <SelectItem key={tag.id} value={String(tag.id)}>
                                                    {tag.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <SelectedBadges
                                        ids={selectedTags}
                                        options={tags}
                                        onRemove={(id) =>
                                            setSelectedTags((prev) => prev.filter((t) => t !== id))
                                        }
                                    />
                                </>
                            )}
                        </div>

                        {/* Categories */}
                        <div>
                            <label className="flex items-center gap-2 mb-3">
                                <FolderOpen className="h-5 w-5 text-slate-600" />
                                <span className="text-sm font-medium text-slate-700">
                                    Ангилал <span className="text-red-500">*</span>
                                </span>
                            </label>
                            {loading ? (
                                <div className="text-center py-4 text-slate-500 text-sm">
                                    Уншиж байна...
                                </div>
                            ) : (
                                <>
                                    <Select
                                        key={categorySelectKey}
                                        onValueChange={handleCategorySelect}
                                        disabled={isSubmitting || availableCategories.length === 0}
                                    >
                                        <SelectTrigger className="w-full bg-white">
                                            <SelectValue
                                                placeholder={
                                                    availableCategories.length === 0
                                                        ? "Бүх ангилал сонгогдсон"
                                                        : "Ангилал нэмэх..."
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent className="z-[1000] bg-white">
                                            {availableCategories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={String(category.id)}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <SelectedBadges
                                        ids={selectedCategories}
                                        options={categories}
                                        onRemove={(id) =>
                                            setSelectedCategories((prev) =>
                                                prev.filter((c) => c !== id)
                                            )
                                        }
                                    />
                                </>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Цуцлах
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !isFormValid}
                        className="text-white"
                    >
                        {isSubmitting ? "Хадгалж байна..." : "Хадгалах"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateImageModal;