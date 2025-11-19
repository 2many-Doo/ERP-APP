"use client";

import React from "react";
import { Tenant } from "./types";

interface TenantStatisticsProps {
  tenants: Tenant[];
  loading: boolean;
}

export const TenantStatistics: React.FC<TenantStatisticsProps> = ({ tenants, loading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <p className="text-sm text-slate-500">Нийт хүсэлт</p>
        {loading ? (
          <div className="h-8 w-16 bg-slate-200 rounded animate-pulse mt-1"></div>
        ) : (
          <p className="text-2xl font-bold text-slate-900 mt-1">{tenants.length}</p>
        )}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <p className="text-sm text-slate-500">Ангилал</p>
        {loading ? (
          <div className="h-8 w-24 bg-slate-200 rounded animate-pulse mt-1"></div>
        ) : (
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {new Set(tenants.map((t) => t.category)).size}
          </p>
        )}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <p className="text-sm text-slate-500">Үйл ажиллагааны төрөл</p>
        {loading ? (
          <div className="h-8 w-24 bg-slate-200 rounded animate-pulse mt-1"></div>
        ) : (
          <p className="text-2xl font-bold text-green-600 mt-1">
            {new Set(tenants.map((t) => t.businessType)).size}
          </p>
        )}
      </div>
    </div>
  );
};

