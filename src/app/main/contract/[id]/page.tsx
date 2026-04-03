"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { downloadGeree, downloadGereePdf, getContractById } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, ArrowLeft, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import ContractPdfModal from "@/components/admin/contract/ContractPdfModal";

interface AnnualRate {
    id: number | string;
    year?: number;
    rate?: number | null;
    fee?: number | null;
    start_date?: string | null;
    end_date?: string | null;
    status?: string | null;
}

interface ContractDetail {
    id: number | string;
    number?: string;
    name?: string;
    description?: string | null;
    status?: string | null;
    block?: { id: number | string; name?: string | null };
    tenant?: {
        id: number | string;
        name?: string;
        rd?: string | null;
        phone?: string | null;
        email?: string | null;
        status?: string | null;
    };
    type?: { id: number | string; name?: string | null };
    product_type?: {
        id: number | string;
        name?: string | null;
        category?: { id: number | string; name?: string | null };
        management_fee_rate?: number | null;
    };
    rate?: {
        year?: number;
        rate?: number | null;
        fee?: number | null;
        start_date?: string | null;
        end_date?: string | null;
        status?: string | null;
    } | null;
    property_annual_rates?: AnnualRate[];
    created_at?: string;
    updated_at?: string;
}

const formatDate = (date?: string | null) => {
    if (!date) return "—";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "—";
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
};

const formatDateTime = (date?: string | null) => {
    if (!date) return "—";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "—";
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(
        d.getHours(),
    ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const formatStatusLabel = (status?: string | null) => {
    if (!status) return "—";
    const map: Record<string, string> = {
        rented: "Түрээсэлсэн",
        active: "Идэвхтэй",
        expired: "Дууссан",
        pending: "Хүлээгдэж буй",
        cancelled: "Цуцлагдсан",
        close: "Хаалттай",
        closed: "Хаалттай",
    };
    return map[status] || status;
};

export default function ContractDetailPage() {
    const params = useParams();
    const router = useRouter();
    const contractId = params?.id;
    const numericId = Array.isArray(contractId) ? Number(contractId[0]) : Number(contractId);
    const [contract, setContract] = useState<ContractDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string>("");
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfOpen, setPdfOpen] = useState(false);
    const [startDate, setStartDate] = useState<string>("");

    const fetchDetail = async (id: number, start?: string) => {
        try {
            setLoading(true);
            setError(null);
            const res = await getContractById(id, start || undefined);
            if ([200, 201, 202].includes(res.status) && res.data) {
                const data = res.data?.data ?? res.data;
                setContract({
                    id: data.id,
                    number: data.number,
                    name: data.name,
                    description: data.description,
                    status: data.status,
                    block: data.block,
                    tenant: data.tenant,
                    type: data.type,
                    product_type: data.product_type,
                    rate: data.rate,
                    property_annual_rates: data.property_annual_rates,
                    created_at: data.created_at,
                    updated_at: data.updated_at,
                });
            } else {
                setError(res.error || "Гэрээ олдсонгүй");
            }
        } catch (err: any) {
            setError(err?.message || "Алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (Number.isFinite(numericId)) fetchDetail(numericId, startDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numericId, startDate]);

    useEffect(() => {
        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [pdfUrl]);

    const handleDownloadGeree = async () => {
        if (!Number.isFinite(numericId)) return;
        try {
            setDownloading(true);
            const res = await downloadGeree(numericId as number, { start_date: startDate || "" });
            if (res.error || !res.blob) {
                toast.error(res.error || "Гэрээ татахад алдаа гарлаа");
                return;
            }
            const baseName = contract?.name || contract?.number || `geree-${numericId}`;
            const safeName = `${baseName}`.replace(/\s+/g, "_");
            const filename = res.filename || `${safeName}.docx`;
            const url = URL.createObjectURL(res.blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            toast.success("Гэрээ татаж эхэллээ");
        } catch (e: any) {
            toast.error(e?.message || "Гэрээ татахад алдаа гарлаа");
        } finally {
            setDownloading(false);
        }
    };

    const handleViewPdf = async () => {
        if (!Number.isFinite(numericId)) return;
        try {
            setPdfLoading(true);
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
                setPdfUrl("");
            }
            const res = await downloadGereePdf(numericId as number, { start_date: startDate || "" });
            if (res.error || !res.blob) {
                toast.error(res.error || "PDF татахад алдаа гарлаа");
                return;
            }
            const url = URL.createObjectURL(res.blob);
            setPdfUrl(url);
            setPdfOpen(true);
        } catch (e: any) {
            toast.error(e?.message || "PDF татахад алдаа гарлаа");
        } finally {
            setPdfLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Уншиж байна...</p>
                </div>
            </div>
        );
    }

    if (error || !contract) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        <p>{error || "Гэрээ олдсонгүй"}</p>
                    </div>
                    <Button variant="back" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                        Буцах
                    </Button>
                </div>
            </div>
        );
    }

    const annualRates = contract.property_annual_rates ?? [];

    const handleBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
        } else {
            router.push("/main/contract");
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
            <div className="flex items-center">
                <div className="flex items-center gap-2">
                    <Button variant="back" size="sm" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4" />
                        Буцах
                    </Button>
                    <div className="flex flex-col items-start">
                        <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            {contract.number || contract.name || "Гэрээ"}
                        </h1>
                        <p className="text-sm text-slate-500">ID: {contract.id}</p>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-600">Эхлэх огноо:</label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="h-9"
                        />
                    </div>
                    <Button variant="outline" size="sm" onClick={handleDownloadGeree} disabled={downloading}>
                        <Download className="h-4 w-4" />
                        {downloading ? "Татаж байна..." : "Гэрээ татах"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleViewPdf} disabled={pdfLoading}>
                        {pdfLoading ? "PDF ачааллаж..." : "PDF харах"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border-slate-200 border bg-white p-4 shadow-sm">
                    <h2 className="text-lg font-semibold mb-3">Ерөнхий мэдээлэл</h2>
                    <div className="space-y-2 text-sm text-slate-700">
                        <p>
                            <span className="text-slate-500">Дугаар:</span> {contract.number || "—"}
                        </p>
                        <p>
                            <span className="text-slate-500">Нэр:</span> {contract.name || "—"}
                        </p>
                        <p>
                            <span className="text-slate-500">Тайлбар:</span> {contract.description || "—"}
                        </p>
                        <p>
                            <span className="text-slate-500">Статус:</span> {formatStatusLabel(contract.status)}
                        </p>
                        <p>
                            <span className="text-slate-500">Үүссэн:</span> {formatDateTime(contract.created_at)}
                        </p>
                        <p>
                            <span className="text-slate-500">Шинэчлэгдсэн:</span> {formatDateTime(contract.updated_at)}
                        </p>
                    </div>
                </div>

                <div className="rounded-lg border-slate-200 border  bg-white p-4 shadow-sm">
                    <h2 className="text-lg font-semibold mb-3">Байршил ба төрөл</h2>
                    <div className="space-y-2 text-sm text-slate-700">
                        <p>
                            <span className="text-slate-500">Блок:</span> {contract.block?.name || "—"}
                        </p>
                        <p>
                            <span className="text-slate-500">Талбайн төрөл:</span> {contract.type?.name || "—"}
                        </p>
                        <p>
                            <span className="text-slate-500">Бүтээгдэхүүний төрөл:</span> {contract.product_type?.name || "—"}
                        </p>
                        <p>
                            <span className="text-slate-500">Ангилал:</span> {contract.product_type?.category?.name || "—"}
                        </p>
                        <p>
                            <span className="text-slate-500">Менежментын төлбөрийн хувь:</span> {contract.product_type?.management_fee_rate ?? "—"}
                        </p>
                    </div>
                </div>

                <div className="rounded-lg border-slate-200 border   bg-white p-4 shadow-sm">
                    <h2 className="text-lg font-semibold mb-3">Түрээслэгч</h2>
                    <div className="space-y-2 text-sm text-slate-700">
                        <p>
                            <span className="text-slate-500">Нэр:</span> {contract.tenant?.name || "—"}
                        </p>
                        <p>
                            <span className="text-slate-500">РД:</span> {contract.tenant?.rd || "—"}
                        </p>
                        <p>
                            <span className="text-slate-500">Утас:</span> {contract.tenant?.phone || "—"}
                        </p>
                        <p>
                            <span className="text-slate-500">И-мэйл:</span> {contract.tenant?.email || "—"}
                        </p>
                        <p>
                            <span className="text-slate-500">Статус:</span> {formatStatusLabel(contract.tenant?.status)}
                        </p>
                    </div>
                </div>

                <div className="rounded-lg border-slate-200 border   bg-white p-4 shadow-sm">
                    <h2 className="text-lg font-semibold mb-3">Үнийн мэдээлэл</h2>
                    <div className="space-y-2 text-sm text-slate-700">
                        <p>
                            <span className="text-slate-500">Одоогийн тариф:</span>{" "}
                            {contract.rate?.rate ? `${contract.rate.rate.toLocaleString()}₮` : "—"}
                        </p>
                        <p>
                            <span className="text-slate-500">Менежментын төлбөр:</span> {contract.rate?.fee ? `${contract.rate.fee.toLocaleString()}₮` : "—"}
                        </p>
                        <p>
                            <span className="text-slate-500">Эхлэх:</span> {formatDate(contract.rate?.start_date)}
                        </p>
                        <p>
                            <span className="text-slate-500">Дуусах:</span> {formatDate(contract.rate?.end_date)}
                        </p>
                        <p>
                            <span className="text-slate-500">Статус:</span> {formatStatusLabel(contract.rate?.status)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border-slate-200 border bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold mb-3">Тайлбайн тариф(жилээр)</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Жил</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Үнэ</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Төлбөр</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Эхлэх</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Дуусах</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Статус</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {annualRates.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-3 text-center text-sm text-slate-500">
                                        Мэдээлэл алга
                                    </td>
                                </tr>
                            )}
                            {annualRates.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-2 text-sm text-slate-700">{r.year ?? "—"}</td>
                                    <td className="px-4 py-2 text-sm text-slate-700">{r.rate ? `${r.rate.toLocaleString()}₮` : "—"}</td>
                                    <td className="px-4 py-2 text-sm text-slate-700">{r.fee ? `${r.fee.toLocaleString()}₮` : "—"}</td>
                                    <td className="px-4 py-2 text-sm text-slate-700">{formatDate(r.start_date)}</td>
                                    <td className="px-4 py-2 text-sm text-slate-700">{formatDate(r.end_date)}</td>
                                    <td className="px-4 py-2 text-sm text-slate-700">{formatStatusLabel(r.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        <ContractPdfModal
            open={pdfOpen}
            onOpenChange={(open) => {
                setPdfOpen(open);
                if (!open && pdfUrl) {
                    URL.revokeObjectURL(pdfUrl);
                    setPdfUrl("");
                }
            }}
            url={pdfUrl}
            loading={pdfLoading}
            filename={contract?.name || contract?.number || ""}
        />
        </div>
    );
}