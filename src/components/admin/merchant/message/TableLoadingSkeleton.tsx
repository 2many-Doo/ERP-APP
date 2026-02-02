import React from "react";

interface TableLoadingSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableLoadingSkeleton: React.FC<TableLoadingSkeletonProps> = ({
  rows = 5,
  columns = 5
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {[...Array(columns)].map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-3 bg-slate-200 rounded w-20 animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {[...Array(rows)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(columns)].map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="animate-pulse">
                      <div
                        className="h-4 bg-slate-200 rounded"
                        style={{ width: `${60 + Math.random() * 40}%` }}
                      ></div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
