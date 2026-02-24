"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { getTags, createTag, deleteTag } from "@/lib/api";
import TagHeader from "./TagHeader";
import TagSearchBar from "./TagSearchBar";
import TagTable from "./TagTable";
import TagModal from "./TagModal";

interface Tag {
    id: number;
    name: string;
}

const TagManagement = () => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [localSearch, setLocalSearch] = useState("");
    const [orderby, setOrderby] = useState<"name" | "id">("id");
    const [order, setOrder] = useState<"asc" | "desc">("asc");

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTagName, setNewTagName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTags = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getTags();

            const dataValues = Object.values(res.data || {});
            const tagsArray = dataValues.filter(
                (item: any): item is Tag =>
                    typeof item === 'object' &&
                    item !== null &&
                    'id' in item &&
                    'name' in item &&
                    typeof item.id === 'number' &&
                    typeof item.name === 'string'
            );

            setTags(tagsArray);
        } catch (err: any) {
            console.error("Error fetching tags:", err);
            setError(err.message || "Алдаа гарлаа");
            toast.error("Таг татахад алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
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
        // Implement search logic
        toast.info("Хайлт хийгдэж байна...");
    };

    const handleDelete = async (tagId: number) => {
        try {
            setLoading(true);
            const response = await deleteTag(tagId);

            if (response.status === 200 || response.status === 204) {
                toast.success("Таг амжилттай устгагдлаа");
                fetchTags(); // Refresh the list
            } else {
                toast.error(response.error || "Таг устгахад алдаа гарлаа");
            }
        } catch (err: any) {
            console.error("Error deleting tag:", err);
            toast.error(err.message || "Таг устгахад алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) {
            toast.error("Таг нэр оруулна уу");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await createTag({ name: newTagName.trim() });

            if (response.status === 200 || response.status === 201) {
                toast.success("Таг амжилттай үүслээ");
                setIsModalOpen(false);
                setNewTagName("");
                fetchTags(); // Refresh the list
            } else {
                toast.error(response.error || "Таг үүсгэхэд алдаа гарлаа");
            }
        } catch (err: any) {
            console.error("Error creating tag:", err);
            toast.error(err.message || "Таг үүсгэхэд алдаа гарлаа");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setNewTagName("");
    };

    const sortedTags = [...tags].sort((a, b) => {
        if (orderby === "name") {
            return order === "asc"
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        } else {
            return order === "asc" ? a.id - b.id : b.id - a.id;
        }
    });

    const filteredTags = sortedTags.filter(tag =>
        tag.name.toLowerCase().includes(localSearch.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <TagHeader onAddClick={() => setIsModalOpen(true)} />

            <TagSearchBar
                localSearch={localSearch}
                setLocalSearch={setLocalSearch}
                handleSearch={handleSearch}
                loading={loading}
            />

            <TagTable
                tags={filteredTags}
                loading={loading}
                orderby={orderby}
                order={order}
                handleSort={handleSort}
                handleDelete={handleDelete}
            />

            <TagModal
                isOpen={isModalOpen}
                newTagName={newTagName}
                setNewTagName={setNewTagName}
                isSubmitting={isSubmitting}
                handleCreateTag={handleCreateTag}
                handleModalClose={handleModalClose}
            />
        </div>
    );
};

export default TagManagement;