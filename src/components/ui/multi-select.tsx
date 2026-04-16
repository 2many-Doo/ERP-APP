"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MultiSelectProps {
  options: { value: number; label: string; description?: string }[];
  selected: number[];
  onChange: (selected: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** e.g. z-[110] when used inside a modal (z-100) so the list stays on top */
  popoverContentClassName?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Сонгох...",
  disabled = false,
  className,
  popoverContentClassName,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: number) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const selectedOptions = options.filter((opt) => selected.includes(opt.value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "justify-between h-auto min-h-9 py-2",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            <span className="text-muted-foreground text-sm">{placeholder}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "p-0 z-[110] bg-white w-[var(--radix-popper-anchor-width)] min-w-[var(--radix-popper-anchor-width)] max-w-[var(--radix-popper-available-width)]",
          popoverContentClassName,
        )}
        align="start"
      >
        <div className="max-h-64 overflow-y-auto p-1">
          {options.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Сонголт байхгүй
            </div>
          ) : (
            options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-start gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
                    isSelected && "bg-accent/50"
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border border-slate-300 mt-0.5",
                      isSelected
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
