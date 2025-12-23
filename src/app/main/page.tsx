import React, { Suspense } from "react";
import MainPageClient from "./MainPageClient"; 

export const dynamic = "force-dynamic";

export default function MainPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-4 text-sm text-slate-600">Ачаалж байна...</div>}>
      <MainPageClient />
    </Suspense>
  );
}
