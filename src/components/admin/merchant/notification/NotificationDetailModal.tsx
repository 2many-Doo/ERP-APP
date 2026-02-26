"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "../../../ui/button";

interface NotificationDetail {
  id: number;
  title?: string;
  type?: string;
  message?: string;
  image_url?: string | null;
  created_at?: string;
  meta?: any;
}

type Props = {
  open: boolean;
  loading: boolean;
  error?: string | null;
  notification: NotificationDetail | null;
  onClose: () => void;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate(),
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
};

const NotificationDetailModal: React.FC<Props> = ({
  open,
  loading,
  error,
  notification,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white w-full  max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <p className="text-xs uppercase text-slate-500">Notification</p>
            <p className="text-lg font-semibold text-slate-900">
              {notification?.title || "Дэлгэрэнгүй"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={loading}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-5 space-y-4">
          {loading && <div className="text-slate-600">Уншиж байна...</div>}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {notification && !loading && (
            <>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="font-semibold text-slate-800">ID:</span>
                <span>#{notification.id}</span>
                <span className="font-semibold text-slate-800">Төрөл:</span>
                <span>{notification.type || "—"}</span>
                <span className="font-semibold text-slate-800">Огноо:</span>
                <span>{formatDate(notification.created_at)}</span>
              </div>

              {notification.image_url && (
                <div className="relative w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={notification.image_url}
                    alt={notification.title || "notification image"}
                    className="w-full h-auto max-h-[420px] object-contain bg-white"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-800">Гарчиг</p>
                <p className="text-base text-slate-900">{notification.title || "—"}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-800">Мессеж</p>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">
                  {notification.message || "—"}
                </p>
              </div>

              {notification.meta && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-800">Meta</p>
                  <pre className="overflow-auto rounded-md bg-slate-50 p-3 text-xs text-slate-700 border border-slate-200">
                    {JSON.stringify(notification.meta, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default NotificationDetailModal;
