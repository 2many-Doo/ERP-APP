"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface PermissionPaginationProps {
  total: number;
}

export const PermissionPagination: React.FC<PermissionPaginationProps> = ({
  total,
}) => {
  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4">
      <div className="text-sm text-slate-600">
        Нийт <span className="font-medium">{total}</span> эрх
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled>
          Өмнөх
        </Button>
        <span className="text-sm text-slate-600">1 / 1</span>
        <Button variant="outline" size="sm" disabled>
          Дараах
        </Button>
      </div>
    </div>
  );
};

