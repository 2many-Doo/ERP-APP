"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "../../../../ui/button";

interface AllNumbersModalProps {
  isOpen: boolean;
  blockNumbers: string[];
  onClose: () => void;
  onRemoveNumber: (phone: string) => void;
}

export const AllNumbersModal: React.FC<AllNumbersModalProps> = ({
  isOpen,
  blockNumbers,
  onClose,
  onRemoveNumber,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Сонгогдсон блокийн дугаарууд
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Нийт {blockNumbers.length} дугаар
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {blockNumbers.map((phone, idx) => (
              <div
                key={idx}
                className="relative group flex items-center justify-center px-3 py-2 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded"
              >
                <span>{phone}</span>
                <button
                  onClick={() => onRemoveNumber(phone)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Хасах"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <Button type="button" variant="default" onClick={onClose}>
            Хаах
          </Button>
        </div>
      </div>
    </div>
  );
};
