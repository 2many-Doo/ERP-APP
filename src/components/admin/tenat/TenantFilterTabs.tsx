"use client";

import React from "react";
import { FilterType, Tenant } from "./types";

interface TenantFilterTabsProps {
  filterType: FilterType;
  onFilterChange: (type: FilterType) => void;
  tenants: Tenant[];
  leaseRequests?: any[];
  showRejected?: boolean;
}

export const TenantFilterTabs: React.FC<TenantFilterTabsProps> = ({
  filterType,
  onFilterChange,
  tenants,
  leaseRequests = [],
  showRejected = true,
}) => {
  // Count rejected tenants by checking original lease requests
  const rejectedCount = React.useMemo(() => {
    if (!leaseRequests || leaseRequests.length === 0) return 0;
    const rejectedStatuses = ["rejected", "cancelled", "reject", "cancel"];
    return leaseRequests.filter((req: any) => rejectedStatuses.includes(req.status)).length;
  }, [leaseRequests]);

  return (
    <div className="flex items-center gap-2 border-b border-slate-200">
      <button
        onClick={() => onFilterChange("renewal")}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          filterType === "renewal"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        Түрээс сунгах ({tenants.filter((t) => t.isRenewal).length})
      </button>
      <button
        onClick={() => onFilterChange("new")}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          filterType === "new"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        Шинээр түрээслэгч ({tenants.filter((t) => t.isNewTenant).length})
      </button>
      {showRejected && (
        <button
          onClick={() => onFilterChange("rejected")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            filterType === "rejected"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Цуцалсан ({rejectedCount})
        </button>
      )}
    </div>
  );
};

