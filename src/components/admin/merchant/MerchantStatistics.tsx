"use client";

import React from "react";
import { Merchant } from "@/hooks/useMerchantManagement";
import { FileText, CheckCircle2, XCircle, Building } from "lucide-react";

interface MerchantStatisticsProps {
  merchant: Merchant;
}

export const MerchantStatistics: React.FC<MerchantStatisticsProps> = ({ merchant }) => {
  const getStatusDisplay = (status: string | undefined): string => {
    if (!status) return "Тодорхойгүй";
    if (status === "active" || status === "Идэвхтэй") return "Идэвхтэй";
    if (status === "inactive" || status === "Идэвхгүй") return "Идэвхгүй";
    return status;
  };

  const getTypeDisplay = (type: string | undefined): string => {
    if (!type) return "Тодорхойгүй";
    if (type === "individual") return "Хувь хүн";
    if (type === "company" || type === "business") return "Байгууллага";
    return type;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Мерчант ID</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">#{merchant.id}</p>
          </div>
          <FileText className="h-8 w-8 text-blue-500 opacity-50" />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Төлөв</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {getStatusDisplay(merchant.status)}
            </p>
          </div>
          {merchant.status === "active" || merchant.status === "Идэвхтэй" ? (
            <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
          ) : (
            <XCircle className="h-8 w-8 text-red-500 opacity-50" />
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Төрөл</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {getTypeDisplay((merchant as any).type)}
            </p>
          </div>
          <Building className="h-8 w-8 text-blue-500 opacity-50" />
        </div>
      </div>
    </div>
  );
};

