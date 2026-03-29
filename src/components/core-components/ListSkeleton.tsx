import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ShopListSkeleton: React.FC = () => {
    return (
        <div className="space-y-4">
            <div>
                <Skeleton className="h-15 w-120 bg-slate-200 " />
            </div>
            <div>
                <Skeleton className="h-12 w-full bg-slate-200 " />
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                    <div className="grid grid-cols-7 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <Skeleton key={i} className="h-3 w-full" />
                        ))}
                    </div>
                </div>
                <div className="divide-y divide-slate-200">
                    {[...Array(10)].map((_, idx) => (
                        <div key={idx} className="grid grid-cols-7 px-4 py-3 gap-3">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-24" />
            </div>
        </div>
    );
};

export default ShopListSkeleton;