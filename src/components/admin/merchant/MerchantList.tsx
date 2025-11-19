"use client";

import React from "react";
import { Store, Search, Plus, Edit, Trash2, MoreVertical, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "../../ui/button";

interface MerchantListProps {
  onMerchantClick?: (merchantId: number) => void;
}

const MerchantList = ({ onMerchantClick }: MerchantListProps) => {
  // Mock data
  const merchants = [
    {
      id: 1,
      name: "ABC Худалдааны төв",
      code: "MER001",
      contact: "99112233",
      email: "info@abc.mn",
      address: "Улаанбаатар хот, СБД, 1-р хороо",
      status: "Идэвхтэй",
      registeredDate: "2024-01-15",
      totalTransactions: 1250,
      revenue: "₮ 15,500,000",
    },
    {
      id: 2,
      name: "XYZ Дэлгүүр",
      code: "MER002",
      contact: "99112234",
      email: "info@xyz.mn",
      address: "Улаанбаатар хот, ХДД, 5-р хороо",
      status: "Идэвхтэй",
      registeredDate: "2024-02-20",
      totalTransactions: 890,
      revenue: "₮ 10,200,000",
    },
    {
      id: 3,
      name: "DEF Ресторан",
      code: "MER003",
      contact: "99112235",
      email: "info@def.mn",
      address: "Улаанбаатар хот, БГД, 3-р хороо",
      status: "Идэвхгүй",
      registeredDate: "2024-03-10",
      totalTransactions: 450,
      revenue: "₮ 5,800,000",
    },
    {
      id: 4,
      name: "GHI Кафе",
      code: "MER004",
      contact: "99112236",
      email: "info@ghi.mn",
      address: "Улаанбаатар хот, СХД, 2-р хороо",
      status: "Идэвхтэй",
      registeredDate: "2024-04-05",
      totalTransactions: 320,
      revenue: "₮ 3,900,000",
    },
    {
      id: 5,
      name: "JKL Супермаркет",
      code: "MER005",
      contact: "99112237",
      email: "info@jkl.mn",
      address: "Улаанбаатар хот, БЗД, 4-р хороо",
      status: "Идэвхтэй",
      registeredDate: "2024-05-12",
      totalTransactions: 2100,
      revenue: "₮ 28,500,000",
    },
  ];

  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredMerchants = merchants.filter((merchant) =>
    merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    merchant.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    merchant.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMerchants = merchants.filter((m) => m.status === "Идэвхтэй").length;
  const inactiveMerchants = merchants.filter((m) => m.status === "Идэвхгүй").length;
  const totalRevenue = merchants.reduce((sum, m) => {
    const revenue = parseInt(m.revenue.replace(/[₮ ,]/g, ""));
    return sum + revenue;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Store className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-800">Мерчант жагсаалт</h1>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Шинэ мерчант нэмэх
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">Нийт мерчант</p>
          <p className="text-3xl font-bold text-slate-800">{merchants.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">Идэвхтэй мерчант</p>
          <p className="text-3xl font-bold text-green-600">{activeMerchants}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">Идэвхгүй мерчант</p>
          <p className="text-3xl font-bold text-red-600">{inactiveMerchants}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">Нийт орлого</p>
          <p className="text-3xl font-bold text-blue-600">₮ {totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-300 focus-within:bg-white">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Мерчант хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Merchant List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Мерчант код
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Нэр
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Холбоо барих
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Хаяг
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Гүйлгээ
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Орлого
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Төлөв
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Үйлдэл
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredMerchants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    Мерчант олдсонгүй
                  </td>
                </tr>
              ) : (
                filteredMerchants.map((merchant) => (
                  <tr
                    key={merchant.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => onMerchantClick?.(merchant.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-900">{merchant.code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{merchant.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{merchant.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{merchant.contact}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 max-w-xs truncate">{merchant.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{merchant.totalTransactions}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">{merchant.revenue}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                          merchant.status === "Идэвхтэй"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {merchant.status === "Идэвхтэй" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {merchant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4 text-slate-600" />
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

      {/* Pagination */}
      {filteredMerchants.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4">
          <div className="text-sm text-slate-600">
            Нийт <span className="font-medium">{filteredMerchants.length}</span> мерчант
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Өмнөх
            </Button>
            <span className="text-sm text-slate-600">1 / 1</span>
            <Button variant="outline" size="sm" disabled>
              Дараах
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantList;

