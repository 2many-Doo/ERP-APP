"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { getMerchant } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../ui/button";
import { MerchantHeader } from "./MerchantHeader";
import { MerchantBasicInfo } from "./MerchantBasicInfo";
import { Merchant } from "@/hooks/useMerchantManagement";
import { MerchantProperties } from "./MerchantProperties";
import { MerchantStatistics } from "./MerchantStatistics";
import { MerchantContactInfo } from "./MerchantContactInfo";
import { MerchantLeaseRequests } from "./MerchantLeaseRequests";
import { MerchantLeaseAgreements } from "./MerchantLeaseAgreements";
import { MerchantVehicleAccessRequests } from "./MerchantVehicleAccessRequests";

interface MerchantDetailProps {
  merchantId: number;
  merchant?: Merchant | null;
  onBack: () => void;
  onEdit?: (merchant: Merchant) => void;
  onDelete?: (merchantId: number) => void;
}

const MerchantDetail: React.FC<MerchantDetailProps> = ({
  merchantId,
  merchant: propMerchant,
  onBack,
  onEdit,
  onDelete,
}) => {
  const [merchant, setMerchant] = useState<Merchant | null>(propMerchant || null);
  const [loading, setLoading] = useState(!propMerchant);
  const [error, setError] = useState<string | null>(null);

  const fetchMerchantData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMerchant(merchantId);
      if (response.error) {
        setError(response.error);
        toast.error(`Мерчант татахад алдаа гарлаа: ${response.error}`);
      } else if (response.data) {
        const responseData = response.data as any;
        // Handle different response structures
        if (responseData.data) {
          setMerchant(responseData.data);
        } else if (responseData.id) {
          setMerchant(responseData);
        } else {
          setError("Мерчант олдсонгүй");
        }
      } else {
        setError("Мерчант олдсонгүй");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Алдаа гарлаа";
      setError(errorMsg);
      toast.error(`Мерчант татахад алдаа гарлаа: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!propMerchant) {
      fetchMerchantData();
    }
  }, [merchantId]);

  if (loading) {
    return (
      <div className="space-y-6">
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
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
          <div className="text-center text-slate-500">Уншиж байна...</div>
        </div>
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div className="space-y-6">
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
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-800">Алдаа: {error || "Мерчант олдсонгүй"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MerchantHeader
        merchant={merchant}
        onBack={onBack}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <MerchantStatistics merchant={merchant} />

      <MerchantBasicInfo merchant={merchant} />

      <MerchantContactInfo merchant={merchant} />

      <MerchantLeaseRequests leaseRequests={(merchant as any).lease_requests || []} />

      <MerchantLeaseAgreements leaseAgreements={(merchant as any).lease_agreements || []} />

      <MerchantVehicleAccessRequests vehicleAccessRequests={(merchant as any).vehicle_access_requests || []} />

      <MerchantProperties properties={(merchant as any).properties || []} />
    </div>
  );
};

export default MerchantDetail;

