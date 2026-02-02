"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../ui/select";
import { SmsBlock } from "@/lib/api";
import {
  BlockLoadingSkeleton,
  BlockEmptyState,
  NumbersLoadingSpinner,
} from "../BlockLoadingSkeleton";

interface BlockSelectorProps {
  blocks: SmsBlock[];
  selectedBlock: string;
  loadingBlocks: boolean;
  loadingNumbers: boolean;
  onBlockSelect: (blockId: string) => void;
}

export const BlockSelector: React.FC<BlockSelectorProps> = ({
  blocks,
  selectedBlock,
  loadingBlocks,
  loadingNumbers,
  onBlockSelect,
}) => {
  return (
    <div className="rounded-lg space-y-2">
      {loadingBlocks ? (
        <BlockLoadingSkeleton />
      ) : blocks.length === 0 ? (
        <BlockEmptyState />
      ) : (
        <div className="flex gap-2">
          <Select
            value={selectedBlock}
            onValueChange={onBlockSelect}
            disabled={loadingNumbers}
          >
            <SelectTrigger className="flex-1 text-sm border-blue-300 focus:ring-blue-500 bg-white">
              <SelectValue placeholder="Блок сонгож дугаар нэмэх..." />
            </SelectTrigger>
            <SelectContent className="bg-white z-100">
              {blocks.map((block) => (
                <SelectItem key={block.id} value={String(block.id)}>
                  {block.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {loadingNumbers && <NumbersLoadingSpinner />}
        </div>
      )}
    </div>
  );
};
