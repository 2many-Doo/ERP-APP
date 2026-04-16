"use client";

import React, { useMemo } from "react";
import { Button } from "../../../../ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { SmsBlock } from "@/lib/api";
import {
  BlockLoadingSkeleton,
  BlockEmptyState,
} from "../BlockLoadingSkeleton";
import { Download } from "lucide-react";

interface BlockSelectorProps {
  blocks: SmsBlock[];
  selectedBlockIds: number[];
  onSelectedChange: (ids: number[]) => void;
  loadingBlocks: boolean;
  loadingNumbers: boolean;
  onFetchSelected: () => void;
}

export const BlockSelector: React.FC<BlockSelectorProps> = ({
  blocks,
  selectedBlockIds,
  onSelectedChange,
  loadingBlocks,
  loadingNumbers,
  onFetchSelected,
}) => {
  const options = useMemo(
    () => blocks.map((b) => ({ value: b.id, label: b.name })),
    [blocks],
  );

  return (
    <div className="rounded-lg space-y-2">
      {loadingBlocks ? (
        <BlockLoadingSkeleton />
      ) : blocks.length === 0 ? (
        <BlockEmptyState />
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3">
          <div className="flex min-h-9 w-4/5">
            <MultiSelect
              options={options}
              selected={selectedBlockIds}
              onChange={onSelectedChange}
              disabled={loadingNumbers}
              placeholder="Блок сонгох..."
              className="w-full min-h-9 text-sm bg-white"
            />
          </div>
          <div className="flex w-1/5 gap-2 sm:max-w-xs sm:shrink-0 sm:items-stretch">
            <Button
              type="button"
              variant="default"
              disabled={loadingNumbers || selectedBlockIds.length === 0}
              onClick={onFetchSelected}
              className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 px-3 text-sm"
            >
              {loadingNumbers ? (
                <>
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border-2 border-white/70 border-t-transparent animate-spin"
                    aria-hidden
                  />
                  <span className="truncate text-[10px] text-center">Татаж байна...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    татах
                    {selectedBlockIds.length > 0
                      ? ` (${selectedBlockIds.length})`
                      : ""}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
