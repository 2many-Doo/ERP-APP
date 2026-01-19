 "use client";

import React from "react";
import { useParams } from "next/navigation";
import BankAccountTransactions from "@/components/admin/finance/BankAccountTransactions";

export default function BankAccountTransactionsPage() {
  const params = useParams();
  const accountId = params?.id ? Number(params.id) : NaN;

  if (!accountId || Number.isNaN(accountId)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <p className="text-sm text-red-600">Дансны ID буруу байна</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <BankAccountTransactions accountId={accountId} />
    </div>
  );
}
