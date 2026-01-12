"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ContractFormRequestInfo } from "../contract-tenant/ContractFormRequestInfo";

interface TenantInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestData: any;
  trigger: React.ReactNode;
}

export const TenantInfoModal: React.FC<TenantInfoModalProps> = ({ open, onOpenChange, requestData, trigger }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Хүсэлтийн мэдээлэл</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-auto">
          <ContractFormRequestInfo requestData={requestData} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
