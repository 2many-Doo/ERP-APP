import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface Tag {
    id: number;
    name: string;
}

interface TagTableProps {
    tags: Tag[];
    loading: boolean;
    orderby: "name" | "id";
    order: "asc" | "desc";
    handleSort: (column: "name" | "id") => void;
    handleDelete: (tagId: number) => void;
}

const TagTable: React.FC<TagTableProps> = ({
    tags,
    loading,
    orderby,
    order,
    handleSort,
    handleDelete,
}) => {
    const router = useRouter();

    const handleRowClick = (tagId: number, event: React.MouseEvent) => {
        // Don't navigate if clicking on the delete button
        const target = event.target as HTMLElement;
        if (target.closest('button')) {
            return;
        }
        router.push(`/main/file/tag/${tagId}`);
    };

    return (
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
                            <th className="px-6 py-4 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                                Үйлдэл
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                    Уншиж байна...
                                </td>
                            </tr>
                        ) : tags.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                    Таг олдсонгүй
                                </td>
                            </tr>
                        ) : (
                            tags.map((tag) => (
                                <tr
                                    key={tag.id}
                                    onClick={(e) => handleRowClick(tag.id, e)}
                                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-slate-900">
                                            #{tag.id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-900">
                                            {tag.name}
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
                                                    if (window.confirm("Энэ тагыг устгахдаа итгэлтэй байна уу?")) {
                                                        handleDelete(tag.id);
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
    );
};

export default TagTable;
