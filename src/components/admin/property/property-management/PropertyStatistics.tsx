"use client";

import React from "react";

interface PropertyStatisticsProps {
  totalItems: number;
  currentPageItems: number;
  propertyTypesCount: number;
}

const PropertyStatistics: React.FC<PropertyStatisticsProps> = ({
  totalItems,
  currentPageItems,
  propertyTypesCount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Нийт талбай</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalItems}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Одоогийн хуудас</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {currentPageItems}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Талбайн төрөл</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {propertyTypesCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyStatistics;




