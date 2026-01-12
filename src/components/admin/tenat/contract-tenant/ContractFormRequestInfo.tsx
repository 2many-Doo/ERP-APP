"use client";

import React from "react";

interface ContractFormRequestInfoProps {
  requestData: any;
}

export const ContractFormRequestInfo: React.FC<ContractFormRequestInfoProps> = ({
  requestData,
}) => {
  if (!requestData) {
    return null;
  }

  const getStatusDisplay = (status: string | null | undefined) => {
    if (!status) return "-";
    const map: Record<string, string> = {
      approved: "Зөвшөөрсөн",
      pending: "Хүлээгдэж буй",
      property_selected: "Талбай сонгогдсон",
      checking: "Шалгагдаж байна",
      under_review: "Дахин шалгагдаж байна",
      in_contract_process: "Гэрээ байгуулах",
      incomplete: "Дутуу",
      rejected: "Татгалзсан",
      cancelled: "Цуцлагдсан",
    };
    return map[status] || status || "-";
  };

  const getStatusStyle = (status: string | null | undefined) => {
    if (!status) return "bg-slate-200 text-slate-800";
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "in_contract_process":
        return "bg-blue-100 text-blue-700";
      case "property_selected":
        return "bg-teal-100 text-teal-700";
      case "checking":
      case "under_review":
        return "bg-indigo-100 text-indigo-700";
      default:
        return "bg-slate-200 text-slate-800";
    }
  };

  return (
    <div className="bg-white p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-600 ">Холбоо барих нэр</label>
          <p className="text-sm text-slate-800 mt-1">{requestData.contact_name || "-"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600">Утас</label>
          <p className="text-sm text-slate-800 mt-1">{requestData.contact_phone || "-"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600">Имэйл</label>
          <p className="text-sm text-slate-800 mt-1">{requestData.contact_email || "-"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600">Төлөв</label>
          <p className="text-sm text-slate-800 mt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(requestData.status)}`}>
              {getStatusDisplay(requestData.status)}
            </span>
          </p>
        </div>
        {requestData.property && (
          <div>
            <label className="text-sm font-medium text-slate-600">Талбай</label>
            <p className="text-sm text-slate-800 mt-1">{requestData.property.number || "-"}</p>
          </div>
        )}
        {requestData.deposit_amount && (
          <div>
            <label className="text-sm font-medium text-slate-600">Барьцааны дүн</label>
            <p className="text-sm text-slate-800 mt-1">{parseInt(requestData.deposit_amount).toLocaleString()} ₮</p>
          </div>
        )}
        {requestData.merchant && (
          <>
            <div>
              <label className="text-sm font-medium text-slate-600">Байгууллагын нэр</label>
              <p className="text-sm text-slate-800 mt-1">{requestData.merchant.name || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Байгууллагын имэйл</label>
              <p className="text-sm text-slate-800 mt-1">{requestData.merchant.email || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Байгууллагын утас</label>
              <p className="text-sm text-slate-800 mt-1">{requestData.merchant.phone || "-"}</p>
            </div>
          </>
        )}
        {requestData.notes && (
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-600">Тэмдэглэл</label>
            <p className="text-sm text-slate-800 mt-1">{requestData.notes}</p>
          </div>
        )}
        {requestData.created_at && (
          <div>
            <label className="text-sm font-medium text-slate-600">Үүсгэсэн огноо</label>
            <p className="text-sm text-slate-800 mt-1">{new Date(requestData.created_at).toLocaleString('mn-MN')}</p>
          </div>
        )}
        {requestData.updated_at && (
          <div>
            <label className="text-sm font-medium text-slate-600">Шинэчлэгдсэн огноо</label>
            <p className="text-sm text-slate-800 mt-1">{new Date(requestData.updated_at).toLocaleString('mn-MN')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

