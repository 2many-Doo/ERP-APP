"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface PermissionErrorProps {
  error: string;
  onRetry: () => void;
}

export const PermissionError: React.FC<PermissionErrorProps> = ({
  error,
  onRetry,
}) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
      <p className="text-red-800 font-medium">Алдаа: {error}</p>
      <Button variant="outline" className="mt-4" onClick={onRetry}>
        Дахин оролдох
      </Button>
    </div>
  );
};

