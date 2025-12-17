"use client";

import React from "react";
import { ContractFormHeader } from "./ContractFormHeader";
import { ContractFormRequestInfo } from "./ContractFormRequestInfo";
import { ContractFormLoading } from "./ContractFormLoading";
import { CheckingStatusActions } from "./CheckingStatusActions";
import { RecheckingStatusActions } from "./RecheckingStatusActions";
import { useContractFormData } from "@/hooks/useContractFormData";
import { getAllUrls } from "./utils/attachmentUtils";
import { FileText, Eye, CheckCircle, XCircle, Clock, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateApprovedLeaseRequestAttachments } from "@/lib/api";
import { toast } from "sonner";
import { ContractFileUploader } from "./ContractFileUploader";

// ✅ shadcn dialog
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ContractFormDetailProps {
  tenantId: number;
  onBack: () => void;
  useApprovedEndpoint?: boolean;
}

const isImageUrl = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

const safeFileName = (name: string) =>
  name
    .trim()
    .replace(/[\/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "_");

const ContractFormDetail: React.FC<ContractFormDetailProps> = ({ tenantId, onBack, useApprovedEndpoint = true }) => {
  const {
    loading,
    tenantName,
    requestData,
    attachmentMap,
    refreshData,
    getAttachmentLabelMn,
  } = useContractFormData({ tenantId, useApprovedEndpoint });

  const [failedImages, setFailedImages] = React.useState<Set<string>>(new Set());
  const [openInfo, setOpenInfo] = React.useState(false); // ✅ modal state
  const [processingAttachments, setProcessingAttachments] = React.useState<Set<string>>(new Set());

  const handlePreview = React.useCallback((url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const handleApproveAttachment = React.useCallback(async (attachmentName: string) => {
    if (!requestData?.id) {
      toast.error("Хүсэлтийн ID олдсонгүй");
      return;
    }

    setProcessingAttachments((prev) => new Set(prev).add(attachmentName));
    try {
      const response = await updateApprovedLeaseRequestAttachments(requestData.id, [
        {
          name: attachmentName,
          status: "approved",
        },
      ]);

      if (response.error) {
        toast.error(`Алдаа: ${response.error}`);
      } else if (response.status === 200 || response.status === 201) {
        toast.success("Хавсралт амжилттай зөвшөөрлөө");
        refreshData?.();
      } else {
        toast.error("Хавсралт зөвшөөрөхөд алдаа гарлаа");
      }
    } catch (error: any) {
      console.error("Error approving attachment:", error);
      toast.error(error?.message || "Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setProcessingAttachments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(attachmentName);
        return newSet;
      });
    }
  }, [requestData?.id, refreshData]);

  const handleRejectAttachment = React.useCallback(async (attachmentName: string) => {
    if (!requestData?.id) {
      toast.error("Хүсэлтийн ID олдсонгүй");
      return;
    }

    const note = prompt("Татгалзсан шалтгаан оруулна уу:");
    if (note === null) {
      return; // User cancelled
    }

    setProcessingAttachments((prev) => new Set(prev).add(attachmentName));
    try {
      const response = await updateApprovedLeaseRequestAttachments(requestData.id, [
        {
          name: attachmentName,
          status: "rejected",
          note: note || undefined,
        },
      ]);

      if (response.error) {
        toast.error(`Алдаа: ${response.error}`);
      } else if (response.status === 200 || response.status === 201) {
        toast.success("Хавсралт амжилттай татгалзлаа");
        refreshData?.();
      } else {
        toast.error("Хавсралт татгалзахдаа алдаа гарлаа");
      }
    } catch (error: any) {
      console.error("Error rejecting attachment:", error);
      toast.error(error?.message || "Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setProcessingAttachments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(attachmentName);
        return newSet;
      });
    }
  }, [requestData?.id, refreshData]);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "approved":
        return "Зөвшөөрсөн";
      case "rejected":
        return "Татгалзсан";
      default:
        return "Хүлээгдэж буй";
    }
  };

  const attachmentGroups = React.useMemo(() => {
    return Object.entries(attachmentMap).map(([attachmentName, attachments]) => {
      const allUrls: string[] = [];
      attachments.forEach((att) => allUrls.push(...getAllUrls(att)));

      return {
        attachmentName,
        label: getAttachmentLabelMn ? getAttachmentLabelMn(attachmentName) : attachmentName.replace(/_/g, " "),
        attachments,
        allUrls,
        status: attachments?.[0]?.status as string | undefined,
        note: attachments?.[0]?.note as string | undefined,
      };
    });
  }, [attachmentMap, getAttachmentLabelMn]);

  if (loading) {
    return (
      <div className="space-y-6">
        <ContractFormHeader tenantName="..." onBack={onBack} />
        <ContractFormLoading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col gap-5 text-lg font-semibold text-slate-800 pb-4 mb-6 border-b border-gray-300">
          <ContractFormHeader tenantName={tenantName} onBack={onBack} />
          <div className="flex items-center justify-between gap-3">
            <h2>Хавсралтууд</h2>

            {/* ✅ Request info modal trigger */}
            {requestData && (
              <Dialog open={openInfo} onOpenChange={setOpenInfo}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Info className="h-4 w-4" />
                    Хүсэлтийн мэдээлэл
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Хүсэлтийн мэдээлэл</DialogTitle>
                  </DialogHeader>

                  {/* ✅ ContractFormRequestInfo modal дотор */}
                  <div className="max-h-[70vh] overflow-auto pr-1">
                    <ContractFormRequestInfo requestData={requestData} />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* File upload for contract-process flow */}
        {!useApprovedEndpoint && (
          <div className="mb-6">
            <ContractFileUploader />
          </div>
        )}

        {attachmentGroups.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Хавсралт олдсонгүй</div>
        ) : (
          <div className="space-y-6">
            {attachmentGroups.map((group) => (
              <div
                key={group.attachmentName}
                className="border-b border-slate-200 pb-6 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-slate-600" />
                    <h3 className="text-base font-semibold text-slate-800">{group.label}</h3>
                  </div>

                  {group.status && (
                    <div className="flex items-center gap-2">
                      {getStatusIcon(group.status)}
                      <span className="text-sm text-slate-600">{getStatusText(group.status)}</span>
                    </div>
                  )}
                </div>

                {group.allUrls.length === 0 ? (
                  <p className="text-sm text-slate-500">Хавсралт олдсонгүй</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.allUrls.map((url, index) => {
                      const isImg = isImageUrl(url);
                      safeFileName(`${group.label}_${index + 1}`);

                      return (
                        <div
                          key={`${group.attachmentName}-${index}`}
                          className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="aspect-video bg-slate-100 rounded-lg mb-3 overflow-hidden">
                            {isImg && !failedImages.has(url) ? (
                              <img
                                src={url}
                                alt={`${group.label} ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={() => {
                                  setFailedImages((prev) => {
                                    const next = new Set(prev);
                                    next.add(url);
                                    return next;
                                  });
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileText className="h-12 w-12 text-slate-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-center border border-gray-300 rounded-xl text-black">
                            <Button
                              variant="download"
                              size="sm"
                              onClick={() => handlePreview(url)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Харах
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Approve/Reject buttons - below images */}
                {requestData?.id && group.status !== "approved" && group.status !== "rejected" && (
                  <div className="flex items-center justify-start gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApproveAttachment(group.attachmentName)}
                      disabled={processingAttachments.has(group.attachmentName)}
                      className="h-8 bg-white-50 text-green-700 border-green-200 hover:bg-green-100 disabled:opacity-50"
                    >
                      {processingAttachments.has(group.attachmentName) ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      )}
                      Зөвшөөрөх
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectAttachment(group.attachmentName)}
                      disabled={processingAttachments.has(group.attachmentName)}
                      className="h-8 bg-white text-red-700 border-red-200 hover:bg-red-100 disabled:opacity-50"
                    >
                      {processingAttachments.has(group.attachmentName) ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      Татгалзах
                    </Button>
                  </div>
                )}

                {group.note && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-50">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Тэмдэглэл:</span> {group.note}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Status Actions */}
        {requestData?.status === "checking" && requestData?.id && (
          <CheckingStatusActions requestId={requestData.id} onStatusUpdate={refreshData} />
        )}
        {requestData?.status === "under_review" && requestData?.id && (
          <RecheckingStatusActions requestId={requestData.id} onStatusUpdate={refreshData} />
        )}
      </div>

      {/* ✅ Доорх inline харуулдгийг болиулна */}
      {/* {requestData && <ContractFormRequestInfo requestData={requestData} />} */}
    </div>
  );
};

export default ContractFormDetail;
