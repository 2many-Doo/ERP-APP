"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Store } from "lucide-react";
import { Merchant } from "@/hooks/useMerchantManagement";

interface MerchantHeaderProps {
  merchant: Merchant;
  onBack: () => void;
  onEdit?: (merchant: Merchant) => void;
  onDelete?: (merchantId: number) => void;
}

export const MerchantHeader: React.FC<MerchantHeaderProps> = ({
  merchant,
  onBack,
  onEdit,
  onDelete,
}) => {
  const getMerchantName = () => {
    if (merchant.name) return merchant.name;
    if (merchant.first_name && merchant.last_name && merchant.family_name) {
      return `${merchant.family_name} ${merchant.last_name} ${merchant.first_name}`;
    }
    return merchant.first_name || merchant.last_name || merchant.family_name || `Мерчант #${merchant.id}`;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="back"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Буцах
        </Button>
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{getMerchantName()}</h1>
            {merchant.email && (
              <p className="text-sm text-slate-500">{merchant.email}</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => onEdit?.(merchant)}
        >
          <Edit className="h-4 w-4" />
          Засах
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2 text-red-600 hover:text-red-700"
          onClick={() => {
            if (window.confirm("Энэ мерчантыг устгахдаа итгэлтэй байна уу?")) {
              onDelete?.(merchant.id);
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
          Устгах
        </Button>
      </div>
    </div>
  );
};

