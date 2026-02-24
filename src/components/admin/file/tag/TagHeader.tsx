import React from "react";
import { Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TagHeaderProps {
    onAddClick: () => void;
}

const TagHeader: React.FC<TagHeaderProps> = ({ onAddClick }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Tag className="h-8 w-8 text-gray-600" />
                <h1 className="text-3xl font-bold text-slate-800">
                    Таг удирдлага
                </h1>
            </div>
            <Button
                type="button"
                variant="secondary"
                className="flex items-center gap-2"
                onClick={onAddClick}
            >
                <Plus className="h-4 w-4" />
                Шинэ таг нэмэх
            </Button>
        </div>
    );
};

export default TagHeader;
