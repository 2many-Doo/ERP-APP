"use client";

import React from "react";

type SkeletonProps = {
  hideActions?: boolean;
  rows?: number;
};

const Placeholder = ({ className }: { className: string }) => (
  <div className={`bg-slate-200 animate-pulse rounded ${className}`} />
);

export const PropertyRateSkeleton: React.FC<SkeletonProps> = ({ hideActions = false, rows = 5 }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200">
        <div className="space-y-2">
          <Placeholder className="h-6 w-40" />
          <Placeholder className="h-3 w-24" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Placeholder className="h-10 w-28" />
          <Placeholder className="h-10 w-28" />
          {!hideActions && <Placeholder className="h-10 w-28" />}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Талбай", "Он", "Талбайн үнэ", "Менежментийн төлбөр", "Төлөв", hideActions ? "" : "Үйлдэл"]
                  .filter(Boolean)
                  .map((col) => (
                    <th key={col} className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                      {col}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Array.from({ length: rows }).map((_, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <Placeholder className="h-4 w-28" />
                      <Placeholder className="h-3 w-20 bg-slate-100" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Placeholder className="h-4 w-10" />
                  </td>
                  <td className="px-6 py-4">
                    <Placeholder className="h-4 w-16" />
                  </td>
                  <td className="px-6 py-4">
                    <Placeholder className="h-4 w-16" />
                  </td>
                  <td className="px-6 py-4">
                    <Placeholder className="h-6 w-24 rounded-full" />
                  </td>
                  {!hideActions && (
                    <td className="px-6 py-4">
                      <Placeholder className="h-8 w-24" />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PropertyRateSkeleton;

