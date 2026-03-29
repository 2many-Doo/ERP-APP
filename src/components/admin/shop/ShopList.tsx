"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getShops } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import ShopListSkeleton from "../../core-components/ListSkeleton";
import { Input } from "@/components/ui/input";

type Shop = {
    id: number | string;
    name?: string;
    company_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    created_at?: string;
    status?: string;
    status_label?: string;
    type?: string;
    type_label?: string;
    [key: string]: any;
};

const ShopList: React.FC = () => {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [orderby, setOrderby] = useState<string>("name");
    const [order, setOrder] = useState<"asc" | "desc">("asc");
    const [search, setSearch] = useState("");
    const [statusSelect, setStatusSelect] = useState<Record<string, string>>({});
    const [typeSelect, setTypeSelect] = useState<Record<string, string>>({});
    const perPage = 32;
    const router = useRouter();

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getShops(currentPage, perPage, orderby, order);
            if (![200, 201, 202].includes(res.status) || !res.data) {
                setError(res.error || "Дэлгүүрийн мэдээлэл татахад алдаа гарлаа");
                setShops([]);
                return;
            }

            const payload = res.data;
            const list =
                (Array.isArray(payload?.data?.data) && payload.data.data) ||
                (Array.isArray(payload?.data) && payload.data) ||
                (Array.isArray(payload) && payload) ||
                [];
            const meta = payload?.meta ?? payload?.data ?? {};
            setTotalItems(Number(meta?.total ?? meta?.total_items ?? list.length ?? 0));
            setTotalPages(Number(meta?.last_page ?? meta?.total_pages ?? 1));

            const statusSelectMap = payload?.status_select ?? {};
            const typeSelectMap = payload?.type_select ?? {};
            setStatusSelect(statusSelectMap);
            setTypeSelect(typeSelectMap);

            const parsed: Shop[] = list.map((s: any) => ({
                id: s.id,
                name: s.name ?? s.title ?? "Нэргүй",
                company_name: s.company_name,
                email: s.email,
                phone: s.phone,
                address: s.address ?? s.location,
                city: s.city,
                type: s.type,
                type_label: typeSelectMap?.[s.type] ?? s.type,
                status: s.status,
                status_label: statusSelectMap?.[s.status] ?? s.status,
                created_at: s.created_at,
                ...s,
            }));
            setShops(parsed);
        } catch (err: any) {
            setError(err?.message || "Алдаа гарлаа");
            setShops([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, orderby, order]);

    const filteredShops = useMemo(() => {
        if (!search.trim()) return shops;
        const term = search.trim().toLowerCase();
        return shops.filter((s) =>
            [s.name, s.company_name, s.phone, s.email]
                .filter(Boolean)
                .some((field) => String(field).toLowerCase().includes(term)),
        );
    }, [shops, search]);

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredShops.forEach((s) => {
            const key = s.status || "unknown";
            counts[key] = (counts[key] || 0) + 1;
        });
        return counts;
    }, [filteredShops]);

    const handleSort = (field: string) => {
        if (orderby === field) {
            setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setOrderby(field);
            setOrder("asc");
        }
    };

    const sortIcon = (field: string) => {
        if (orderby !== field) return <ArrowUpDown className="h-3 w-3 opacity-60" />;
        return order === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Дэлгүүр жагсаалт</h1>
                    <p className="text-sm text-slate-600">
                        Нийт: {totalItems} • Хуудас: {currentPage}/{totalPages}
                    </p>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-600 mb-1">Нийт дэлгүүр</p>
                    <p className="text-2xl font-bold text-slate-800">{loading ? "..." : totalItems}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-600 mb-1">Нээлттэй</p>
                    <p className="text-xl font-semibold text-green-700">{loading ? "..." : statusCounts["open"] || 0}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-600 mb-1">Хаалттай</p>
                    <p className="text-xl font-semibold text-amber-700">{loading ? "..." : statusCounts["close"] || 0}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-600 mb-1">Цуцалсан</p>
                    <p className="text-xl font-semibold text-red-700">
                        {loading ? "..." : (statusCounts["cancelled"] || 0) + (statusCounts["error"] || 0)}
                    </p>
                </div>
            </div>

            {/* Search & sort */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-300 focus-within:bg-white">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Дэлгүүр хайх (нэр, утас, имэйл)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-4"><ShopListSkeleton /></div>
            ) : filteredShops.length === 0 ? (
                <div className="p-6 text-center text-slate-600">Дэлгүүр олдсонгүй</div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                        <button onClick={() => handleSort("name")} className="flex items-center gap-1 hover:text-blue-600">
                                            Нэр
                                            {sortIcon("name")}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Утас</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Компанийн нэр</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Төрөл</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Төлөв</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                        <button
                                            onClick={() => handleSort("created_at")}
                                            className="flex items-center gap-1 hover:text-blue-600"
                                        >
                                            Үүссэн
                                            {sortIcon("created_at")}
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredShops.map((shop) => (
                                    <tr
                                        key={shop.id}
                                        className="hover:bg-slate-50 cursor-pointer"
                                        onClick={() => router.push(`/main/shop/${shop.id}`)}
                                    >
                                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">#{shop.id}</td>
                                        <td className="px-4 py-3 text-sm text-slate-900">{shop.name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{shop.phone || "-"}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{shop.company_name || "-"}</td>
                                        <td className="px-4 py-3">
                                            {shop.type_label ? (
                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                                    {shop.type_label}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-slate-500">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {shop.status_label ? (
                                                <span
                                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                                                    style={{
                                                        backgroundColor:
                                                            shop.status === "open"
                                                                ? "#dcfce7"
                                                                : shop.status === "close"
                                                                    ? "#fef9c3"
                                                                    : shop.status === "cancelled"
                                                                        ? "#fee2e2"
                                                                        : "#e0f2fe",
                                                        color:
                                                            shop.status === "open"
                                                                ? "#166534"
                                                                : shop.status === "close"
                                                                    ? "#854d0e"
                                                                    : shop.status === "cancelled"
                                                                        ? "#b91c1c"
                                                                        : "#075985",
                                                    }}
                                                >
                                                    {shop.status_label}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-slate-500">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {shop.created_at ? new Date(shop.created_at).toLocaleString() : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between gap-3">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default ShopList;