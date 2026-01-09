"use client";


import { useRouter, useParams } from "next/navigation";
import MerchantDetail from "@/components/admin/merchant/MerchantDetail";

const MerchantDetailPage = () => {
  const router = useRouter();
  const params = useParams();

  const idParam = params?.id;
  const merchantId = typeof idParam === "string" ? Number(idParam) : Array.isArray(idParam) ? Number(idParam[0]) : NaN;

  if (Number.isNaN(merchantId)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3 text-center">
          <p className="text-lg font-semibold text-red-600">Мерчант ID буруу байна.</p>
          <button
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            onClick={() => router.push("/main")}
          >
            Жагсаалт руу буцах
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <MerchantDetail merchantId={merchantId} onBack={() => router.push("/main")} />
    </div>
  );
};

export default MerchantDetailPage;


