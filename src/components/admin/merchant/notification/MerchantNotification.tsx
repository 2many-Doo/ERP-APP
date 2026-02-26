"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Bell, Search, RefreshCw } from "lucide-react";
import { Button } from "../../../ui/button";
import { getNotifications, getNotificationById } from "@/lib/api";
import { Input } from "../../../ui/input";
import NotificationDetailModal from "./NotificationDetailModal";

interface Notification {
  id: number;
  title?: string;
  type?: string;
  message?: string;
  image_url?: string | null;
  created_at?: string;
  meta?: any;
}

const MerchantNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const fetchNotifications = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getNotifications(page, perPage);
      if (response.error) {
        setError(response.error);
        toast.error(response.error || "Мэдэгдэл татахад алдаа гарлаа");
      } else {
        const data = response.data;
        let notificationsArray: Notification[] = [];

        if (data?.data && Array.isArray(data.data)) {
          notificationsArray = data.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            type: item.type,
            message: item.message,
            image_url: item.image_url,
            created_at: item.created_at,
          }));
        } else if (Array.isArray(data)) {
          notificationsArray = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            type: item.type,
            message: item.message,
            image_url: item.image_url,
            created_at: item.created_at,
          }));
        } else {
          notificationsArray = [];
        }

        setNotifications(notificationsArray);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Алдаа гарлаа";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(currentPage);
  }, [currentPage]);

  const handleRefresh = () => {
    fetchNotifications(currentPage);
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      notif.title?.toLowerCase().includes(query) ||
      notif.message?.toLowerCase().includes(query) ||
      notif.type?.toLowerCase().includes(query) ||
      String(notif.id).includes(query)
    );
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
      date.getDate(),
    ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes(),
    ).padStart(2, "0")}`;
  };

  const trimMessage = (message?: string) => {
    if (!message) return "";
    return message.length > 200 ? `${message.slice(0, 200)}…` : message;
  };

  const openDetail = async (id: number) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setDetailError(null);
      setSelectedNotification(null);

      const response = await getNotificationById(id);
      if (response.status === 200 && response.data) {
        const detail = (response as any).data?.data ?? response.data;
        setSelectedNotification(detail);
      } else {
        setDetailError(response.error || "Дэлгэрэнгүй татахад алдаа гарлаа");
      }
    } catch (err: any) {
      setDetailError(err.message || "Дэлгэрэнгүй татахад алдаа гарлаа");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedNotification(null);
    setDetailError(null);
  };

  return (
    <div className="relative z-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-gray-600" />
          <h1 className="text-3xl font-bold text-slate-800">Мэдэгдэл</h1>
        </div>
        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Шинэчлэх
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="ID эсвэл нэрээр хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-slate-200 bg-white p-6"
            >
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">
            {searchQuery ? "Хайлтын үр дүн олдсонгүй" : "Мэдэгдэл олдсонгүй"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-200 hover:shadow-sm transition h-full flex flex-col cursor-pointer"
              role="button"
              onClick={() => openDetail(notification.id)}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-500">#</span>
                  <span className="text-lg font-semibold text-slate-900">
                    {notification.id || "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide rounded-full bg-blue-50 text-blue-700 px-2 py-1 border border-blue-100">
                    {notification.type || "—"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatDate(notification.created_at)}
                  </span>
                </div>
              </div>

              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                {notification.title || "Гарчиг байхгүй"}
              </h3>

              {notification.image_url && (
                <div className="mt-3 relative h-36 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={notification.image_url}
                    alt={notification.title || "notification image"}
                    className="object-cover h-full w-full"
                  />
                </div>
              )}

              <p className="mt-3 text-sm text-slate-700 leading-6 whitespace-pre-wrap flex-1">
                {trimMessage(notification.message) || (
                  <span className="text-slate-400">Мессеж байхгүй</span>
                )}
              </p>
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDetail(notification.id);
                  }}
                >
                  Дэлгэрэнгүй
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NotificationDetailModal
        open={detailOpen}
        loading={detailLoading}
        error={detailError}
        notification={selectedNotification}
        onClose={closeDetail}
      />
    </div>
  );
};

export default MerchantNotification;
