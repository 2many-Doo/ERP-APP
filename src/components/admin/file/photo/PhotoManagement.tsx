"use client";

import React, { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { Image as ImageIcon, Plus, Search, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateImageModal from "./CreateImageModal";
import { searchImages } from "@/lib/api";

interface Photo {
    id: number;
    title: string;
    description: string;
    url?: string;
    thumbnail?: string;
    preview?: string;
    image?: {
        url?: string;
        thumbnail?: string;
        preview?: string;
        original_url?: string;
    };
}

const PhotoManagement = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(false);
    const [localSearch, setLocalSearch] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const pickImageUrl = (photo: Photo) =>
        photo.thumbnail ||
        photo.preview ||
        photo.url ||
        photo.image?.thumbnail ||
        photo.image?.preview ||
        photo.image?.url ||
        photo.image?.original_url ||
        "";

    const parsePhotos = (raw: any): Photo[] => {
        const collection = Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.data)
                ? raw.data
                : Array.isArray(raw?.data?.data)
                    ? raw.data.data
                    : [];

        return collection
            .filter((item: any) => item && typeof item === "object")
            .map((item: any) => ({
                id:
                    Number(item.id ?? item.image_id ?? item?.image?.id) ||
                    Date.now() + Math.random(),
                title: item.title ?? item.name ?? "No title",
                description: item.description ?? item.alt ?? "",
                url: item.url ?? item.file_url,
                thumbnail: item.thumbnail ?? item.thumb,
                preview: item.preview ?? item.preview_url,
                image: item.image,
            }));
    };

    const fetchPhotos = async (term?: string) => {
        const query = term ?? localSearch;
        try {
            setLoading(true);
            const response = await searchImages({ q: query || undefined });
            if (response.status === 200 || response.status === 201) {
                const parsed = parsePhotos(response.data);
                setPhotos(parsed);
            } else {
                toast.error(response.error || "Зураг татахад алдаа гарлаа");
            }
        } catch (err: any) {
            console.error("Error fetching photos:", err);
            toast.error("Зураг татахад алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPhotos("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handle = setTimeout(() => {
            fetchPhotos(localSearch.trim());
        }, 400);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localSearch]);

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        fetchPhotos(); // Refresh list
    };

    const photoCards = useMemo(
        () =>
            photos.map((photo) => {
                const src = pickImageUrl(photo);
                return (
                    <div
                        key={photo.id}
                        className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200"
                    >
                        <div className="relative aspect-square bg-slate-100">
                            {src ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={src}
                                    alt={photo.title}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">
                                    <ImageIcon className="h-8 w-8" />
                                </div>
                            )}
                        </div>
                        <div className="p-3 space-y-1">
                            <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                                {photo.title || "Гарчиггүй"}
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-2">
                                {photo.description || "Тайлбар алга"}
                            </p>
                        </div>
                    </div>
                );
            }),
        [photos]
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ImageIcon className="h-8 w-8 text-gray-600" />
                    <h1 className="text-3xl font-bold text-slate-800">
                        Зургийн сан
                    </h1>
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    className="flex items-center gap-2"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                    Зураг нэмэх
                </Button>
            </div>

            {/* Search & View Mode */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-300 focus-within:bg-white">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Зураг хайх..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fetchPhotos(localSearch.trim())}
                        disabled={loading}
                    >
                        Хайх
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant={viewMode === "grid" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("grid")}
                        >
                            <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={viewMode === "list" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("list")}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-slate-600">Уншиж байна...</p>
                    </div>
                ) : photos.length === 0 ? (
                    <div className="text-center py-12">
                        <ImageIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-700 mb-2">
                            Зураг байхгүй байна
                        </h3>
                        {/* <p className="text-slate-500 mb-4">
                            Эхний зургаа нэмэхийн тулд дээрх товчийг дарна уу
                        </p>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Зураг нэмэх
                        </Button> */}
                    </div>
                ) : (
                    <div
                        className={
                            viewMode === "grid"
                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                                : "space-y-4"
                        }
                    >
                        {viewMode === "grid" ? (
                            photoCards
                        ) : (
                            photos.map((photo) => {
                                const src = pickImageUrl(photo);
                                return (
                                    <div
                                        key={photo.id}
                                        className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
                                    >
                                        <div className="relative h-16 w-16 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                                            {src ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={src}
                                                    alt={photo.title}
                                                    className="object-cover h-full w-full"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-slate-400">
                                                    <ImageIcon className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                                                {photo.title || "Гарчиггүй"}
                                            </p>
                                            <p className="text-xs text-slate-500 line-clamp-2">
                                                {photo.description || "Тайлбар алга"}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Create Image Modal */}
            <CreateImageModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
};

export default PhotoManagement;