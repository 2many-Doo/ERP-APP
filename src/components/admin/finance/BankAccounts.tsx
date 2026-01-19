"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getBankAccounts } from "@/lib/api";
import { toast } from "sonner";

type BankAccount = {
  id?: number | string;
  name?: string;
  account_number?: string;
  bank_name?: string;
  balance?: number | string;
  currency?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
};

const BankAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await getBankAccounts();
      if (res.error) {
        toast.error(res.error);
        return;
      }
      const payload = res.data || res;
      let dataArray: any[] = [];
      if (Array.isArray(payload)) dataArray = payload;
      else if (Array.isArray(payload?.data)) dataArray = payload.data;
      else if (Array.isArray(payload?.data?.data)) dataArray = payload.data.data;
      setAccounts(dataArray);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Алдаа гарлаа";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const total = useMemo(() => accounts.length, [accounts]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Банкны данс</h1>
          <p className="text-sm text-slate-500">Нийт {total} данс</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Дансны төрөл</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Банк</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Данс</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Эзэмшигч</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Ачааллаж байна...
                    </div>
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    Мэдээлэл олдсонгүй
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => {
                  const id = acc.id ?? acc.account_number ?? acc.name;
                  const href = id ? `/main/bank-accounts/${id}` : null;
                  return (
                    <tr
                      key={id}
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() => href && router.push(href)}
                    >
                      <td className="px-6 py-4 text-sm text-slate-900">#{id ?? "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-900">{acc.purpose || acc.name || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{acc.bank_name || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{acc.account_number || acc.number || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{acc.account_holder || "-"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BankAccounts;
