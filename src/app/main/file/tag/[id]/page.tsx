"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getTagById, updateTag } from "@/lib/api";
import { ArrowLeft, Tag as TagIcon, Calendar, Image as ImageIcon, Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface FileLibrary {
    id: number;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    user_id: number | null;
    image: {
        id: number;
        url: string;
        thumbnail: string;
        preview: string;
        original_url: string;
        preview_url: string;
        file_name: string;
        mime_type: string;
        size: number;
    };
}

interface TagDetail {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    tag_file_libraries: FileLibrary[];
}

const TagDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const tagId = params?.id;

    const [tag, setTag] = useState<TagDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editTagName, setEditTagName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ src: string; title?: string } | null>(null);

    useEffect(() => {
        if (tagId) {
            fetchTagDetail(Number(tagId));
        }
    }, [tagId]);

    const fetchTagDetail = async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getTagById(id);

            if (response.status === 200 && response.data) {
                setTag(response.data);
            } else {
                setError(response.error || "Таг олдсонгүй");
                toast.error("Таг татахад алдаа гарлаа");
            }
        } catch (err: any) {
            console.error("Error fetching tag:", err);
            setError(err.message || "Алдаа гарлаа");
            toast.error("Таг татахад алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${year}.${month}.${day} ${hours}:${minutes}`;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    const handleEditClick = () => {
        if (tag) {
            setEditTagName(tag.name);
            setIsEditModalOpen(true);
        }
    };

    const handleUpdateTag = async () => {
        if (!editTagName.trim()) {
            toast.error("Таг нэр оруулна уу");
            return;
        }

        if (!tag) return;

        try {
            setIsSubmitting(true);
            const response = await updateTag(tag.id, { name: editTagName.trim() });

            if (response.status === 200 || response.status === 201) {
                toast.success("Таг амжилттай засагдлаа");
                setIsEditModalOpen(false);
                fetchTagDetail(tag.id); // Refresh data
            } else {
                toast.error(response.error || "Таг засахад алдаа гарлаа");
            }
        } catch (err: any) {
            console.error("Error updating tag:", err);
            toast.error(err.message || "Таг засахад алдаа гарлаа");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModalClose = () => {
        setIsEditModalOpen(false);
        setEditTagName("");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Уншиж байна...</p>
                </div>
            </div>
        );
    }

    if (error || !tag) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || "Таг олдсонгүй"}</p>
                    <Button onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Буцах
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Буцах
                    </Button>
                    <div className="flex items-center gap-3">
                        <TagIcon className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">
                                {tag.name}
                            </h1>
                            <p className="text-sm text-slate-500">Таг #{tag.id}</p>
                        </div>
                    </div>
                </div>
                <Button
                    onClick={handleEditClick}
                    className="flex items-center gap-2"
                >
                    <Edit className="h-4 w-4" />
                    Засах
                </Button>
            </div>

            {/* Tag Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                    Мэдээлэл
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-slate-700">Үүсгэсэн огноо</p>
                            <p className="text-sm text-slate-600">{formatDate(tag.created_at)}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-slate-700">Зассан огноо</p>
                            <p className="text-sm text-slate-600">{formatDate(tag.updated_at)}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <ImageIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-slate-700">Зургийн тоо</p>
                            <p className="text-sm text-slate-600">
                                {tag.tag_file_libraries?.length || 0} зураг
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Images Grid */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                    Холбогдох зургууд ({tag.tag_file_libraries?.length || 0})
                </h2>

                {tag.tag_file_libraries && tag.tag_file_libraries.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {tag.tag_file_libraries.map((fileLibrary) => (
                            <div
                                key={fileLibrary.id}
                                className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:shadow-md transition"
                                onClick={() =>
                                    setSelectedImage({
                                        src: fileLibrary.image.preview || fileLibrary.image.url,
                                        title: fileLibrary.title,
                                    })
                                }
                            >
                                {/* Image */}
                                <div className="relative aspect-square bg-slate-100">
                                    <Image
                                        src={fileLibrary.image.preview || fileLibrary.image.url}
                                        alt={fileLibrary.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Энэ тагт холбогдох зураг байхгүй байна</p>
                    </div>
                )}
            </div>

            {/* Edit Tag Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <h2 className="text-xl font-semibold text-slate-800">
                                Таг засах
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
                                <label htmlFor="editTagName" className="block text-sm font-medium text-slate-700 mb-2">
                                    Таг нэр
                                </label>
                                <Input
                                    id="editTagName"
                                    type="text"
                                    value={editTagName}
                                    onChange={(e) => setEditTagName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !isSubmitting) {
                                            e.preventDefault();
                                            handleUpdateTag();
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
                                onClick={handleUpdateTag}
                                disabled={isSubmitting || !editTagName.trim()}
                                className="text-white"
                            >
                                {isSubmitting ? "Засаж байна..." : "Засах"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Lightbox */}
            {selectedImage && (
                <div className="fixed inset-0 z-[12000] bg-black/70 flex items-center justify-center px-4">
                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-3 right-3 z-[12010] rounded-full bg-black/60 text-white p-2 hover:bg-black/80 transition"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="relative w-full h-[70vh] bg-black">
                            <Image
                                src={selectedImage.src}
                                alt={selectedImage.title || "preview"}
                                fill
                                className="object-contain"
                                sizes="100vw"
                                priority
                            />
                        </div>
                        {selectedImage.title && (
                            <div className="p-4 border-t border-slate-200">
                                <p className="text-sm font-semibold text-slate-800 line-clamp-2">
                                    {selectedImage.title}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TagDetailPage;
