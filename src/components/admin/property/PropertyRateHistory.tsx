"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DollarSign, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { approveAnnualRate, getAnnualRates, getNeedActionAnnualRates } from "@/lib/api";
import { Property } from "./types";
import PropertyRateSkeleton from "./PropertyRateSkeleton";

type StatusSelectItem = {
  label: string;
  style?: string;
  appStyle?: string;
  nextStyle?: string;
  description?: string;
};

type StatusSelect = Record<string, StatusSelectItem>;

type RateHistoryItem = {
  id: number;
  property_id: number;
  property?: Pick<Property, "id" | "number" | "name"> | null;
  year?: number;
  rate?: number;
  fee?: number;
  status?: string | null;
  approved_by_id?: number | null;
  approved_by?: any;
};

type NormalizedResponse = {
  items: RateHistoryItem[];
  meta: any;
  years: number[];
  statusSelect: StatusSelect;
};

const defaultYears = [2026, 2025];

type PropertyRateHistoryProps = {
  title?: string;
  defaultYear?: number | null;
  defaultStatus?: string;
  forceStatus?: string;
  hideStatusFilter?: boolean;
  fetchRates?: (
    propertyId: number | null,
    year: number | null,
    page: number | null,
    perPage: number | null
  ) => Promise<{ data?: any; error?: string | null; status?: number | null }>;
  hideActions?: boolean;
  hideForceStatusLabel?: boolean;
};

const fallbackStatusSelect: StatusSelect = {
  draft: {
    label: "Ноорог",
    style: "bg-secondary text-white",
    nextStyle: "bg-slate-500 text-white",
    description: "Ноорог тариф.",
  },
  pending: {
    label: "Хүлээгдэж буй",
    style: "bg-warning text-dark",
    nextStyle: "bg-amber-400 text-black",
    description: "Хүлээгдэж буй тариф.",
  },
  approved: {
    label: "Батлагдсан тариф",
    style: "bg-info text-white",
    nextStyle: "bg-cyan-500 text-white",
    description: "Батлагдсан тариф.",
  },
  active: {
    label: "Ашиглагдаж буй тариф",
    style: "bg-success text-white",
    nextStyle: "bg-emerald-500 text-white",
    description: "Ашиглагдаж буй тариф.",
  },
  expired: {
    label: "Хугацаа дууссан тариф",
    style: "bg-dark text-white",
    nextStyle: "bg-gray-700 text-white",
    description: "Хугацаа дууссан тариф.",
  },
  cancelled: {
    label: "Цуцлагдсан тариф",
    style: "bg-light text-dark",
    nextStyle: "bg-yellow-100 text-yellow-800",
    description: "Цуцлагдсан тариф.",
  },
};

const normalizeResponse = (data: any): NormalizedResponse => {
  let items: RateHistoryItem[] = [];
  let meta: any = {};
  let years: number[] = [];
  let statusSelect: StatusSelect = {};

  const extractYears = (value: any) => {
    if (Array.isArray(value)) {
      years = value.filter((y): y is number => typeof y === "number");
    }
  };

  const extractStatusSelect = (value: any) => {
    if (value && typeof value === "object") {
      statusSelect = value as StatusSelect;
    }
  };

  if (Array.isArray(data)) {
    items = data;
  }

  if (data?.data && Array.isArray(data.data)) {
    items = data.data;
    meta = data.meta || {};
    extractYears(data.years);
    extractStatusSelect(data.status_select);
  }

  if (data?.data?.data && Array.isArray(data.data.data)) {
    items = data.data.data;
    meta = data.data.meta || data.meta || {};
    extractYears(data.data.years || data.years);
    extractStatusSelect(data.data.status_select || data.status_select);
  }

  if (Array.isArray(data?.years) && years.length === 0) {
    extractYears(data.years);
  }

  if (!items.length && Array.isArray(data?.data)) {
    items = data.data;
  }

  return {
    items,
    meta,
    years,
    statusSelect,
  };
};

export const PropertyRateHistory: React.FC<PropertyRateHistoryProps> = ({
  title = "Үнэлгээний түүх",
  defaultYear = 2025,
  defaultStatus = "",
  forceStatus,
  hideStatusFilter = false,
  fetchRates = getAnnualRates,
  hideActions = false,
  hideForceStatusLabel = false,
}) => {
  const [rates, setRates] = useState<RateHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedYear, setSelectedYear] = useState<number | null>(defaultYear);
  const [selectedStatus, setSelectedStatus] = useState<string | "">(forceStatus ?? defaultStatus ?? "");
  const [availableYears, setAvailableYears] = useState<number[]>(defaultYears);
  const [statusSelect, setStatusSelect] = useState<StatusSelect>(fallbackStatusSelect);
  const perPage = 50;

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchRates(null, selectedYear, currentPage, perPage);
      if (response.error && response.status !== 404) {
        throw new Error(response.error);
      }

      if (!response.data) {
        setRates([]);
        return;
      }

      const { items, meta, years, statusSelect } = normalizeResponse(response.data);

      if (Array.isArray(years) && years.length > 0) {
        const mergedYears = Array.from(new Set<number>([...defaultYears, ...years])).sort((a, b) => b - a);
        setAvailableYears(mergedYears);
      }

      if (statusSelect && Object.keys(statusSelect).length > 0) {
        setStatusSelect(statusSelect);
      }

      const sortedRates = [...items].sort((a, b) => (b.id || 0) - (a.id || 0));
      setRates(sortedRates);

      if (meta?.last_page) {
        setTotalPages(meta.last_page);
      } else if (meta?.total_pages) {
        setTotalPages(meta.total_pages);
      } else {
        setTotalPages(1);
      }

      if (meta?.total !== undefined) {
        setTotalItems(meta.total);
      } else {
        setTotalItems(sortedRates.length);
      }
    } catch (err: any) {
      setError(err?.message || "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount === null || amount === undefined) return "-";
    return `${amount.toLocaleString()}₮`;
  };

  const getStatusKey = (status?: string | null) => {
    const key = (status || "").toString().toLowerCase();
    if (key) return key;
    return "";
  };

  const getStatusBadge = (status?: string | null) => {
    const key = getStatusKey(status);
    const config = statusSelect[key] || fallbackStatusSelect[key];
    const label = config?.label || key || "Тодорхойгүй";
    const badge = config?.nextStyle || config?.style || "bg-slate-100 text-slate-700";
    const icon: "check" | "clock" = key === "approved" || key === "active" ? "check" : "clock";
    const Icon = icon === "check" ? CheckCircle : Clock;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${badge}`}>
        <Icon className="h-3 w-3" />
        {label}
      </span>
    );
  };

  const canApprove = useMemo(() => {
    return (rate: RateHistoryItem) => {
      const key = getStatusKey(rate.status);
      if (key === "approved" || key === "active" || key === "expired" || key === "cancelled") return false;
      return true;
    };
  }, []);

  const handleApproveRate = async (propertyId: number, rateId: number) => {
    if (!rateId || processingIds.has(rateId)) return;
    setProcessingIds((prev) => new Set(prev).add(rateId));
    try {
      const response = await approveAnnualRate(propertyId, rateId);
      if (response.error) {
        throw new Error(response.error || "Баталгаажуулахад алдаа гарлаа");
      }
      await fetchData();
    } catch (err) {
      // swallow error; UI notification handled elsewhere if needed
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(rateId);
        return next;
      });
    }
  };

  const availableStatuses = useMemo(() => {
    const keys = new Set<string>();
    Object.keys(statusSelect || {}).forEach((k) => keys.add(k));
    Object.keys(fallbackStatusSelect).forEach((k) => keys.add(k));
    rates.forEach((r) => {
      const k = getStatusKey(r.status);
      if (k) keys.add(k);
    });
    return Array.from(keys).sort();
  }, [rates, statusSelect]);

  const effectiveStatus = forceStatus || selectedStatus;

  const filteredRates = useMemo(() => {
    return rates.filter((rate) => {
      const k = getStatusKey(rate.status);
      const statusMatch = effectiveStatus ? k === effectiveStatus : true;
      return statusMatch;
    });
  }, [rates, effectiveStatus]);

  if (loading) {
    return (
      <PropertyRateSkeleton hideActions={hideActions} />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[100%] rounded-lg p-4">
        <p className="text-xl text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-xs text-slate-500 mt-1">Нийт {totalItems} бичлэг</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Он:</span>
            <select
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              value={selectedYear ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                const yearValue = value ? parseInt(value, 10) : null;
                setSelectedYear(Number.isFinite(yearValue) ? yearValue : null);
                setCurrentPage(1);
              }}
            >
              <option value="">Бүх он</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          {!hideStatusFilter && !forceStatus && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Төлөв:</span>
              <select
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Бүх төлөв</option>
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {statusSelect[status]?.label ||
                      fallbackStatusSelect[status]?.label ||
                      status}
                  </option>
                ))}
              </select>
            </div>
          )}
          {forceStatus && !hideForceStatusLabel && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Төлөв:</span>
              <span className="text-sm font-medium text-slate-800">
                {statusSelect[forceStatus]?.label || fallbackStatusSelect[forceStatus]?.label || forceStatus}
              </span>
            </div>
          )}
        </div>
      </div>

      {filteredRates.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-sm text-slate-500">Үнэлгээний түүх олдсонгүй</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Талбай</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Он</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Талбайн үнэ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Менежментийн төлбөр</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Төлөв</th>
                  {!hideActions && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase">Үйлдэл</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-sm font-medium text-slate-900">
                          {rate.property?.number || `Талбай #${rate.property_id}`}
                        </span>
                        {rate.property?.name && <p className="text-xs text-slate-500">{rate.property.name}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{rate.year || "-"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-900">{formatCurrency(rate.rate)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-green-600">{formatCurrency(rate.fee)}</span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(rate.status)}</td>
                    {!hideActions && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {canApprove(rate) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 text-xs"
                              onClick={() => handleApproveRate(rate.property_id, rate.id)}
                              disabled={processingIds.has(rate.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Баталгаажуулах
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              loading={loading}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyRateHistory;

