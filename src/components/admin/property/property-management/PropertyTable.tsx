"use client";

import React from "react";
import PropertyTableRow from "./PropertyTableRow";
import { Property, ProductType } from "./types";
import { X } from "lucide-react";

interface PropertyTableProps {
  properties: Property[];
  productTypes: ProductType[];
  getPropertyTypeName: (property: Property) => string;
  selectedTypeId: number | null;
  selectedProductTypeId: number | null;
  searchQuery: string;
  onClearFilter: (filterType: 'type' | 'productType' | 'search') => void;
  onRateClick: (property: Property) => void;
  onDetailClick: (property: Property) => void;
}

const PropertyTable: React.FC<PropertyTableProps> = ({
  properties,
  productTypes,
  getPropertyTypeName,
  selectedTypeId,
  selectedProductTypeId,
  searchQuery,
  onClearFilter,
  onRateClick,
  onDetailClick,
}) => {
  const hasActiveFilters = 
    selectedTypeId !== null || 
    selectedProductTypeId !== null || 
    searchQuery.trim() !== "";

  const getTypeName = (typeId: number | null) => {
    if (typeId === null) return null;
    return `Төрөл #${typeId}`;
  };

  const getProductTypeName = (productTypeId: number | null, productTypes: ProductType[]) => {
    if (productTypeId === null) return null;
    const type = productTypes.find((t) => t.id === productTypeId);
    return type?.name || `Барааны төрөл #${productTypeId}`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-700">Идэвхтэй шүүлт:</span>
            
            {searchQuery.trim() !== "" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md">
                Хайлт: "{searchQuery}"
                <button
                  onClick={() => onClearFilter('search')}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  aria-label="Хайлтыг арилгах"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {selectedTypeId !== null && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-md">
                Төрөл: {getTypeName(selectedTypeId)}
                <button
                  onClick={() => onClearFilter('type')}
                  className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                  aria-label="Төрөл шүүлтийг арилгах"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {selectedProductTypeId !== null && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-md">
                Барааны төрөл: {getProductTypeName(selectedProductTypeId, productTypes)}
                <button
                  onClick={() => onClearFilter('productType')}
                  className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                  aria-label="Барааны төрөл шүүлтийг арилгах"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            <button
              onClick={() => {
                onClearFilter('type');
                onClearFilter('productType');
                onClearFilter('search');
              }}
              className="ml-auto text-xs text-slate-600 hover:text-slate-900 font-medium underline"
            >
              Бүх шүүлтийг арилгах
            </button>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                Талбайн дугаар
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                Блок
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                Төрөл
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                Барааны төрөл
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                Түрээслэгч
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                Төлөв
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {properties.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-sm text-slate-500">
                  Талбай олдсонгүй
                </td>
              </tr>
            ) : (
              properties.map((property) => (
                <PropertyTableRow
                  key={property.id}
                  property={property}
                  getPropertyTypeName={getPropertyTypeName}
                  onRateClick={onRateClick}
                  onDetailClick={onDetailClick}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PropertyTable;

