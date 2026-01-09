"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import TenantDetail from "@/components/admin/tenat/tenat-folder/TenantDetail";

const TenantDetailPage = () => {
  const params = useParams();
  const router = useRouter();

  const idParam = params?.id;
  const tenantId = typeof idParam === "string" ? Number(idParam) : Array.isArray(idParam) ? Number(idParam[0]) : NaN;

  if (Number.isNaN(tenantId)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3 text-center">
          <p className="text-lg font-semibold text-red-600">Түрээслэгчийн ID буруу байна.</p>
          <button
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            onClick={() => router.push("/main")}
          >
            Жагсаалт руу буцах
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <TenantDetail tenantId={tenantId} onBack={() => router.push("/main")} />
    </div>
  );
};

export default TenantDetailPage;


