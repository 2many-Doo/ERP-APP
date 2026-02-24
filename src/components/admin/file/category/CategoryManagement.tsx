"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getCategories, createCategory } from "@/lib/api";
import { FolderOpen, Search, Plus, Trash2, ArrowUpDown, ArrowUp, ArrowDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Category {
    id: number;
    name: string;
    description: string;
}

const CategoryManagement = () => {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [localSearch, setLocalSearch] = useState("");
    const [orderby, setOrderby] = useState<"name" | "id">("id");
    const [order, setOrder] = useState<"asc" | "desc">("asc");

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryDescription, setNewCategoryDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getCategories();

            const dataValues = Object.values(res.data || {});
            const categoriesArray = dataValues.filter(
                (item: any): item is Category =>
                    typeof item === 'object' &&
                    item !== null &&
                    'id' in item &&
                    'name' in item &&
                    typeof item.id === 'number' &&
                    typeof item.name === 'string'
            );

            setCategories(categoriesArray);
        } catch (err: any) {
            console.error("Error fetching categories:", err);
            setError(err.message || "Алдаа гарлаа");
            toast.error("Категори татахад алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSort = (column: "name" | "id") => {
        if (orderby === column) {
            setOrder(order === "asc" ? "desc" : "asc");
        } else {
            setOrderby(column);
            setOrder("asc");
        }
    };

    const handleSearch = () => {
        toast.info("Хайлт хийгдэж байна...");
    };

    const handleDelete = (categoryId: number) => {
        toast.info("Устгах функц хараахан хийгдээгүй байна");
    };

    const sortedCategories = [...categories].sort((a, b) => {
        if (orderby === "name") {
            return order === "asc"
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        } else {
            return order === "asc" ? a.id - b.id : b.id - a.id;
        }
    });

    const filteredCategories = sortedCategories.filter(category =>
        category.name.toLowerCase().includes(localSearch.toLowerCase()) ||
        category.description?.toLowerCase().includes(localSearch.toLowerCase())
    );

    const handleRowClick = (categoryId: number, event: React.MouseEvent) => {
        // Don't navigate if clicking on a button
        const target = event.target as HTMLElement;
        if (target.closest('button')) {
            return;
        }
        router.push(`/main/file/category/${categoryId}`);
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error("Категори нэр оруулна уу");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await createCategory({
                name: newCategoryName.trim(),
                description: newCategoryDescription.trim(),
            });

            if (response.status === 200 || response.status === 201) {
                toast.success("Категори амжилттай үүслээ");
                setIsModalOpen(false);
                setNewCategoryName("");
                setNewCategoryDescription("");
                fetchCategories(); // Refresh the list
            } else {
                toast.error(response.error || "Категори үүсгэхэд алдаа гарлаа");
            }
        } catch (err: any) {
            console.error("Error creating category:", err);
            toast.error(err.message || "Категори үүсгэхэд алдаа гарлаа");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setNewCategoryName("");
        setNewCategoryDescription("");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FolderOpen className="h-8 w-8 text-gray-600" />
                    <h1 className="text-3xl font-bold text-slate-800">
                        Ангилал
                    </h1>
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    className="flex items-center gap-2"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                    Шинэ категори нэмэх
                </Button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-300 focus-within:bg-white">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Категори хайх..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSearch();
                                }
                            }}
                            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        Хайх
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort("id")}
                                        className="flex items-center gap-1 hover:text-blue-600"
                                    >
                                        ID
                                        {orderby === "id" ? (
                                            order === "asc" ? (
                                                <ArrowUp className="h-3 w-3" />
                                            ) : (
                                                <ArrowDown className="h-3 w-3" />
                                            )
                                        ) : (
                                            <ArrowUpDown className="h-3 w-3 opacity-50" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort("name")}
                                        className="flex items-center gap-1 hover:text-blue-600"
                                    >
                                        Нэр
                                        {orderby === "name" ? (
                                            order === "asc" ? (
                                                <ArrowUp className="h-3 w-3" />
                                            ) : (
                                                <ArrowDown className="h-3 w-3" />
                                            )
                                        ) : (
                                            <ArrowUpDown className="h-3 w-3 opacity-50" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                                    Тайлбар
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                                    Үйлдэл
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        Уншиж байна...
                                    </td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        Категори олдсонгүй
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr
                                        key={category.id}
                                        onClick={(e) => handleRowClick(category.id, e)}
                                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-slate-900">
                                                #{category.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-900">
                                                {category.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600 max-w-md truncate">
                                                {category.description || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm("Энэ категорийг устгахдаа итгэлтэй байна уу?")) {
                                                            handleDelete(category.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Category Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <h2 className="text-xl font-semibold text-slate-800">
                                Шинэ категори нэмэх
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
                                <label htmlFor="categoryName" className="block text-sm font-medium text-slate-700 mb-2">
                                    Категори нэр
                                </label>
                                <Input
                                    id="categoryName"
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Категори нэр оруулах..."
                                    className="w-full"
                                    disabled={isSubmitting}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label htmlFor="categoryDescription" className="block text-sm font-medium text-slate-700 mb-2">
                                    Тайлбар
                                </label>
                                <Textarea
                                    id="categoryDescription"
                                    value={newCategoryDescription}
                                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                                    placeholder="Тайлбар оруулах..."
                                    className="w-full"
                                    rows={3}
                                    disabled={isSubmitting}
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
                                onClick={handleCreateCategory}
                                disabled={isSubmitting || !newCategoryName.trim()}
                                className="text-white"
                            >
                                {isSubmitting ? "Үүсгэж байна..." : "Үүсгэх"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;