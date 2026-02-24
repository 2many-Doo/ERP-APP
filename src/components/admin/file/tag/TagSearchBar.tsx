import React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TagSearchBarProps {
    localSearch: string;
    setLocalSearch: (value: string) => void;
    handleSearch: () => void;
    loading: boolean;
}

const TagSearchBar: React.FC<TagSearchBarProps> = ({
    localSearch,
    setLocalSearch,
    handleSearch,
    loading,
}) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-4">
                <div className="flex-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-300 focus-within:bg-white">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Таг хайх..."
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
    );
};

export default TagSearchBar;
