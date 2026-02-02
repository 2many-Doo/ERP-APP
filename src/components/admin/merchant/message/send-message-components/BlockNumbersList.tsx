"use client";

import React from "react";
import { Users } from "lucide-react";
import { Button } from "../../../../ui/button";
import { toast } from "sonner";

interface BlockNumbersListProps {
  blockNumbers: string[];
  onClear: () => void;
  onRemoveDuplicates: () => void;
  onShowAll: () => void;
}

export const BlockNumbersList: React.FC<BlockNumbersListProps> = ({
  blockNumbers,
  onClear,
  onRemoveDuplicates,
  onShowAll,
}) => {
  if (blockNumbers.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Блок жагсаалт ({blockNumbers.length})
        </h4>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const unique = Array.from(new Set(blockNumbers));
              if (unique.length === blockNumbers.length) {
                toast.info("Давхардал байхгүй байна");
              } else {
                onRemoveDuplicates();
                toast.success(`Давхардал арилсан: ${blockNumbers.length} → ${unique.length}`);
              }
            }}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7 px-2 text-xs"
          >
            Давхардал арилгах
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
          >
            Бүгдийг арилгах
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto p-2 bg-white rounded">
        {blockNumbers.map((phone, idx) => (
          <span
            key={idx}
            className="inline-flex items-center px-2 py-1 bg-blue-50 border border-blue-300 text-blue-800 text-xs rounded shadow-sm"
          >
            {phone}
          </span>
        ))}
      </div>
      {blockNumbers.length > 15 && (
        <button
          type="button"
          onClick={onShowAll}
          className="text-xs text-blue-600 hover:text-blue-700 underline mt-2"
        >
          Бүх дугаарыг том цонхоор харах
        </button>
      )}
    </div>
  );
};
