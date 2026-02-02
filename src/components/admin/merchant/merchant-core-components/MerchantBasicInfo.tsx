"use client";

import React from "react";
import { FileText } from "lucide-react";
import { Merchant } from "@/hooks/useMerchantManagement";

interface MerchantBasicInfoProps {
  merchant: Merchant;
}

export const MerchantBasicInfo: React.FC<MerchantBasicInfoProps> = ({ merchant }) => {
  const getTypeDisplay = (type: string | undefined): string => {
    if (!type) return "Тодорхойгүй";
    if (type === "individual") return "Хувь хүн";
    if (type === "company" || type === "business") return "Байгууллага";
    return type;
  };

  const getStatusDisplay = (status: string | undefined): string => {
    if (!status) return "Тодорхойгүй";
    if (status === "active" || status === "Идэвхтэй") return "Идэвхтэй";
    if (status === "inactive" || status === "Идэвхгүй") return "Идэвхгүй";
    return status;
  };

  const getStatusColor = (status: string | undefined): string => {
    if (status === "active" || status === "Идэвхтэй") {
      return "bg-green-100 text-green-800";
    }
    if (status === "inactive" || status === "Идэвхгүй") {
      return "bg-red-100 text-red-800";
    }
    return "bg-slate-100 text-slate-800";
  };

  const getGenderDisplay = (gender: string | undefined): string => {
    if (!gender) return "Тодорхойгүй";
    if (gender === "male") return "Эрэгтэй";
    if (gender === "female") return "Эмэгтэй";
    return gender;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Үндсэн мэдээлэл
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {merchant.family_name && (
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Ургийн овог</p>
            <p className="text-sm font-medium text-slate-900">{merchant.family_name}</p>
          </div>
        )}
        {merchant.last_name && (
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Эцэг/эхийн нэр</p>
            <p className="text-sm font-medium text-slate-900">{merchant.last_name}</p>
          </div>
        )}
        {merchant.first_name && (
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Өөрийн нэр</p>
            <p className="text-sm font-medium text-slate-900">{merchant.first_name}</p>
          </div>
        )}
        {(merchant as any).gender && (
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Хүйс</p>
            <p className="text-sm font-medium text-slate-900">{getGenderDisplay((merchant as any).gender)}</p>
          </div>
        )}
        {(merchant as any).created_at && (
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Үүсгэсэн огноо</p>
            <p className="text-sm font-medium text-slate-900">
              {new Date((merchant as any).created_at).toLocaleDateString('mn-MN')}
            </p>
          </div>
        )}
        {(merchant as any).rd && (
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Регистрийн дугаар</p>
            <p className="text-sm font-medium text-slate-900">{(merchant as any).rd}</p>
          </div>
        )}
        {merchant.code && (
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Мерчант код</p>
            <p className="text-sm font-medium text-slate-900">{merchant.code}</p>
          </div>
        )}
        {(merchant as any).owner_id && (
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Эзэмшлийн ID</p>
            <p className="text-sm font-medium text-slate-900">#{(merchant as any).owner_id}</p>
          </div>
        )}
      </div>
    </div>
  );
};

