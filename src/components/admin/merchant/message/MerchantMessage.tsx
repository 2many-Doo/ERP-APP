"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { MessageSquare, Search, RefreshCw } from "lucide-react";
import { Button } from "../../../ui/button";
import { Pagination } from "../../../ui/pagination";
import { getMerchantMessages } from "@/lib/api";
import { Input } from "../../../ui/input";

interface MerchantMessage {
  id: number;
  name?: string;
}

const MerchantMessage: React.FC = () => {
  const [messages, setMessages] = useState<MerchantMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMessages = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMerchantMessages(page, perPage);
      if (response.error) {
        setError(response.error);
        toast.error(response.error || "Мэссэж татахад алдаа гарлаа");
      } else {
        const data = response.data;
        let messagesArray: MerchantMessage[] = [];

        // Handle { data: [...] } structure
        if (data?.data && Array.isArray(data.data)) {
          messagesArray = data.data.map((item: any) => ({
            id: item.id,
            name: item.name,
          }));
        } else if (Array.isArray(data)) {
          messagesArray = data.map((item: any) => ({
            id: item.id,
            name: item.name,
          }));
        } else {
          messagesArray = [];
        }

        setMessages(messagesArray);
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
    fetchMessages(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    fetchMessages(currentPage);
  };

  const filteredMessages = messages.filter((msg) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      msg.name?.toLowerCase().includes(query) ||
      String(msg.id).includes(query)
    );
  });


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-gray-600" />
          <h1 className="text-3xl font-bold text-slate-800">Мерчант мэссэж</h1>
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
      ) : filteredMessages.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">
            {searchQuery ? "Хайлтын үр дүн олдсонгүй" : "Мэссэж олдсонгүй"}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className="rounded-lg border border-slate-200 bg-white p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500">#</span>
                    <span className="text-lg font-semibold text-slate-900">{message.id || "-"}</span>
                  </div>
                  <span className="text-lg font-medium text-slate-800">{message.name || "-"}</span>
                </div>
              </div>
            ))}
          </div>

        </>
      )}
    </div>
  );
};

export default MerchantMessage;
