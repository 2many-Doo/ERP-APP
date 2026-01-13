"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { getInvoiceHistories } from "@/lib/api";
import { toast } from "sonner";

type InvoiceHistory = {
  id?: number | string;
  invoice_number?: string;
  number?: string;
  code?: string;
  total?: number | string;
  total_amount?: number | string;
  amount?: number | string;
  status?: string;
  created_at?: string;
  customer?: { name?: string };
  [key: string]: any;
};

const InvoiceHistoryList: React.FC = () => {
  const [items, setItems] = useState<InvoiceHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [invoiceModels, setInvoiceModels] = useState<Record<string, string>>({});
  const [filterModel, setFilterModel] = useState<string>("all");

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await getInvoiceHistories();
      if (res.error) {
        toast.error(res.error);
        return;
      }
      const payload = res.data || res;
      let dataArray: any[] = [];
      if (Array.isArray(payload)) dataArray = payload;
      else if (Array.isArray(payload?.data)) dataArray = payload.data;
      else if (Array.isArray(payload?.data?.data)) dataArray = payload.data.data;
      const models =
        payload?.invoice_models ||
        payload?.data?.invoice_models ||
        {};
      if (models && typeof models === "object") {
        setInvoiceModels(models as Record<string, string>);
      } else {
        setInvoiceModels({});
      }
      setItems(dataArray);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Алдаа гарлаа";
      toast.error(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const total = useMemo(() => items.length, [items]);

  const filteredItems = useMemo(() => {
    if (filterModel === "all") return items;
    return items.filter((item) => {
      const modelKey =
        (item as any)?.invoice_model ||
        (item as any)?.model ||
        (item as any)?.type ||
        "";
      return modelKey === filterModel;
    });
  }, [items, filterModel]);

  const formatAmount = (item: InvoiceHistory) => {
    const value = item.total_amount ?? item.total ?? item.amount;
    if (value === undefined || value === null || value === "") return "-";
    const num = Number(value);
    return Number.isFinite(num) ? `${num.toLocaleString()} ₮` : String(value);
  };

  const formatStatus = (status?: string) => {
    if (!status) return "-";
    const map: Record<string, string> = {
      paid: "Төлөгдсөн",
      unpaid: "Төлөгдөөгүй",
      pending: "Хүлээгдэж буй",
      cancelled: "Цуцлагдсан",
    };
    return map[status] || status;
  };

  const formatInvoiceNumber = (item: InvoiceHistory) => {
    return item.invoice_number || item.number || item.code || item.id || "-";
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Нэхэмжлэл</h1>
        <p className="text-sm text-slate-500">Нийт {total} бичлэг</p>
      </div>

      {Object.keys(invoiceModels).length > 0 && (
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setFilterModel("all")}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filterModel === "all" ? "text-black border-b-2 border-gray-600" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Бүгд ({items.length})
          </button>
          {Object.entries(invoiceModels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterModel(key)}
              className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                filterModel === key ? "text-black border-b-2 border-gray-600" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {label} ({items.filter((i) => ((i as any).invoice_model || (i as any).model || (i as any).type) === key).length})
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">№</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Дүн</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Огноо</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Ачааллаж байна...
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    Мэдээлэл олдсонгүй
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id ?? item.invoice_number ?? item.number ?? item.code} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">#{item.id ?? "-"}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{formatInvoiceNumber(item)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{formatAmount(item)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{formatStatus(item.status)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {item.created_at || item.date || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceHistoryList;
