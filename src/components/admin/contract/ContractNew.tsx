"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { downloadGeree, get } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Eye, Download, Filter } from "lucide-react";
import ShopListSkeleton from "../../core-components/ListSkeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


type Contract = {
    id: number | string;
    name?: string;
    block_id?: number | string;
    block_name?: string;
    tenant_name?: string;
    tenant_phone?: string;
    product_type_name?: string;
    type_name?: string;
    rate_amount?: number | null;
    rate_fee?: number | null;
    created_at?: string;
    updated_at?: string;
};

const ContractNew: React.FC = () => {
    const router = useRouter();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [orderby, setOrderby] = useState<string>("name");
    const [order, setOrder] = useState<"asc" | "desc">("asc");
    const [search, setSearch] = useState("");
    const [blockFilter, setBlockFilter] = useState<string>("all");
    const perPage = 32;
    const [downloadingId, setDownloadingId] = useState<number | string | null>(null);

    const fetchContracts = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await get("/geree2026/list", {
                params: { page: currentPage, per_page: perPage, orderby, order },
            });
            if (![200, 201, 202].includes(res.status) || !res.data) {
                setError(res.error || "Гэрээний мэдээлэл татахад алдаа гарлаа");
                setContracts([]);
                return;
            }
            const payload = res.data;
            const list =
                (Array.isArray(payload?.data?.data) && payload.data.data) ||
                (Array.isArray(payload?.data) && payload.data) ||
                (Array.isArray(payload) && payload) ||
                [];
            const meta = payload?.meta ?? payload?.data ?? {};
            setTotalItems(Number(meta?.total ?? list.length ?? 0));
            setTotalPages(Number(meta?.last_page ?? 1));

            const parsed: Contract[] = list.map((c: any) => ({
                id: c.id,
                name: c.name ?? c.title ?? "Нэргүй",
                block_id: c.block_id ?? c.block?.id,
                block_name: c.block?.name ?? "",
                tenant_name: c.tenant?.name ?? "",
                tenant_phone: c.tenant?.phone ?? "",
                product_type_name: c.product_type?.name ?? "",
                type_name: c.type?.name ?? "",
                rate_amount: c.rate?.rate ?? null,
                rate_fee: c.rate?.fee ?? null,
                created_at: c.created_at,
                updated_at: c.updated_at,
                ...c,
            }));
            setContracts(parsed);
        } catch (err: any) {
            setError(err?.message || "Алдаа гарлаа");
            setContracts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContracts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, orderby, order]);

    const filtered = useMemo(() => {
        const byBlock = blockFilter === "all"
            ? contracts
            : contracts.filter((c) => String(c.block_id) === blockFilter);

        const term = search.trim().toLowerCase();
        const list = !term
            ? byBlock
            : byBlock.filter((c) =>
                [c.name, c.tenant_name]
                    .filter(Boolean)
                    .some((f) => String(f).toLowerCase().includes(term)),
            );

        const sorted = [...list].sort((a, b) => {
            const dir = order === "asc" ? 1 : -1;
            switch (orderby) {
                case "block_name": {
                    const av = (a.block_name || "").toLowerCase();
                    const bv = (b.block_name || "").toLowerCase();
                    return av.localeCompare(bv) * dir;
                }
                case "rate_amount": {
                    const av = a.rate_amount ?? 0;
                    const bv = b.rate_amount ?? 0;
                    if (av === bv) return 0;
                    return av > bv ? dir : -dir;
                }
                default: {
                    const av = (a.name || "").toLowerCase();
                    const bv = (b.name || "").toLowerCase();
                    return av.localeCompare(bv) * dir;
                }
            }
        });

        return sorted;
    }, [contracts, search, orderby, order, blockFilter]);

    const blockOptions = useMemo(() => {
        const map = new Map<string, string>();
        contracts.forEach((c) => {
            const id = c.block_id;
            const name = c.block_name ?? "";
            if (id !== undefined && id !== null) {
                map.set(String(id), name || `Блок #${id}`);
            }
        });
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [contracts]);

    const sortIcon = (field: string) => {
        if (orderby !== field) return <ArrowUpDown className="h-3 w-3 opacity-60" />;
        return order === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
    };

    const handleDownload = async (e: React.MouseEvent, id: number | string) => {
        e.stopPropagation();
        try {
            setDownloadingId(id);
            const res = await downloadGeree(id, {});
            if (res.error || !res.blob) {
                toast.error(res.error || "Файл татахад алдаа гарлаа");
                return;
            }
            const filename = res.filename || `geree-${id}.docx`;
            const url = URL.createObjectURL(res.blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            toast.success("Файл татаж эхэллээ");
        } catch (err: any) {
            toast.error(err?.message || "Файл татахад алдаа гарлаа");
        } finally {
            setDownloadingId(null);
        }
    };

    if (loading) {
        return (
            <div className="p-4">
                <ShopListSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Гэрээний жагсаалт</h1>
                    <p className="text-sm text-slate-600">
                        Нийт: {totalItems} • Хуудас: {currentPage}/{totalPages}
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:gap-3 gap-3">
                <div className="relative flex items-center gap-2 w-full bg-white rounded-xl border border-slate-200 p-4">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Гэрээ хайх..."
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                        className="w-full pl-10 bg-white text-sm text-slate-700 placeholder:text-slate-400"
                    />
                    <div className="flex items-center gap-2">
                        <Select
                            value={blockFilter}
                            onValueChange={(v) => {
                                setBlockFilter(v);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[160px] border-slate-200 py-5">
                                <Filter className="h-4 w-4 text-slate-400" />
                                <SelectValue placeholder="Блок шүүлтүүр" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200">
                                <SelectItem className="cursor-pointer bg-white" value="all">Бүх блок</SelectItem>
                                {blockOptions.map((b) => (
                                    <SelectItem key={b.id} value={b.id} className="cursor-pointer bg-white ">
                                        {b.name || `Блок #${b.id}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            onValueChange={(v) => {
                                if (v === "all") {
                                    setOrderby("name");
                                    setOrder("asc");
                                } else {
                                    setOrderby("rate_amount");
                                    setOrder(v as "asc" | "desc");
                                }
                            }}
                            defaultValue="all"
                        >
                            <SelectTrigger className="w-[160px] border-slate-200 py-5">
                                <Filter className="h-4 w-4 text-slate-400" />
                                <SelectValue placeholder="Талбайн үнэлгээ" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200">
                                <SelectItem value="all">Бүх</SelectItem>
                                <SelectItem value="asc">Өсөх</SelectItem>
                                <SelectItem value="desc">Буурах</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {filtered.length === 0 ? (
                <div className="p-6 text-center text-slate-600">Гэрээ олдсонгүй</div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                        Павилион
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                        Блок
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Түрээслэгч</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Бүтээгдэхүүн</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                        Талбайн үнэлгээ
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Менежментийн төлбөр</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Үйлдэл</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filtered.map((contract) => (
                                    <tr
                                        key={contract.id}
                                        className="hover:bg-slate-50 cursor-pointer"
                                        onClick={() => router.push(`/main/contract/${contract.id}`)}
                                    >
                                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">#{contract.id}</td>
                                        <td className="px-4 py-3 text-sm text-slate-900">{contract.name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{contract.block_name || "-"}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {contract.tenant_name || "-"}
                                            {contract.tenant_phone ? ` • ${contract.tenant_phone}` : ""}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {contract.product_type_name || contract.type_name || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {contract.rate_amount ? `${contract.rate_amount.toLocaleString()}₮` : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {contract.rate_fee ? `${contract.rate_fee.toLocaleString()}₮` : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => handleDownload(e, contract.id)}
                                                disabled={downloadingId === contract.id}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
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

export default ContractNew;