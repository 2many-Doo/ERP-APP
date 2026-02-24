"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Image as ImageIcon, Plus, Search, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateImageModal from "./CreateImageModal";

interface Photo {
    id: number;
    title: string;
    description: string;
    url: string;
    thumbnail: string;
}

const PhotoManagement = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(false);
    const [localSearch, setLocalSearch] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchPhotos = async () => {
        try {
            setLoading(true);
            // TODO: Implement API call
            // const response = await getPhotos();
            // setPhotos(response.data);

            // Temporary empty state
            setPhotos([]);
        } catch (err: any) {
            console.error("Error fetching photos:", err);
            toast.error("Зураг татахад алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, []);

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        fetchPhotos(); // Refresh list
    };

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
                    <div className={viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        : "space-y-4"
                    }>
                        {/* TODO: Render photos */}
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