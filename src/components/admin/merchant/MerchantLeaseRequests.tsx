"use client";

import React from "react";
import { FileCheck, History } from "lucide-react";

interface MerchantLeaseRequestsProps {
  leaseRequests: any[];
}

export const MerchantLeaseRequests: React.FC<MerchantLeaseRequestsProps> = ({ leaseRequests }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Түрээсийн хүсэлт
        </h2>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <History className="h-4 w-4" />
          <span>Нийт {leaseRequests?.length || 0} хүсэлт</span>
        </div>
      </div>
      {leaseRequests && leaseRequests.length > 0 ? (
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
              {leaseRequests.map((request: any) => (
                <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-slate-900">#{request.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      request.status === "approved" ? "bg-green-100 text-green-800" :
                      request.status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {request.status || "Тодорхойгүй"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-600">
                      {request.created_at ? new Date(request.created_at).toLocaleDateString('mn-MN') : "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          Түрээсийн хүсэлт байхгүй
        </div>
      )}
    </div>
  );
};

