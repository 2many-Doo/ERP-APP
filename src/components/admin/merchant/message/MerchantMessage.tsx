"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { MessageSquare, Search, RefreshCw, Phone, Calendar, CheckCircle, XCircle, Clock, Send } from "lucide-react";
import { Button } from "../../../ui/button";
import { Pagination } from "../../../ui/pagination";
import { getMerchantMessages, MerchantMessage as MerchantMessageType } from "@/lib/api";
import { Input } from "../../../ui/input";
import { TableLoadingSkeleton } from "./TableLoadingSkeleton";
import { SendMessageModal } from "./SendMessageModal";

const MerchantMessage: React.FC = () => {
  const [messages, setMessages] = useState<MerchantMessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSendModal, setShowSendModal] = useState(false);

  const fetchMessages = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMerchantMessages(page, perPage);

      if (response.error) {
        setError(response.error);
        toast.error(response.error || "Мэссэж татахад алдаа гарлаа");
        setMessages([]);
        setTotalItems(0);
        setTotalPages(0);
      } else if (response.data) {
        let messagesData: MerchantMessageType[] = [];
        let total = 0;

        const responseData: any = response.data;

        if (responseData.data?.data) {
          messagesData = responseData.data.data;
          total = responseData.data.total || messagesData.length;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          messagesData = responseData.data;
          total = responseData.total || messagesData.length;
        } else if (Array.isArray(responseData)) {
          messagesData = responseData;
          total = messagesData.length;
        }

        if (Array.isArray(messagesData) && messagesData.length > 0) {
          setMessages(messagesData);
          setTotalItems(total);
          setTotalPages(Math.ceil(total / perPage));
        } else {
          setMessages([]);
          setTotalItems(0);
          setTotalPages(0);
        }
      } else {
        setMessages([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Алдаа гарлаа";
      setError(errorMessage);
      toast.error(errorMessage);
      setMessages([]);
      setTotalItems(0);
      setTotalPages(0);
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
      msg.phone_number?.toLowerCase().includes(query) ||
      msg.message?.toLowerCase().includes(query) ||
      String(msg.id).includes(query)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "sent":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
            <CheckCircle className="h-3 w-3" />
            Илгээсэн
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
            <Clock className="h-3 w-3" />
            Хүлээгдэж байна
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
            <XCircle className="h-3 w-3" />
            Амжилтгүй
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("mn-MN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-gray-600" />
          <h1 className="text-3xl font-bold text-slate-800">Мерчант мэссэж</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex items-center gap-2"
            onClick={() => setShowSendModal(true)}
          >
            <Send className="h-4 w-4" />
            Мэссэж илгээх
          </Button>
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
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <p className="text-sm text-slate-600 mb-2">Нийт мэссэж</p>
        <p className="text-3xl font-bold text-slate-800">{loading ? "..." : totalItems}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Утасны дугаар эсвэл мэссэжээр хайх..."
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
        <TableLoadingSkeleton rows={5} columns={5} />
      ) : filteredMessages.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">
            {searchQuery ? "Хайлтын үр дүн олдсонгүй" : "Мэссэж олдсонгүй"}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Утасны дугаар
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Мэссэж
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Төлөв
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Хугацаа
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredMessages.map((message) => (
                    <tr key={message.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-900">#{message.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-900">{message.phone_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 max-w-md">
                          {message.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(message.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{formatDate(message.due)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              loading={loading}
            />
          )}
        </>
      )}

      {/* Send Message Modal */}
      {showSendModal && (
        <SendMessageModal
          onClose={() => setShowSendModal(false)}
          onSuccess={() => {
            setShowSendModal(false);
            fetchMessages(currentPage);
          }}
        />
      )}
    </div>
  );
};

export default MerchantMessage;
