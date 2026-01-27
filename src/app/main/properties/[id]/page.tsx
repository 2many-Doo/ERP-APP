"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PropertyDetail } from "@/components/admin/property/property-management";
import { approveAnnualRate, rejectAnnualRate, getProperty } from "@/lib/api";
import { Property } from "@/components/admin/property/property-management/types";
import { UpdateRateModal } from "@/components/admin/property/property-management/UpdateRateModal";
import { createAnnualRate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id ? parseInt(params.id as string) : null;
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return;
      setLoading(true);
      setError(null);
      try {
        const propertyResponse = await getProperty(propertyId);
        if (propertyResponse.error) {
          setError(propertyResponse.error);
        }
        if (propertyResponse.data) {
          const responseData = propertyResponse.data as any;
          const property = responseData.data || responseData;
          if (property) {
            setSelectedProperty(property);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Мэдээлэл татахад алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  const handleBack = () => {
    router.push("/main");
  };

  const handleApproveRate = async (propertyId: number, rateId: number) => {
    if (!rateId || rateId === 0) {
      throw new Error("Үнэлгээний ID буруу байна");
    }

    const response = await approveAnnualRate(propertyId, rateId);
    if (response.error) {
      throw new Error(response.error || "Баталгаажуулахад алдаа гарлаа");
    }
    // Refresh property data after approval
    if (propertyId) {
      const propertyResponse = await getProperty(propertyId);
      if (propertyResponse.data) {
        const responseData = propertyResponse.data as any;
        const updatedProperty = responseData.data || responseData;
        if (updatedProperty) {
          setSelectedProperty(updatedProperty);
        }
      }
    }
    setLoading(false);
  };

  const handleRejectRate = async (propertyId: number, rateId: number) => {
    const response = await rejectAnnualRate(propertyId, rateId);
    if (response.error) {
      throw new Error(response.error || "Татгалзахад алдаа гарлаа");
    }
    // Refresh property data after rejection
    if (propertyId) {
      const propertyResponse = await getProperty(propertyId);
      if (propertyResponse.data) {
        const responseData = propertyResponse.data as any;
        const updatedProperty = responseData.data || responseData;
        if (updatedProperty) {
          setSelectedProperty(updatedProperty);
        }
      }
    }
  };

  const handleRateClick = (property: Property) => {
    setSelectedProperty(property);
    setIsRateModalOpen(true);
  };

  const handleUpdateRate = async (propertyId: number, rateData: {
    rate: number;
    fee: number;
  }) => {
    const property = selectedProperty;
    const productTypeId = property?.product_type_id ?? property?.product_type?.id ?? null;

    if (!property) {
      throw new Error("Талбай олдсонгүй");
    }

    const response = await createAnnualRate({
      property_id: propertyId,
      year: new Date().getFullYear(),
      rate: rateData.rate,
      fee: rateData.fee,
      start_date: "",
      end_date: "",
      product_type_id: productTypeId,
    });

    if (response.error || !response.data) {
      const errorMessage = response.message || response.error || `Алдаа гарлаа (Status: ${response.status || 'unknown'})`;
      throw new Error(errorMessage);
    }
  };

  const handleRateSuccess = async () => {
    // Refresh property data after successful rate update
    if (propertyId) {
      const propertyResponse = await getProperty(propertyId);
      if (propertyResponse.data) {
        const responseData = propertyResponse.data as any;
        const updatedProperty = responseData.data || responseData;
        if (updatedProperty) {
          setSelectedProperty(updatedProperty);
        }
      }
    }
  };

  if (!propertyId || isNaN(propertyId)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-sm text-red-600">Талбайн ID буруу байна</p>
          <button
            onClick={handleBack}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Буцах
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="fixed inset-0 z-[120] flex items-start justify-center bg-black/60 backdrop-blur-sm px-4 py-8 overflow-y-auto">
        <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 rounded-t-2xl">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 border-b bg-white/90 backdrop-blur rounded-t-2xl">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-9 w-9"
              >
                <X className="h-4 w-4" />
              </Button>
              <div>
                <p className="text-xs text-slate-500">Талбайн дэлгэрэнгүй</p>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedProperty?.number || selectedProperty?.id || propertyId}
                </p>
              </div>
            </div>
          </div>

          <div className="max-h-[80vh] overflow-y-auto px-4 py-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-slate-200 rounded-lg" />
                <div className="h-64 bg-slate-200 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-slate-200 rounded-lg" />
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="text-center text-red-600 text-sm">{error}</div>
            ) : (
              <PropertyDetail
                propertyId={propertyId}
                property={selectedProperty}
                onBack={handleBack}
                onRateClick={handleRateClick}
                onRateSuccess={handleRateSuccess}
                onApproveRate={handleApproveRate}
                onRejectRate={handleRejectRate}
                showBackButton={false}
              />
            )}
          </div>
        </div>
      </div>

      {/* Rate Update Modal */}
      {isRateModalOpen && selectedProperty && (
        <UpdateRateModal
          property={selectedProperty}
          onClose={() => {
            setIsRateModalOpen(false);
          }}
          onSuccess={handleRateSuccess}
          onUpdateRate={handleUpdateRate}
        />
      )}
    </div>
  );
}

