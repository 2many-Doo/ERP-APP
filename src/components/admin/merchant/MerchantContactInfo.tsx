"use client";

import React from "react";
import { Mail, Phone, MapPin, User } from "lucide-react";
import { Merchant } from "@/hooks/useMerchantManagement";

interface MerchantContactInfoProps {
  merchant: Merchant;
}

export const MerchantContactInfo: React.FC<MerchantContactInfoProps> = ({ merchant }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <User className="h-5 w-5" />
        Холбоо барих мэдээлэл
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {merchant.email && (
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Имэйл</p>
              <p className="text-sm font-medium text-slate-900">{merchant.email}</p>
            </div>
          </div>
        )}
        {(merchant.phone || merchant.contact) && (
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Утас</p>
              <p className="text-sm font-medium text-slate-900">
                {merchant.phone || merchant.contact}
              </p>
            </div>
          </div>
        )}
        {merchant.address && (
          <div className="flex items-center gap-3 md:col-span-2">
            <MapPin className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Хаяг</p>
              <p className="text-sm font-medium text-slate-900">{merchant.address}</p>
            </div>
          </div>
        )}
        {merchant.address_description && (
          <div className="flex items-center gap-3 md:col-span-2">
            <MapPin className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Хаягын дэлгэрэнгүй</p>
              <p className="text-sm font-medium text-slate-900">{merchant.address_description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

