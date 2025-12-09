"use client";

import React, { useState, useMemo } from "react";
import { 
  Shield, 
  FileText, 
  Calendar, 
  DollarSign, 
  Building2,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Download,
  Search,
  Filter
} from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";

type InsuranceType = "liability" | "property" | "all";

interface InsuranceItem {
  id: number;
  type: "liability" | "property";
  policyNumber: string;
  insuranceCompany: string;
  startDate: string;
  endDate: string;
  coverageAmount: string;
  premium: string;
  status: "active" | "expired" | "pending";
  description: string;
}

const InsuranceManagement = () => {
  const [filterType, setFilterType] = useState<InsuranceType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const mockInsuranceData: InsuranceItem[] = [
    {
      id: 1,
      type: "liability",
      policyNumber: "HL-2024-001",
      insuranceCompany: "Монгол даатгал",
      startDate: "2024-01-15",
      endDate: "2025-01-14",
      coverageAmount: "₮ 100,000,000",
      premium: "₮ 5,000,000",
      status: "active",
      description: "Хариуцлагын даатгал - Бараа бүтээгдэхүүний хамгаалалт"
    },
    {
      id: 2,
      type: "property",
      policyNumber: "EH-2024-001",
      insuranceCompany: "Монгол даатгал",
      startDate: "2024-02-01",
      endDate: "2025-01-31",
      coverageAmount: "₮ 200,000,000",
      premium: "₮ 8,000,000",
      status: "active",
      description: "Эд хөрөнгийн даатгал - Байгууллагын барилга байгууламж"
    },
    {
      id: 3,
      type: "liability",
      policyNumber: "HL-2023-045",
      insuranceCompany: "Хариуцлага даатгал",
      startDate: "2023-06-01",
      endDate: "2024-05-31",
      coverageAmount: "₮ 80,000,000",
      premium: "₮ 4,000,000",
      status: "expired",
      description: "Хариуцлагын даатгал - Хуучин гэрээ"
    },
    {
      id: 4,
      type: "property",
      policyNumber: "EH-2024-002",
      insuranceCompany: "Эд хөрөнгө даатгал",
      startDate: "2024-03-15",
      endDate: "2025-03-14",
      coverageAmount: "₮ 150,000,000",
      premium: "₮ 6,500,000",
      status: "active",
      description: "Эд хөрөнгийн даатгал - Тоног төхөөрөмж"
    },
    {
      id: 5,
      type: "liability",
      policyNumber: "HL-2024-003",
      insuranceCompany: "Монгол даатгал",
      startDate: "2024-05-01",
      endDate: "2025-04-30",
      coverageAmount: "₮ 120,000,000",
      premium: "₮ 6,000,000",
      status: "pending",
      description: "Хариуцлагын даатгал - Шинэ гэрээ"
    },
  ];

  // Filter by type
  const filteredByType = useMemo(() => {
    if (filterType === "all") return mockInsuranceData;
    return mockInsuranceData.filter((item) => item.type === filterType);
  }, [filterType]);

  // Filter by search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return filteredByType;
    
    const query = searchQuery.toLowerCase();
    return filteredByType.filter((item) => {
      return (
        item.policyNumber.toLowerCase().includes(query) ||
        item.insuranceCompany.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    });
  }, [filteredByType, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            Идэвхтэй
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3" />
            Хугацаа дууссан
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3" />
            Хүлээгдэж буй
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "liability":
        return <Shield className="h-5 w-5 text-blue-600" />;
      case "property":
        return <Building2 className="h-5 w-5 text-purple-600" />;
      default:
        return <Package className="h-5 w-5 text-slate-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "liability":
        return "Хариуцлага";
      case "property":
        return "Эд хөрөнгө";
      default:
        return "Тодорхойгүй";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Даатгалын мэдээлэл</h1>
            <p className="text-sm text-slate-500">Даатгалын гэрээний мэдээлэл, баримтууд</p>
          </div>
        </div>
        <Button className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Шинэ даатгал нэмэх
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setFilterType("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filterType === "all"
              ? "text-black border-b-2 border-gray-600"
              : "border-transparent text-slate-600 hover:text-slate-800"
          }`}
        >
          Бүгд ({mockInsuranceData.length})
        </button>
        <button
          onClick={() => setFilterType("liability")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            filterType === "liability"
              ? "text-black border-b-2 border-gray-600"
              : "border-transparent text-slate-600 hover:text-slate-800"
          }`}
        >
          <Shield className="h-4 w-4" />
          Хариуцлага ({mockInsuranceData.filter((i) => i.type === "liability").length})
        </button>
        <button
          onClick={() => setFilterType("property")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            filterType === "property"
              ? "text-black border-b-2 border-gray-600"
              : "border-transparent text-slate-600 hover:text-slate-800"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Эд хөрөнгө ({mockInsuranceData.filter((i) => i.type === "property").length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Гэрчилгээний дугаар, даатгалын компани эсвэл тайлбараар хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Нийт даатгал</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{filteredData.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Идэвхтэй</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {filteredData.filter((i) => i.status === "active").length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Нийт хамрах хэмжээ</p>
              <p className="text-lg font-bold text-slate-800 mt-1">
                ₮ {filteredData.reduce((sum, item) => {
                  const amount = parseInt(item.coverageAmount.replace(/[₮ ,]/g, ""));
                  return sum + (isNaN(amount) ? 0 : amount);
                }, 0).toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Insurance List */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Төрөл
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Гэрчилгээний дугаар
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Даатгалын компани
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Хугацаа
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Хамрах хэмжээ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Төлбөр
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Төлөв
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Үйлдэл
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-sm text-slate-500">Даатгалын мэдээлэл олдсонгүй</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <span className="text-sm font-medium text-slate-800">
                          {getTypeLabel(item.type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-800">{item.policyNumber}</div>
                      <div className="text-xs text-slate-500 mt-1">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-800">{item.insuranceCompany}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-800">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {item.startDate}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">- {item.endDate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-800">{item.coverageAmount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-800">{item.premium}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InsuranceManagement;

