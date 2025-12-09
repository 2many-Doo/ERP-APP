"use client";

import React from "react";
import { FileText, History } from "lucide-react";

interface MerchantLeaseAgreementsProps {
  leaseAgreements: any[];
}

export const MerchantLeaseAgreements: React.FC<MerchantLeaseAgreementsProps> = ({ leaseAgreements }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Түрээсийн гэрээ
        </h2>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <History className="h-4 w-4" />
          <span>Нийт {leaseAgreements?.length || 0} гэрээ</span>
        </div>
      </div>
      {leaseAgreements && leaseAgreements.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Төлөв</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Огноо</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {leaseAgreements.map((agreement: any) => (
                <tr key={agreement.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-slate-900">#{agreement.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      agreement.status === "active" ? "bg-green-100 text-green-800" :
                      agreement.status === "inactive" ? "bg-red-100 text-red-800" :
                      "bg-slate-100 text-slate-800"
                    }`}>
                      {agreement.status || "Тодорхойгүй"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-600">
                      {agreement.created_at ? new Date(agreement.created_at).toLocaleDateString('mn-MN') : "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          Түрээсийн гэрээ байхгүй
        </div>
      )}
    </div>
  );
};

