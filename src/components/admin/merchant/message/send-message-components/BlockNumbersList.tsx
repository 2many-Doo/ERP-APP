"use client";

import React from "react";
import { Eye, Trash2, Users, X } from "lucide-react";
import { Button } from "../../../../ui/button";
import { toast } from "sonner";

interface BlockNumbersListProps {
  blockNumbers: string[];
  onClear: () => void;
  onShowAll: () => void;
  onRemoveNumber: (phone: string) => void;
}

export const BlockNumbersList: React.FC<BlockNumbersListProps> = ({
  blockNumbers,
  onClear,
  onShowAll,
  onRemoveNumber,
}) => {
  if (blockNumbers.length === 0) return null;

  return (
    <div className="rounded-lg p-2 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Блок жагсаалт ({blockNumbers.length})
        </h4>
        <div className="flex gap-2 items-center justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClear}
            className=""
          >
            <Trash2 className="h-4 w-4 " />
            Арилгах
          </Button>
          {blockNumbers.length > 15 && (
            <Button
              type="button"
              variant="outline"
              onClick={onShowAll}
              className=""
            >
              <Eye className="h-4 w-4" />
              харах
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto p-2 bg-white rounded">
        {blockNumbers.map((phone, idx) => (
          <span
            key={idx}
            className="relative group inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-300 text-blue-800 text-xs rounded shadow-sm"
          >
            {phone}
            <button
              onClick={() => onRemoveNumber(phone)}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
              title="Хасах"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )).slice(0, 6)}
      </div>
    </div>
  );
};
