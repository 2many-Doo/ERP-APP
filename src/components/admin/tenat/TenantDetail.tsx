"use client";

import React from "react";
import {
  ArrowLeft,
  Edit,
  Trash2,
  File,
  History,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "../../ui/button";

interface TenantDetailProps {
  tenantId: number;
  onBack: () => void;
}

interface LeaseHistory {
  id: number;
  contractNumber: string;
  startDate: string;
  endDate: string;
  monthlyRent: string;
  duration: string;
  status: string;
  property: string;
}

const TenantDetail = ({ tenantId, onBack }: TenantDetailProps) => {
  // Mock data for tenants
  const tenantsData: Record<number, any> = {
    1: {
      id: 1,
      name: "Батбаяр",
      contact: "99112233",
      email: "batbayar@example.mn",
      address: "Улаанбаатар хот, СБД, 1-р хороо",
      contractNumber: "CON001",
      startDate: "2024-01-15",
      endDate: "2025-01-14",
      monthlyRent: "₮ 500,000",
      status: "Идэвхтэй",
      property: "Талбай A-101",
    },
    2: {
      id: 2,
      name: "Сараа",
      contact: "99112234",
      email: "saraa@example.mn",
      address: "Улаанбаатар хот, ХДД, 5-р хороо",
      contractNumber: "CON002",
      startDate: "2024-02-20",
      endDate: "2025-02-19",
      monthlyRent: "₮ 450,000",
      status: "Идэвхтэй",
      property: "Талбай B-205",
    },
    3: {
      id: 3,
      name: "Энхтуяа",
      contact: "99112235",
      email: "enkhtuya@example.mn",
      address: "Улаанбаатар хот, БГД, 3-р хороо",
      contractNumber: "CON003",
      startDate: "2024-03-10",
      endDate: "2025-03-09",
      monthlyRent: "₮ 600,000",
      status: "Түр хаасан",
      property: "Талбай C-301",
    },
    4: {
      id: 4,
      name: "Мөнхбат",
      contact: "99112236",
      email: "monkhbat@example.mn",
      address: "Улаанбаатар хот, СХД, 2-р хороо",
      contractNumber: "CON004",
      startDate: "2024-04-05",
      endDate: "2025-04-04",
      monthlyRent: "₮ 400,000",
      status: "Идэвхтэй",
      property: "Талбай D-102",
    },
    5: {
      id: 5,
      name: "Болд",
      contact: "99112237",
      email: "bold@example.mn",
      address: "Улаанбаатар хот, БЗД, 4-р хороо",
      contractNumber: "CON005",
      startDate: "2024-05-12",
      endDate: "2025-05-11",
      monthlyRent: "₮ 550,000",
      status: "Идэвхтэй",
      property: "Талбай E-201",
    },
  };

  const tenant = tenantsData[tenantId] || tenantsData[1];

  // Mock lease history data - өмнөх гэрээний түүх
  const leaseHistory: LeaseHistory[] = [
    {
      id: 1,
      contractNumber: "CON001",
      startDate: "2024-01-15",
      endDate: "2025-01-14",
      monthlyRent: "₮ 500,000",
      duration: "12 сар",
      status: "Идэвхтэй",
      property: "Талбай A-101",
    },
    {
      id: 2,
      contractNumber: "CON000",
      startDate: "2023-01-15",
      endDate: "2023-12-14",
      monthlyRent: "₮ 450,000",
      duration: "11 сар",
      status: "Дууссан",
      property: "Талбай A-101",
    },
    {
      id: 3,
      contractNumber: "CON-001",
      startDate: "2022-06-01",
      endDate: "2022-12-31",
      monthlyRent: "₮ 400,000",
      duration: "7 сар",
      status: "Дууссан",
      property: "Талбай A-100",
    },
    {
      id: 4,
      contractNumber: "CON-002",
      startDate: "2021-01-01",
      endDate: "2022-05-31",
      monthlyRent: "₮ 380,000",
      duration: "17 сар",
      status: "Дууссан",
      property: "Талбай A-100",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Идэвхтэй":
        return "bg-green-100 text-green-800";
      case "Түр хаасан":
        return "bg-yellow-100 text-yellow-800";
      case "Дууссан":
        return "bg-gray-100 text-gray-800";
      case "Идэвхгүй":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const calculateTotalAmount = (monthlyRent: string, duration: string) => {
    const rent = parseInt(monthlyRent.replace(/[₮ ,]/g, ""));
    const months = parseInt(duration.replace(/[^0-9]/g, ""));
    return (rent * months).toLocaleString();
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Буцах
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg">
              {tenant.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{tenant.name}</h1>
              <p className="text-sm text-slate-500">{tenant.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Засах
          </Button>
          <Button variant="outline" className="flex items-center gap-2 text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
            Устгах
          </Button>
        </div>
      </div>

      <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Нийт гэрээ</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{leaseHistory.length}</p>
                </div>
                <File className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Нийт төлсөн дүн</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    ₮ {leaseHistory
                      .filter((l) => l.status === "Дууссан")
                      .reduce((sum, l) => {
                        const rent = parseInt(l.monthlyRent.replace(/[₮ ,]/g, ""));
                        const months = parseInt(l.duration.replace(/[^0-9]/g, ""));
                        return sum + rent * months;
                      }, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Дундаж сарын төлбөр</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    ₮ {Math.round(
                      leaseHistory.reduce((sum, l) => {
                        const rent = parseInt(l.monthlyRent.replace(/[₮ ,]/g, ""));
                        return sum + rent;
                      }, 0) / leaseHistory.length
                    ).toLocaleString()}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </div>
          </div>

          {/* Current Contract Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Одоогийн гэрээний мэдээлэл</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Гэрээний дугаар</p>
                <p className="text-sm font-medium text-slate-900">{tenant.contractNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Талбай</p>
                <p className="text-sm font-medium text-slate-900">{tenant.property}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Сард төлөх дүн</p>
                <p className="text-sm font-medium text-slate-900">{tenant.monthlyRent}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Эхлэх огноо</p>
                <p className="text-sm font-medium text-slate-900">{tenant.startDate}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Дуусах огноо</p>
                <p className="text-sm font-medium text-slate-900">{tenant.endDate}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Төлөв</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tenant.status)}`}>
                  {tenant.status}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Холбоо барих мэдээлэл</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Утас</p>
                  <p className="text-sm font-medium text-slate-900">{tenant.contact}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Имэйл</p>
                  <p className="text-sm font-medium text-slate-900">{tenant.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Хаяг</p>
                  <p className="text-sm font-medium text-slate-900">{tenant.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lease History */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Түрээсийн түүх</h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <History className="h-4 w-4" />
                <span>Нийт {leaseHistory.length} гэрээ</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Гэрээний дугаар</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Талбай</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Сард төлөх дүн</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Хугацаа</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Гэрээний хугацаа</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Нийт дүн</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Төлөв</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {leaseHistory.map((lease) => (
                    <tr key={lease.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-slate-900">{lease.contractNumber}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-900">{lease.property}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-slate-900">{lease.monthlyRent}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-900">{lease.duration}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-slate-600">
                          <p>{lease.startDate}</p>
                          <p className="text-xs text-slate-400">- {lease.endDate}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-600">
                            ₮ {calculateTotalAmount(lease.monthlyRent, lease.duration)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lease.status)}`}>
                          {lease.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </>
    </div>
  );
};

export default TenantDetail;

