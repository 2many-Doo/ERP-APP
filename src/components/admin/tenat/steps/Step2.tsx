"use client";

import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "../../../ui/input";

interface Step2Props {
  hasDifference?: boolean;
  differenceAmount?: string;
  onDifferenceChange?: (hasDifference: boolean, amount?: string) => void;
  readOnly?: boolean;
  approvalStatus?: boolean | null;
  onApprovalChange?: (approved: boolean) => void;
}

const Step2 = ({
  hasDifference = false,
  differenceAmount = "",
  onDifferenceChange,
  readOnly = false,
  approvalStatus = null,
  onApprovalChange,
}: Step2Props) => {
  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    // checked = true means "no difference", so hasDifference should be false
    if (onDifferenceChange) {
      onDifferenceChange(!checked, !checked ? differenceAmount : "");
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onDifferenceChange) {
      onDifferenceChange(hasDifference, e.target.value);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Санхүүгийн барьцаалбар
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          Барьцааны зөрүү байгаа эсэхийг шалгана уу
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg bg-white">
          <input
            type="checkbox"
            id="collateral-check"
            checked={!hasDifference}
            onChange={handleCheckChange}
            disabled={readOnly}
            className="h-5 w-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="collateral-check"
            className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer"
          >
            {!hasDifference ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Барьцааны зөрүү байхгүй</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span>Барьцааны зөрүү байна</span>
              </>
            )}
          </label>
        </div>

        {hasDifference && (
          <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Зөрүүний дүн (төгрөг)
            </label>
            <Input
              type="number"
              value={differenceAmount}
              onChange={handleAmountChange}
              placeholder="Дүнг оруулна уу"
              disabled={readOnly}
              className="max-w-xs"
            />
            {differenceAmount && (
              <p className="mt-2 text-sm text-slate-600">
                Зөрүүний дүн: <span className="font-semibold">{parseInt(differenceAmount || "0").toLocaleString()} ₮</span>
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default Step2;

