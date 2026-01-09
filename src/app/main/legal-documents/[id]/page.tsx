"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import LegalDocumentDetail from "@/components/admin/other/LegalDocumentDetail";
import type { LegalDocument } from "@/components/admin/other/LegalDocuments";
import { getLegalDocument } from "@/lib/api";
import { useMainLayout } from "@/contexts/MainLayoutContext";
import { ArrowLeft } from "lucide-react";
import LegalDocumentContentEditor from "@/components/admin/other/LegalDocumentContentEditor";

export default function LegalDocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { setActiveComponent } = useMainLayout();
  const legalDocumentId = params?.id ? Number(params.id) : NaN;

  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActiveComponent("legal-documents");
  }, [setActiveComponent]);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!legalDocumentId || Number.isNaN(legalDocumentId)) {
        setError("ID буруу байна");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await getLegalDocument(legalDocumentId);
        if (res.error) {
          setError(res.error);
        }
        if (res.data) {
          const payload: any = res.data;
          const data = payload.data || payload;
          setDocument(data as LegalDocument);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [legalDocumentId]);

  const handleBackToList = () => {
    router.push("/main?view=legal-documents");
  };

  if (!legalDocumentId || Number.isNaN(legalDocumentId)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <p className="text-sm text-red-600">Үйлчилгээний нөхцлийн ID буруу байна</p>
          <div className="flex items-center justify-center gap-2">
            <Button variant="back" onClick={() => router.back()}>
              Буцах
            </Button>
            <Button onClick={handleBackToList}>Жагсаалт руу</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="back" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Буцах
            </Button>
            <h1 className="text-2xl font-bold text-slate-800">
              {document?.admin_name || document?.title || "Үйлчилгээний нөхцөл"}
            </h1>
          </div>
        </div>
        <LegalDocumentContentEditor
          legalDocumentId={legalDocumentId}
          document={document}
          loading={loading}
          onSaved={(updated, payload) => {
            if (updated) {
              setDocument(updated);
            } else {
              setDocument((prev) => (prev ? { ...prev, content: payload } : prev));
            }
          }}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <LegalDocumentDetail document={document} loading={loading} variant="page" />
    </div>
  );
}

