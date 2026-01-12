"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Eye,
  FileText,
} from "lucide-react";
import { Button } from "../../../ui/button";
import { getLeaseRequestById, getProductTypes, getProperties, updateApprovedLeaseRequestAttachments, updateLeaseRequestStatus } from "@/lib/api";
import { useContractFormData } from "@/hooks/useContractFormData";
import { getAllUrls } from "../contract-tenant/utils/attachmentUtils";
import { TenantInfoModal } from "./TenantInfoModal";
import { toast } from "sonner";

interface TenantDetailProps {
  tenantId: number;
  onBack: () => void;
}

type LeaseRequest = Record<string, any>;

const TenantDetail = ({ tenantId, onBack }: TenantDetailProps) => {
  const [tenant, setTenant] = useState<LeaseRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [productTypes, setProductTypes] = useState<Record<number, string>>({});
  const [properties, setProperties] = useState<Record<number, string>>({});
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    const loadLookup = async () => {
      try {
        const [typesRes, propsRes] = await Promise.all([
          getProductTypes(),
          getProperties(1, 200, null, null, null, "created_at", "asc"),
        ]);

        if (typesRes.data?.data) {
          const map: Record<number, string> = {};
          typesRes.data.data.forEach((t: any) => {
            if (t.id) {
              map[t.id] = t.name || t.title || t.label || `Төрөл #${t.id}`;
            }
          });
          setProductTypes(map);
        }

        if (propsRes.data?.data) {
          const map: Record<number, string> = {};
          propsRes.data.data.forEach((p: any) => {
            if (p.id) {
              map[p.id] = p.name || p.number || p.title || `Талбай #${p.id}`;
            }
          });
          setProperties(map);
        }
      } catch {
        // optional lookups; ignore failures
      }
    };

    loadLookup();
  }, []);

  useEffect(() => {
    const loadTenant = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getLeaseRequestById(tenantId);
        const raw = res.data?.data ?? res.data ?? null;
        setTenant(raw);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Түрээслэгчийн мэдээлэл татахад алдаа гарлаа."
        );
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      loadTenant();
    }
  }, [tenantId]);

  const formatted = useMemo(() => {
    if (!tenant) return null;

    const safe = (value: any, fallback: string = "-") =>
      value === null || value === undefined || value === "" ? fallback : value;

    const name =
      tenant.contact_name ||
      tenant.customer_name ||
      tenant.customerName ||
      tenant.name ||
      "-";

    const phone =
      tenant.contact_phone || tenant.phone || tenant.contact || "-";
    const email = tenant.contact_email || tenant.email || "-";
    const address = tenant.address || tenant.contact_address || "-";

    const category =
      tenant.category_name ||
      tenant.service_category?.name ||
      tenant.category?.name ||
      tenant.service_category ||
      tenant.category ||
      "-";

    const productTypeId = tenant.product_type_id;
    const productType =
      tenant.product_type_name ||
      (productTypeId && productTypes[productTypeId]) ||
      tenant.product_type?.name ||
      tenant.business_type?.name ||
      tenant.businessType?.name ||
      tenant.businessType ||
      tenant.business_type ||
      "-";

    const propertyId = tenant.property_id;
    const property =
      tenant.property?.name ||
      tenant.property?.number ||
      (propertyId && properties[propertyId]) ||
      tenant.property_number ||
      tenant.propertyName ||
      tenant.propertyNumber ||
      "-";

    const description = tenant.notes || tenant.description || tenant.comment || "-" || tenant.request_description;
    const status = tenant.status || "-";
    const createdAt = tenant.created_at || tenant.request_date || null;

    return {
      name: safe(name),
      phone: safe(phone),
      email: safe(email),
      address: safe(address),
      category: safe(category),
      productType: safe(productType),
      property: safe(property),
      description: safe(description),
      status: safe(status),
      createdAt,
      id: tenant.id,
    };
  }, [tenant, productTypes, properties]);

  // Attachments for checking / under_review / incomplete
  const useApprovedAttachments = ["checking", "under_review", "incomplete"].includes(
    (tenant?.status || "").toString()
  );
  const {
    loading: attachmentsLoading,
    attachmentMap,
    getAttachmentLabelMn,
    requestData,
    refreshData,
  } = useContractFormData({
    tenantId,
    useApprovedEndpoint: useApprovedAttachments,
  });

  const [processingAttachments, setProcessingAttachments] = useState<Set<string>>(new Set());
  const [processingStatus, setProcessingStatus] = useState(false);

  const attachmentGroups = useMemo(() => {
    return Object.entries(attachmentMap || {}).map(([name, atts]) => ({
      name,
      label: getAttachmentLabelMn?.(name) ?? name,
      urls: (atts as any[]).flatMap(getAllUrls),
      status: (atts as any[])?.[0]?.status,
    }));
  }, [attachmentMap, getAttachmentLabelMn]);

  const allApproved = useMemo(() => {
    if (attachmentGroups.length === 0) return false;
    return attachmentGroups.every((g) => g.status === "approved");
  }, [attachmentGroups]);

  const canModerateAttachments =
    (requestData?.status || tenant?.status) === "checking";

  const attachmentEmptyText = useMemo(() => {
    const st = (requestData?.status || tenant?.status || "").toString();
    if (st === "incomplete" || st === "under_review" || st === "checking") {
      return "Материал дутуу. Хавсралт илгээгээгүй байна.";
    }
    return "Материал илгээгээгүй байна.";
  }, [requestData?.status, tenant?.status]);
  const handleApproveAttachment = async (attachmentName: string) => {
    const reqId = requestData?.id || tenant?.id;
    if (!reqId || !attachmentName || processingAttachments.has(attachmentName)) return;
    setProcessingAttachments((prev) => new Set(prev).add(attachmentName));
    try {
      const resp = await updateApprovedLeaseRequestAttachments(reqId, [
        { name: attachmentName, status: "approved" },
      ]);
      if (resp?.error) {
        toast.error(resp.error);
      } else {
        toast.success("Хавсралт батлагдлаа");
        await refreshData?.();
      }
    } catch (e: any) {
      toast.error(e?.message || "Алдаа гарлаа");
    } finally {
      setProcessingAttachments((prev) => {
        const n = new Set(prev);
        n.delete(attachmentName);
        return n;
      });
    }
  };

  const handleRejectAttachment = async (attachmentName: string) => {
    const reqId = requestData?.id || tenant?.id;
    if (!reqId || !attachmentName || processingAttachments.has(attachmentName)) return;
    const note = prompt("Татгалзах шалтгаан оруулна уу?") || undefined;
    setProcessingAttachments((prev) => new Set(prev).add(attachmentName));
    try {
      const resp = await updateApprovedLeaseRequestAttachments(reqId, [
        { name: attachmentName, status: "rejected", note },
      ]);
      if (resp?.error) {
        toast.error(resp.error);
      } else {
        toast.success("Хавсралт татгалзлаа");
        await refreshData?.();
      }
    } catch (e: any) {
      toast.error(e?.message || "Алдаа гарлаа");
    } finally {
      setProcessingAttachments((prev) => {
        const n = new Set(prev);
        n.delete(attachmentName);
        return n;
      });
    }
  };


  const renderStatusBadge = (status?: string | null) => {
    if (!status) return null;
    const key = status.toLowerCase();
    const style =
      key === "approved"
        ? "bg-green-100 text-green-700"
        : key === "rejected"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-700";
    const label =
      key === "approved" ? "Зөвшөөрсөн" : key === "rejected" ? "Татгалзсан" : "Хүлээгдэж буй";
    return <span className={`ml-2 inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${style}`}>{label}</span>;
  };

  const handleMoveToContract = async () => {
    const reqId = requestData?.id || tenant?.id;
    if (!reqId || processingStatus) return;
    setProcessingStatus(true);
    try {
      const resp = await updateLeaseRequestStatus(reqId, "in_contract_process");
      if (resp?.error) {
        toast.error(resp.error);
      } else {
        toast.success("Гэрээ байгуулах шат руу шилжлээ");
        await refreshData?.();
      }
    } catch (e: any) {
      toast.error(e?.message || "Алдаа гарлаа");
    } finally {
      setProcessingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Идэвхтэй":
      case "approved":
        return "bg-green-100 text-green-800";
      case "Түр хаасан":
      case "pending":
      case "property_selected":
      case "under_review":
      case "checking":
        return "bg-yellow-100 text-yellow-800";
      case "Дууссан":
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusDisplay = (status: string) => {
    const map: Record<string, string> = {
      approved: "Зөвшөөрсөн",
      pending: "Шинээр түрээслэх",
      property_selected: "Түрээс сунгах",
      checking: "Шалгагдаж байна",
      under_review: "Дахин шалгагдаж байна",
      in_contract_process: "Гэрээ байгуулах",
      incomplete: "Дутуу",
      rejected: "Татгалзсан",
      cancelled: "Цуцлагдсан",
    };
    return map[status] || status || "-";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="back"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Буцах
          </Button>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {formatted?.name || "Түрээслэгч"}
              </h1>
              <p className="text-sm text-slate-500">{formatted?.email || "-"}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TenantInfoModal
            open={infoOpen}
            onOpenChange={setInfoOpen}
            requestData={requestData || tenant}
            trigger={
              <Button variant="outline" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Мэдээлэл
              </Button>
            }
          />
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Засах
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Устгах
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : formatted ? (
        <>
          {(useApprovedAttachments || attachmentGroups.length > 0 || attachmentsLoading || tenant?.status === "incomplete") && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Хавсралтууд</h3>
              {attachmentsLoading ? (
                <p className="text-sm text-slate-600">Ачааллаж байна...</p>
              ) : attachmentGroups.length === 0 ? (
                <p className="text-sm text-slate-600">{attachmentEmptyText}</p>
              ) : (
                attachmentGroups.map((group) => (
                  <div key={group.name} className="space-y-2 border-b border-slate-200 pb-4">
                    <div className="flex items-center">
                      <span className="font-semibold">{group.label}</span>
                      {renderStatusBadge(group.status)}
                    </div>
                    {group.urls.length === 0 ? (
                      <p className="text-sm text-slate-600">Материал дутуу.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {group.urls.map((url, idx) => (
                          <div key={`${group.name}-${idx}`} className="border border-slate-200 rounded-lg p-3 bg-white">
                            <div className="relative h-32 w-full bg-slate-100 rounded mb-2 overflow-hidden">
                              {/\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? (
                                <img
                                  src={url}
                                  alt={group.label}
                                  className="object-cover w-full h-full"
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    target.onerror = null;
                                    target.src =
                                      "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80'%3E%3Crect width='120' height='80' fill='%23e2e8f0'/%3E%3C/svg%3E";
                                  }}
                                />
                              ) : (
                                <div className="h-full flex items-center justify-center">
                                  <FileText className="h-10 w-10 text-slate-400" />
                                </div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full gap-2"
                              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                            >
                              <Eye className="h-4 w-4" />
                              Харах
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    {canModerateAttachments && group.status !== "approved" && group.status !== "rejected" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 bg-white-50 text-green-700 border-green-200 hover:bg-green-100 disabled:opacity-50"
                          onClick={() => handleApproveAttachment(group.name)}
                          disabled={processingAttachments.has(group.name)}
                        >
                          Зөвшөөрөх
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 bg-white text-red-700 border-red-200 hover:bg-red-100 disabled:opacity-50"
                          onClick={() => handleRejectAttachment(group.name)}
                          disabled={processingAttachments.has(group.name)}
                        >
                          Татгалзах
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
              {allApproved && (
                <div className="pt-2">
                  <Button
                    size="sm"
                    className="bg-slate-800 text-white hover:bg-slate-700"
                    onClick={handleMoveToContract}
                    disabled={processingStatus}
                  >
                    Гэрээ байгуулах
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          Түрээслэгчийн мэдээлэл олдсонгүй.
        </div>
      )}
    </div>
  );
};

export default TenantDetail;

