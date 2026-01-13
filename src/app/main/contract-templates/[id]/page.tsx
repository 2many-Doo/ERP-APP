"use client";

import React from "react";
import { useParams } from "next/navigation";
import ContractTemplateDetail from "@/components/admin/contract-template/ContractTemplateDetail";

export default function ContractTemplateDetailPage() {
  const params = useParams();
  const idParam = params?.id;
  const templateId = typeof idParam === "string" ? parseInt(idParam, 10) : Array.isArray(idParam) ? parseInt(idParam[0], 10) : NaN;

  if (!Number.isFinite(templateId)) {
    return <div className="p-6 text-sm text-red-600">ID буруу байна.</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <ContractTemplateDetail templateId={templateId} />
    </div>
  );
}
