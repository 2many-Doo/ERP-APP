"use client";

import React from "react";
import { Shield, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PermissionHeaderProps {
  onAddClick: () => void;
  showAddButton?: boolean;
}

export const PermissionHeader: React.FC<PermissionHeaderProps> = ({
  onAddClick,
  showAddButton = true,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-gray-600" />
        <h1 className="text-3xl font-bold text-slate-800">Эрхийн удирдлага</h1>
      </div>
      {showAddButton && (
        <Button className="flex items-center gap-2" onClick={onAddClick}>
          <Plus className="h-4 w-4" />
          Шинэ эрх нэмэх
        </Button>
      )}
    </div>
  );
};

