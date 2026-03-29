"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getShopById } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Store } from "lucide-react";

interface ShopDetail {
    id: number | string;
    name?: string;
    company_name?: string | null;
    company_register_number?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    note?: string | null;
    fee?: number | null;
    agreement?: string | null;
    account_name?: string | null;
    account?: string | null;
    bank_short?: string | null;
    bank_name?: string | null;
    bank_identifier?: string | null;
    latitude?: string | number | null;
    longitude?: string | number | null;
    slug?: string | null;
    owner_id?: number | string | null;
    owner_register_no?: string | null;
    owner_first_name?: string | null;
    owner_last_name?: string | null;
    owner_name?: string | null;
    owner_phone?: string | null;
    owner_email?: string | null;
    owner_avatar?: string | null;
    type?: string;
    status?: string;
    status_label?: string;
    type_label?: string;
    created_at?: string;
    updated_at?: string;
    qpay?: {
        id?: number | string;
        id_merchant?: string | null;
        id_vendor?: string | null;
        id_g_business_direction?: string | null;
        type?: string | null;
    } | null;
    logo?: string | null;
}

const typeLabels: Record<string, string> = {
    PERSON: "Хувь хүн",
    COMPANY: "Байгууллага",
};

const statusLabels: Record<string, string> = {
    open: "Нээлттэй",
    close: "Хаалттай",
    cancelled: "Цуцалсан",
    error: "Алдаа",
};

const formatDate = (date?: string) => {
    if (!date) return "—";
    const d = new Date(date);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const ShopDetailPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const shopId = params?.id;

    const [shop, setShop] = useState<ShopDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const res = await getShopById(id);
            if ([200, 201, 202].includes(res.status) && res.data) {
                const data = res.data?.data ?? res.data;
                const statusMap = res.data?.status_select ?? statusLabels;
                const typeMap = res.data?.type_select ?? typeLabels;
                const owner = data.owner ?? {};
                const avatar = owner.avatar ?? owner?.media?.[0];
                const bank = data.bank ?? {};
                const qpay = data.shop_qpay_merchant ?? null;
                setShop({
                    id: data.id,
                    name: data.name ?? "Нэргүй",
                    company_name: data.company_name,
                    company_register_number: data.company_register_number,
                    phone: data.phone,
                    email: data.email,
                    address: data.address,
                    note: data.note,
                    fee: data.fee,
                    agreement: data.agreement,
                    account_name: data.account_name,
                    account: data.account,
                    bank_short: bank.short,
                    bank_name: bank.name,
                    bank_identifier: bank.identifier,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    slug: data.slug,
                    owner_id: data.owner_id,
                    owner_register_no: data.owner_register_no,
                    owner_first_name: data.owner_first_name,
                    owner_last_name: data.owner_last_name,
                    owner_name: owner.name,
                    owner_phone: owner.phone ?? owner.verified_phone,
                    owner_email: owner.email,
                    owner_avatar: avatar?.preview ?? avatar?.thumbnail ?? avatar?.url ?? null,
                    type: data.type,
                    status: data.status,
                    status_label: statusMap?.[data.status] ?? data.status,
                    type_label: typeMap?.[data.type] ?? data.type,
                    created_at: data.created_at,
                    updated_at: data.updated_at,
                    qpay: qpay
                        ? {
                            id: qpay.id,
                            id_merchant: qpay.id_merchant,
                            id_vendor: qpay.id_vendor,
                            id_g_business_direction: qpay.id_g_business_direction,
                            type: qpay.type,
                        }
                        : null,
                    logo: data.logo?.url ?? data.logo ?? null,
                });
            } else {
                setError(res.error || "Дэлгүүр олдсонгүй");
            }
        } catch (err: any) {
            setError(err?.message || "Алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (shopId) {
            fetchDetail(Number(shopId));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shopId]);

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

    if (error || !shop) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        <p>{error || "Дэлгүүр олдсонгүй"}</p>
                    </div>
                    <Button onClick={() => router.back()}>Буцах</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button variant="back" size="sm" onClick={() => router.back()} className="px-2">
                        <ArrowLeft className="h-4 w-4" />
                        Буцах
                    </Button>
                    <Store className="h-10 w-10 text-slate-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{shop.name}</h1>
                        <p className="text-sm text-slate-500">Shop #{shop.id}</p>
                    </div>
                </div>
                {shop.status_label && (
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                        {shop.status_label}
                    </span>
                )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                    <div className="flex items-start gap-3">
                        <span className="font-semibold text-slate-900">Компанийн нэр:</span>
                        <span>{shop.company_name || "—"}</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="font-semibold text-slate-900">Компанийн РД:</span>
                        <span>{shop.company_register_number || "—"}</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="font-semibold text-slate-900">Утас:</span>
                        <span>{shop.phone || "—"}</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="font-semibold text-slate-900">Имэйл:</span>
                        <span>{shop.email || "—"}</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="font-semibold text-slate-900">Хаяг:</span>
                        <span>{shop.address || "—"}</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="font-semibold text-slate-900">Төрөл:</span>
                        <span>{shop.type_label || shop.type || "—"}</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="font-semibold text-slate-900">Төлөв:</span>
                        <span>{shop.status_label || shop.status || "—"}</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="font-semibold text-slate-900">Эзэмшигч ID:</span>
                        <span>{shop.owner_id ?? "—"}</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="font-semibold text-slate-900">Үүссэн:</span>
                        <span>{formatDate(shop.created_at)}</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="font-semibold text-slate-900">Slug:</span>
                        <span>{shop.slug || "—"}</span>
                    </div>
                    {shop.updated_at && (
                        <div className="flex items-start gap-3">
                            <span className="font-semibold text-slate-900">Шинэчлэгдсэн:</span>
                            <span>{formatDate(shop.updated_at)}</span>
                        </div>
                    )}
                    {(shop.latitude || shop.longitude) && (
                        <div className="flex items-start gap-3">
                            <span className="font-semibold text-slate-900">Байршил:</span>
                            <span>
                                {shop.latitude ?? "—"}, {shop.longitude ?? "—"}
                            </span>
                        </div>
                    )}
                    {shop.fee !== undefined && (
                        <div className="flex items-start gap-3">
                            <span className="font-semibold text-slate-900">Хураамж:</span>
                            <span>{shop.fee}</span>
                        </div>
                    )}
                    {(shop.account_name || shop.account) && (
                        <div className="flex items-start gap-3">
                            <span className="font-semibold text-slate-900">Данс:</span>
                            <span>
                                {shop.account_name || "—"} {shop.account ? `(${shop.account})` : ""} {shop.bank_name ? `• ${shop.bank_name}` : ""}
                            </span>
                        </div>
                    )}
                </div>

                {shop.logo && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-800 mb-2">Лого</p>
                        <img src={shop.logo} alt="shop logo" className="h-20 object-contain" />
                    </div>
                )}

                {(shop.owner_name || shop.owner_phone || shop.owner_email || shop.owner_avatar) && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                        <p className="text-sm font-semibold text-slate-800">Эзэмшигч</p>
                        <div className="flex items-center gap-3">
                            {shop.owner_avatar ? (
                                <img
                                    src={shop.owner_avatar}
                                    alt={shop.owner_name || "owner"}
                                    className="h-12 w-12 rounded-full object-cover border border-slate-200"
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-slate-200" />
                            )}
                            <div className="text-sm text-slate-700">
                                <p className="font-semibold text-slate-900">{shop.owner_name || "—"}</p>
                                {shop.owner_register_no && <p className="text-slate-700">РД: {shop.owner_register_no}</p>}
                                <p>{shop.owner_phone || "—"}</p>
                                <p className="text-slate-600">{shop.owner_email || ""}</p>
                            </div>
                        </div>
                    </div>
                )}

                {shop.qpay && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                        <p className="text-sm font-semibold text-slate-800">QPay Merchant</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-slate-900">Merchant ID:</span>
                                <span>{shop.qpay.id_merchant || "—"}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-slate-900">Vendor ID:</span>
                                <span>{shop.qpay.id_vendor || "—"}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-slate-900">Business Dir:</span>
                                <span>{shop.qpay.id_g_business_direction || "—"}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-slate-900">Type:</span>
                                <span>{shop.qpay.type || "—"}</span>
                            </div>
                        </div>
                    </div>
                )}

                {shop.note && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-800 mb-1">Тэмдэглэл</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{shop.note}</p>
                    </div>
                )}

                {shop.agreement && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-800 mb-1">Гэрээ</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{shop.agreement}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopDetailPage;