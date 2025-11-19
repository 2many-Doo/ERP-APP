"use client";

import React from "react";
import { Button } from "../../ui/button";
import { Download, Plus } from "lucide-react";

interface PropertyHeaderProps {
  onExportExcel?: () => void;
  onAddClick?: () => void;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({ onExportExcel, onAddClick }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Талбай бүртгэл</h1>
        <p className="text-sm text-slate-500 mt-1">Талбайн мэдээллийг удирдах</p>
      </div>
      <div className="flex items-center gap-3">
        {onAddClick && (
          <Button className="flex items-center gap-2" onClick={onAddClick}>
            <Plus className="h-4 w-4" />
            Талбай нэмэх
          </Button>
        )}
        {onExportExcel && (
          <Button variant="outline" className="flex items-center gap-2" onClick={onExportExcel}>
            <Download className="h-4 w-4" />
            Excel татах
          </Button>
        )}
      </div>
    </div>
  );
};

export default PropertyHeader;

