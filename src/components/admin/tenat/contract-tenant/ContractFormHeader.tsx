"use client";

import React from "react";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "../../../ui/button";

interface ContractFormHeaderProps {
  tenantName: string;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  hideBack?: boolean; // ✅ boolean болгоно
}

export const ContractFormHeader: React.FC<ContractFormHeaderProps> = ({
  onBack,
  onEdit,
  onDelete,
  hideBack = false,
}) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {!hideBack && (
          <Button
            variant="back"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Буцах
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onEdit && (
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
            Засах
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outline"
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            Устгах
          </Button>
        )}
      </div>
    </div>
  );
};
