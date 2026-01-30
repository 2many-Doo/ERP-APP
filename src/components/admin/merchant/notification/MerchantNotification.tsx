"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Bell, Search, RefreshCw } from "lucide-react";
import { Button } from "../../../ui/button";
import { getNotifications } from "@/lib/api";
import { Input } from "../../../ui/input";

interface Notification {
  id: number;
  name?: string;
}

const MerchantNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");

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
            name: item.name,
          }));
        } else if (Array.isArray(data)) {
          notificationsArray = data.map((item: any) => ({
            id: item.id,
            name: item.name,
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
      notif.name?.toLowerCase().includes(query) ||
      String(notif.id).includes(query)
    );
  });

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
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-lg border border-slate-200 bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-500">#</span>
                  <span className="text-lg font-semibold text-slate-900">{notification.id || "-"}</span>
                </div>
                <span className="text-lg font-medium text-slate-800">{notification.name || "-"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MerchantNotification;
