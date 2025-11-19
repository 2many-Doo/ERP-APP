"use client";

import React from "react";
import { Upload, Image as ImageIcon, X, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../../../ui/button";

interface Step4Props {
  imageUrl?: string;
  onImageChange?: (file: File | null) => void;
  readOnly?: boolean;
  approvalStatus?: boolean | null;
  onApprovalChange?: (approved: boolean) => void;
}

const Step4 = ({
  imageUrl,
  onImageChange,
  readOnly = false,
  approvalStatus = null,
  onApprovalChange,
}: Step4Props) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageChange) {
      onImageChange(file);
    }
  };

  const handleRemove = () => {
    if (onImageChange) {
      onImageChange(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Байгуулгийн гэрчилгээний хуулбар зурагаар
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          Байгуулгийн гэрчилгээний хуулбарын зургийг оруулна уу
        </p>
      </div>

      {imageUrl ? (
        <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50">
          <div className="flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Байгуулгийн гэрчилгээний хуулбар"
              className="max-w-full max-h-96 rounded-lg shadow-sm"
            />
          </div>
          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="absolute top-4 right-4"
            >
              <X className="h-4 w-4" />
              Устгах
            </Button>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 bg-slate-50">
          <div className="flex flex-col items-center justify-center text-center">
            <ImageIcon className="h-12 w-12 text-slate-400 mb-4" />
            <p className="text-sm text-slate-600 mb-4">
              Зураг оруулах
            </p>
            {!readOnly && (
              <label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Зураг сонгох
                  </span>
                </Button>
              </label>
            )}
          </div>
        </div>
      )}

      {/* Approval Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <span className="text-sm font-medium text-slate-700">Мэдээлэл зөв эсэх:</span>
        <div className="flex items-center gap-2">
          <Button
            variant={approvalStatus === true ? "default" : "outline"}
            size="sm"
            onClick={() => onApprovalChange?.(true)}
            className={`flex items-center gap-2 ${
              approvalStatus === true
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "border-green-300 text-green-700 hover:bg-green-50"
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            Зөв
          </Button>
          <Button
            variant={approvalStatus === false ? "default" : "outline"}
            size="sm"
            onClick={() => onApprovalChange?.(false)}
            className={`flex items-center gap-2 ${
              approvalStatus === false
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "border-red-300 text-red-700 hover:bg-red-50"
            }`}
          >
            <XCircle className="h-4 w-4" />
            Буруу
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step4;

