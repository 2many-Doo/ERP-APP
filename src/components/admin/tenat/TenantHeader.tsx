"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../../ui/button";

export const TenantHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Түрээслэгчдийн жагсаалт</h1>
        <p className="text-sm text-slate-500 mt-1">Бүх түрээслэгчдийн мэдээлэл</p>
      </div>
    </div>
  );
};

