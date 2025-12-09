"use client";

import React from "react";
import { Button } from "../../ui/button";
import { Star } from "lucide-react";
import { Property } from "./types";

interface PropertyTableRowProps {
  property: Property;
  getPropertyTypeName: (property: Property) => string;
  onRateClick: (property: Property) => void;
  onDetailClick: (property: Property) => void;
}

const PropertyTableRow: React.FC<PropertyTableRowProps> = ({
  property,
  getPropertyTypeName,
  onRateClick,
  onDetailClick,
}) => {
  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    // Don't trigger if clicking on buttons
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    onDetailClick(property);
  };

  return (
    <tr 
      className="hover:bg-slate-50 transition-colors cursor-pointer"
      onClick={handleRowClick}
    >
      <td className="px-6 py-4">
        <span className="text-sm font-medium text-slate-900">#{property.id}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-medium text-slate-900">
          {property.number || "-"}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-slate-600">
          {property.block?.name || "-"}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-slate-600">
          {property.rate?.rate ? `${property.rate.rate.toLocaleString()}₮` : "-"}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-slate-600">
          {getPropertyTypeName(property)}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-slate-600">
          {property.product_type?.name || "-"}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">
            {property.tenant?.name || "-"}
          </span>
          {property.tenant?.phone && (
            <span className="text-xs text-slate-500">
              {property.tenant.phone}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        {(() => {
          // status_select мэдээлэл байвал түүнийг ашиглах
          if (property.status?.name && property.status?.style) {
            const statusConfig: Record<string, { label: string; style: string }> = {
              available: {
                label: "Түрээслэх боломжтой",
                style: "bg-green-100 text-green-800",
              },
              rented: {
                label: "Түрээслэгдсэн",
                style: "bg-blue-100 text-blue-800",
              },
              pending: {
                label: "Түрээсийн үйл явц үргэлжилж байна",
                style: "bg-amber-100 text-amber-800",
              },
              maintenance: {
                label: "Засвартай",
                style: "bg-red-100 text-red-800",
              },
              waiting: {
                label: "Хүлээж буй",
                style: "bg-yellow-100 text-yellow-800",
              },
            };

            const status = statusConfig[property.status?.name || ""];
            if (status) {
              return (
                <span
                  className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${status.style}`}
                >
                  {status.label}
                </span>
              );
            }
          }

          // status_select байхгүй бол хуучин status ашиглах
          if (property.status) {
            return (
              <span
                className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                  (() => {
                    const statusText = (property.status?.description || property.status?.name || "").toLowerCase();
                    if (statusText.includes('идэвхтэй')) {
                      return "bg-green-100 text-green-800";
                    }
                    if (statusText.includes('идэвхгүй')) {
                      return "bg-red-100 text-red-800";
                    }
                    if (statusText.includes('хүлээгдэж') || statusText.includes('хүлээж')) {
                      return "bg-yellow-100 text-yellow-800";
                    }
                    if (statusText.includes('түр') || statusText.includes('түрээслэгдсэн')) {
                      return "bg-orange-100 text-orange-800";
                    }
                    if (property.status.style && typeof property.status.style === 'string' && property.status.style.includes('bg-')) {
                      return property.status.style;
                    }
                    return "bg-blue-100 text-blue-800";
                  })()
                }`}
              >
                {property.status.description || property.status.name || "-"}
              </span>
            );
          }

          return <span className="text-sm text-slate-500">-</span>;
        })()}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onRateClick(property);
            }}
          >
            <Star className="h-4 w-4" />
            Үнэлгээ өгөх
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default PropertyTableRow;

