"use client";

import React from "react";
import { Building, History } from "lucide-react";

interface MerchantPropertiesProps {
  properties: any[];
}

export const MerchantProperties: React.FC<MerchantPropertiesProps> = ({ properties }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Building className="h-5 w-5" />
          Талбай
        </h2>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <History className="h-4 w-4" />
          <span>Нийт {properties?.length || 0} талбай</span>
        </div>
      </div>
      {properties && properties.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Дугаар</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Нэр</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {properties.map((property: any) => (
                <tr key={property.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-slate-900">#{property.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-600">{property.number || "-"}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-600">{property.name || "-"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          Талбай байхгүй
        </div>
      )}
    </div>
  );
};

