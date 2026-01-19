 "use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeftIcon, Loader2, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { getBankAccountTransactions } from "@/lib/api";

type Transaction = {
  id?: number | string;
  date?: string;
  description?: string;
  amount?: number;
  balance?: number;
  type?: string;
  reference?: string;
  [key: string]: any;
};

interface Props {
  accountId: number | string;
}

const formatDate = (value?: string) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return value;
  }
};

const formatAmount = (value?: number) => {
  if (value === null || value === undefined) return "-";
  return `${Number(value).toLocaleString()}₮`;
};

const BankAccountTransactions: React.FC<Props> = ({ accountId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultStart = searchParams.get("start_date") || "2026-01-01";
  const defaultEnd = searchParams.get("end_date") || "2026-01-31";
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(Number(searchParams.get("page")) || 1);
  const [perPage] = useState<number>(32);
  const [startDate, setStartDate] = useState<string>(defaultStart);
  const [endDate, setEndDate] = useState<string>(defaultEnd);
  const [q, setQ] = useState<string>(searchParams.get("q") || "");
  const [total, setTotal] = useState<number>(0);
  const [lastPage, setLastPage] = useState<number>(1);

  const syncQuery = (pageToLoad: number) => {
    const params = new URLSearchParams();
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    if (q) params.set("q", q);
    if (pageToLoad > 1) params.set("page", String(pageToLoad));
    router.replace(params.toString() ? `?${params.toString()}` : "", { scroll: false });
  };

  const fetchData = async (pageToLoad: number = page) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getBankAccountTransactions(accountId, {
        startDate,
        endDate,
        page: pageToLoad,
        perPage,
        q,
      });
      if (res.error) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      const payload = res.data as any;
      const meta = payload?.meta || payload?.data?.meta || {};
      const dataArray = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      const totalVal = meta.total ?? payload?.total ?? dataArray.length ?? 0;
      const lastPageVal =
        meta.last_page ??
        meta.total_pages ??
        payload?.last_page ??
        payload?.total_pages ??
        Math.max(1, Math.ceil(totalVal / perPage));
      const currentPageVal = meta.current_page ?? payload?.current_page ?? pageToLoad;

      setTransactions(dataArray);
      setTotal(totalVal);
      setLastPage(lastPageVal);
      setPage(currentPageVal);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Алдаа гарлаа";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = () => {
    syncQuery(1);
    fetchData(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > lastPage) return;
    syncQuery(nextPage);
    fetchData(nextPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="back" size="sm" onClick={() => router.back()}>
            <ArrowLeftIcon className="w-4 h-4" />
            Буцах
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Гүйлгээний түүх</h1>
            <p className="text-sm text-slate-500">
              {startDate} — {endDate} · Нийт {total} гүйлгээ
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Эхлэх</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Дуусах</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Хайх</label>
            <Input
              placeholder="Дугаар, тайлбар..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleFilter();
              }}
            />
          </div>
          <Button size="sm" onClick={handleFilter} disabled={loading}>
            <SearchIcon className="w-4 h-4" />
            Хайх
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {error && <div className="px-6 py-4 text-sm text-red-600">{error}</div>}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Огноо</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Гүйлгээний утга</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Төрөл</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Данс</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase">Дүн</th>
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
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    Мэдээлэл олдсонгүй
                  </td>
                </tr>
              ) : (
                transactions.map((t, idx) => (
                  <tr key={t.id || idx} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {formatDate(t.tran_posted_date || (t.date as string | undefined))}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {t.tran_desc || t.description || t.remark || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{t.dr_or_cr || t.type || t.transaction_type || "-"}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {t.acc_name || t.acc_num ? `${t.acc_name ?? ""} ${t.acc_num ?? ""}`.trim() : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-slate-900">
                      {formatAmount((t as any).tran_amount ?? t.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-white">
          <Button
            variant="default"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1 || loading}
          >
            Өмнөх
          </Button>
          <span className="text-sm text-slate-500">
            Хуудас {page}/{lastPage} · Нийт {total}
          </span>
          <Button
            variant="default"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= lastPage || loading}
          >
            Дараах
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BankAccountTransactions;
