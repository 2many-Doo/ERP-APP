"use client";

import React from "react";
import { Input } from "../../ui/input";
import { Search, Filter } from "lucide-react";
import { PropertyType, ProductType, ServiceCategory } from "./types";

interface PropertySearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTypeId: number | null;
  onTypeChange: (typeId: number | null) => void;
  selectedProductTypeId: number | null;
  onProductTypeChange: (productTypeId: number | null) => void;
  selectedServiceCategoryId: number | null;
  onServiceCategoryChange: (serviceCategoryId: number | null) => void;
  propertyTypes: PropertyType[];
  productTypes: ProductType[];
  serviceCategories: ServiceCategory[];
}

const PropertySearchAndFilter: React.FC<PropertySearchAndFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedTypeId,
  onTypeChange,
  selectedProductTypeId,
  onProductTypeChange,
  selectedServiceCategoryId,
  onServiceCategoryChange,
  propertyTypes,
  productTypes,
  serviceCategories,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Талбай хайх..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div className="md:w-64">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={selectedTypeId === null ? "" : selectedTypeId}
              onChange={(e) =>
                onTypeChange(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Бүх төрөл</option>
              {propertyTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name || `Төрөл #${type.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Type Filter */}
        <div className="md:w-64">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={selectedProductTypeId === null ? "" : String(selectedProductTypeId)}
              onChange={(e) => {
                const value = e.target.value;
                onProductTypeChange(value === "" ? null : parseInt(value, 10));
              }}
              className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Бүх барааны төрөл</option>
              {productTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name || `Барааны төрөл #${type.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Service Category Filter */}
        <div className="md:w-64">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={selectedServiceCategoryId === null ? "" : String(selectedServiceCategoryId)}
              onChange={(e) => {
                const value = e.target.value;
                onServiceCategoryChange(value === "" ? null : parseInt(value, 10));
              }}
              className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Бүх үйлчилгээний ангилал</option>
              {serviceCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name || `Ангилал #${category.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySearchAndFilter;

