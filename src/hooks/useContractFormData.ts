import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { getApprovedLeaseRequestById, getLeaseRequestById } from "@/lib/api";
import {
  extractAttachments,
  buildAttachmentMap,
  buildAttachmentUrlsMap,
  getStepApprovalStatus,
} from "@/components/admin/tenat/contract-tenant/utils/attachmentUtils";

interface UseContractFormDataProps {
  tenantId: number;
  useApprovedEndpoint?: boolean; // when false, use regular lease-request endpoint
}

export const useContractFormData = ({ tenantId, useApprovedEndpoint = true }: UseContractFormDataProps) => {
  const [loading, setLoading] = useState(true);
  const [tenantName, setTenantName] = useState(`Tenant ${tenantId}`);
  const [requestData, setRequestData] = useState<any>(null);
  const [attachmentMap, setAttachmentMap] = useState<Record<string, any[]>>({});
  const [attachmentList, setAttachmentList] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [stepApprovals, setStepApprovals] = useState<Record<number, boolean | null>>({});

  // ✅ Монгол нэрний map
  const attachmentLabels = useMemo<Record<string, string>>(
    () => ({
      request: "Түрээсийн хүсэлт",
      deposit_receipt: "Барьцаа байршуулах",
      id_doc: "Иргэний үнэмлэх хуулбар",
      organization_certificate: "Байгууллагын гэрчилгээний хуулбар",
      business_regulations: "Компанийн дүрэм",
      org_rules: "ААН дүрэм",
      ceo_id_doc: "Захиралын иргэний үнэмлэхний лавлагаа",
      org_request: "ААН хүсэлт",
      org_certificate: "Байгууллагын гэрчилгээний хуулбар",
      // шаардлагатай бол нэмээд явна
    }),
    []
  );

  const getAttachmentLabelMn = (key: string) => attachmentLabels[key] ?? key;

  const applyResponse = (responseData: any, allowEmpty: boolean = true): boolean => {
    if (!responseData) return false;
    const data = responseData.data || responseData;

    const attachments = extractAttachments(responseData, data);

    const attachmentListData = responseData.attachment_list || data.attachment_list || {};
    const hasAny =
      attachments.length > 0 ||
      Object.keys(attachmentListData || {}).length > 0;

    if (!allowEmpty && !hasAny) {
      // Skip overwriting existing attachments; caller will decide fallback.
      return false;
    }

    setAttachmentList(attachmentListData);
    setRequestData(data);

    if (data.contact_name) setTenantName(data.contact_name);
    else if (data.customer_name) setTenantName(data.customer_name);
    else if (data.name) setTenantName(data.name);
    else if (data.merchant?.name) setTenantName(data.merchant.name);

    const newAttachmentMap = buildAttachmentMap(attachments);
    setAttachmentMap(newAttachmentMap);

    const attachmentUrlsMap = buildAttachmentUrlsMap(newAttachmentMap);

    const newFormData: any = {
      hasCollateralDifference: (newAttachmentMap["deposit_receipt"] || []).length > 0,
      collateralDifferenceAmount: data.deposit_amount?.toString() || "",
    };

    Object.keys(attachmentUrlsMap).forEach((name) => {
      const camelCaseName =
        name
          .split("_")
          .map((word, index) =>
            index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
          )
          .join("") + "Images";
      newFormData[camelCaseName] = attachmentUrlsMap[name];
    });

    // backward compatibility
    if (attachmentUrlsMap["request"]) newFormData.leaseRequestImages = attachmentUrlsMap["request"];
    if (attachmentUrlsMap["deposit_receipt"]) newFormData.depositReceiptImages = attachmentUrlsMap["deposit_receipt"];
    if (attachmentUrlsMap["id_doc"]) newFormData.directorIdImages = attachmentUrlsMap["id_doc"];
    if (attachmentUrlsMap["organization_certificate"])
      newFormData.organizationCertificateImages = attachmentUrlsMap["organization_certificate"];
    if (attachmentUrlsMap["business_regulations"])
      newFormData.businessRegulationsImages = attachmentUrlsMap["business_regulations"];

    setFormData(newFormData);

    // Step approvals
    const newStepApprovals: Record<number, boolean | null> = {};
    Object.keys(newAttachmentMap).forEach((name, index) => {
      const atts = newAttachmentMap[name] || [];
      newStepApprovals[index + 1] = getStepApprovalStatus(atts);
    });

    setStepApprovals(newStepApprovals);

    return Object.keys(newAttachmentMap).length > 0;
  };

  useEffect(() => {
    const fetchLeaseRequest = async () => {
      setLoading(true);
      try {
        const response = useApprovedEndpoint
          ? await getApprovedLeaseRequestById(tenantId)
          : await getLeaseRequestById(tenantId);

        let hasAttachments = false;
        if (response.data) {
          hasAttachments = applyResponse(response.data, !useApprovedEndpoint);
        }

        if (useApprovedEndpoint && !hasAttachments) {
          const fallback = await getLeaseRequestById(tenantId);
          if (fallback.data) {
            applyResponse(fallback.data, false);
          }
        }
      } catch (error) {
        toast.error("Мэдээлэл татахад алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) fetchLeaseRequest();
  }, [tenantId, attachmentLabels, useApprovedEndpoint]);

  const refreshData = async () => {
    try {
      const response = useApprovedEndpoint
        ? await getApprovedLeaseRequestById(tenantId)
        : await getLeaseRequestById(tenantId);
      let hasAttachments = false;
      if (response.data) {
        hasAttachments = applyResponse(response.data, !useApprovedEndpoint);
      }

      if (useApprovedEndpoint && !hasAttachments) {
        const fallback = await getLeaseRequestById(tenantId);
        if (fallback.data) {
          applyResponse(fallback.data, false);
        }
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  return {
    loading,
    tenantName,
    requestData,
    attachmentMap,
    attachmentList,
    formData,
    stepApprovals,

    // ✅ UI дээр ашиглах Монгол нэр
    attachmentLabels,
    getAttachmentLabelMn,

    setAttachmentMap,
    setStepApprovals,
    setFormData,
    refreshData,
  };
};
