import React from "react";

export const BlockLoadingSkeleton: React.FC = () => {
  return (
    <div className="text-center py-2 text-slate-500 text-sm">
      Блокууд уншиж байна...
    </div>
  );
};

export const BlockEmptyState: React.FC = () => {
  return (
    <div className="text-center py-2 text-slate-500 text-sm">
      Блок олдсонгүй
    </div>
  );
};

export const NumbersLoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center gap-2 px-3">
      <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

interface LoadingSpinnerProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  color?: "white" | "blue" | "slate";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = "Уншиж байна...",
  size = "md",
  color = "white"
}) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  const colorClasses = {
    white: "border-white border-t-transparent",
    blue: "border-blue-600 border-t-transparent",
    slate: "border-slate-600 border-t-transparent"
  };

  return (
    <>
      <div className={`${sizeClasses[size]} border-2 ${colorClasses[color]} rounded-full animate-spin`} />
      {text}
    </>
  );
};
