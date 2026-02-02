"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "../../../../ui/button";
import { Input } from "../../../../ui/input";

interface PhoneNumberInputProps {
  phoneNumbers: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, value: string) => void;
}

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  phoneNumbers,
  onAdd,
  onRemove,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      {phoneNumbers.map((phone, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            type="tel"
            placeholder="Утасны дугаар (жишээ: 99123456)"
            value={phone}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d]/g, '');
              onChange(index, value);
            }}
            onKeyDown={(e) => {
              if (
                e.key === 'Backspace' ||
                e.key === 'Delete' ||
                e.key === 'Tab' ||
                e.key === 'Escape' ||
                e.key === 'Enter' ||
                e.key === 'ArrowLeft' ||
                e.key === 'ArrowRight' ||
                e.key === 'ArrowUp' ||
                e.key === 'ArrowDown'
              ) {
                return;
              }
              if (!/^\d$/.test(e.key)) {
                e.preventDefault();
              }
            }}
            maxLength={8}
            className="flex-1"
          />
          {phoneNumbers.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};
