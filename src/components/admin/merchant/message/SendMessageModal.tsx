"use client";

import React, { useState, useEffect } from "react";
import { X, Send, Plus, Trash2, Calendar, Users } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { toast } from "sonner";
import { sendMessage, getSmsBlocks, getSmsNumbersByBlock, SmsBlock } from "@/lib/api";
import {
  BlockLoadingSkeleton,
  BlockEmptyState,
  NumbersLoadingSpinner,
  LoadingSpinner
} from "./BlockLoadingSkeleton";

interface SendMessageModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const SendMessageModal: React.FC<SendMessageModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([""]);
  const [message, setMessage] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<SmsBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingNumbers, setLoadingNumbers] = useState(false);
  const [showAllNumbers, setShowAllNumbers] = useState(false);

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    setLoadingBlocks(true);
    try {
      const response = await getSmsBlocks();
      if (response.data) {
        const blocksData = Array.isArray(response.data)
          ? response.data
          : (response.data as any).data || [];
        setBlocks(blocksData);
      }
    } catch (err) {
      // Error handled silently
    } finally {
      setLoadingBlocks(false);
    }
  };

  const handleBlockSelect = async (blockId: string) => {
    if (!blockId) {
      setSelectedBlock("");
      setPhoneNumbers([""]);
      return;
    }

    setSelectedBlock(blockId);
    setLoadingNumbers(true);

    try {
      const response = await getSmsNumbersByBlock(Number(blockId));

      if (response.error) {
        toast.error("Дугаарууд татахад алдаа гарлаа");
        setPhoneNumbers([""]);
      } else if (response.data) {
        let numbersData: any[] = [];

        if (Array.isArray(response.data)) {
          numbersData = response.data;
        } else if ((response.data as any).data && Array.isArray((response.data as any).data)) {
          numbersData = (response.data as any).data;
        }

        const cleanedNumbers = numbersData
          .filter(num => num && typeof num === 'string')
          .map(num => String(num).trim())
          .map(num => num.replace(/\s+/g, ''))
          .filter(num => {
            if (!num || num === "") return false;
            if (!/^[\d+]+$/.test(num)) return false;
            const digitCount = (num.match(/\d/g) || []).length;
            if (digitCount < 7) return false;
            return true;
          });

        const filteredOut = numbersData.length - cleanedNumbers.length;

        if (cleanedNumbers.length > 0) {
          setPhoneNumbers(cleanedNumbers);
          toast.success(
            filteredOut > 0
              ? `${cleanedNumbers.length} дугаар татагдлаа (${filteredOut} буруу дугаар алгасан)`
              : `${cleanedNumbers.length} дугаар татагдлаа`
          );
        } else {
          setPhoneNumbers([""]);
          toast.warning("Энэ блокт хүчинтэй дугаар олдсонгүй");
        }
      }
    } catch (err) {
      toast.error("Дугаарууд татахад алдаа гарлаа");
      setPhoneNumbers([""]);
    } finally {
      setLoadingNumbers(false);
    }
  };

  const handleAddPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, ""]);
  };

  const handleRemovePhoneNumber = (index: number) => {
    if (phoneNumbers.length > 1) {
      setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
    }
  };

  const handlePhoneNumberChange = (index: number, value: string) => {
    const newPhoneNumbers = [...phoneNumbers];
    newPhoneNumbers[index] = value;
    setPhoneNumbers(newPhoneNumbers);
  };

  const formatDateForAPI = (dateTimeLocal: string): string => {
    if (!dateTimeLocal) return "";
    // Convert from "YYYY-MM-DDTHH:mm" to "YYYY-MM-DD HH:mm:ss"
    const date = new Date(dateTimeLocal);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = "00";
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const getCurrentDateTime = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation - Filter and clean phone numbers
    const validPhoneNumbers = phoneNumbers
      .filter(phone => phone && typeof phone === 'string')
      .map(phone => phone.trim())
      .map(phone => phone.replace(/\s+/g, ''))
      .filter(phone => {
        if (!phone || phone === "") return false;
        if (!/^[\d+]+$/.test(phone)) return false;
        const digitCount = (phone.match(/\d/g) || []).length;
        if (digitCount < 7) return false;
        return true;
      });

    if (validPhoneNumbers.length === 0) {
      toast.error("Утасны дугаар оруулна уу");
      return;
    }

    if (!message.trim()) {
      toast.error("Мэссэж оруулна уу");
      return;
    }

    if (!dueDate) {
      toast.error("Илгээх хугацаа сонгоно уу");
      return;
    }

    const finalPhoneNumbers = validPhoneNumbers.filter(phone => {
      return phone &&
        typeof phone === 'string' &&
        phone.trim().length >= 7 &&
        /^[\d+]+$/.test(phone);
    });

    if (finalPhoneNumbers.length === 0) {
      toast.error("Хүчинтэй утасны дугаар олдсонгүй");
      return;
    }

    setLoading(true);

    try {
      const formattedDate = formatDateForAPI(dueDate);

      const payload = {
        phone_numbers: finalPhoneNumbers,
        message: message.trim(),
        due_date: formattedDate,
      };

      const response = await sendMessage(payload);

      if (response.error) {
        toast.error(response.error || "Мэссэж илгээхэд алдаа гарлаа");
      } else {
        toast.success("Мэссэж амжилттай илгээгдлээ");
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Мэссэж илгээх</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-6">
            {/* Phone Numbers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  Утасны дугаарууд
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPhoneNumber}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Нэмэх
                </Button>
              </div>

              {/* Block Selection */}
              <div className="rounded-lg space-y-2">
                {loadingBlocks ? (
                  <BlockLoadingSkeleton />
                ) : blocks.length === 0 ? (
                  <BlockEmptyState />
                ) : (
                  <div className="flex gap-2">
                    <Select
                      value={selectedBlock}
                      onValueChange={handleBlockSelect}
                      disabled={loadingNumbers}
                    >
                      <SelectTrigger className="flex-1 text-sm border-blue-300 focus:ring-blue-500 bg-white">
                        <SelectValue placeholder="Блок сонгож дугаар нэмэх..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-100">
                        {blocks.map((block) => (
                          <SelectItem key={block.id} value={String(block.id)}>
                            {block.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {loadingNumbers && <NumbersLoadingSpinner />}
                  </div>
                )}

                {/* Show selected numbers preview */}
                {!loadingNumbers && selectedBlock && phoneNumbers.length > 0 && phoneNumbers[0] !== "" && (
                  <div className="bg-white border border-blue-200 rounded-lg p-2">
                    <div className="flex flex-wrap gap-1">
                      {phoneNumbers.slice(0, 10).map((phone, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {phone}
                        </span>
                      ))}
                      {phoneNumbers.length > 10 && (
                        <button
                          type="button"
                          onClick={() => setShowAllNumbers(true)}
                          className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs rounded font-medium transition-colors"
                        >
                          +{phoneNumbers.length - 10} бусад...
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-xs text-blue-700">
                  {selectedBlock
                    ? `Нийт ${phoneNumbers.filter(p => p.trim()).length} дугаар сонгогдсон`
                    : "Блок сонгосон дугаарууд доорх жагсаалтад автоматаар нэмэгдэнэ"
                  }
                </p>
              </div>

              {/* Manual Phone Number Inputs - Only show if no block selected */}
              {!selectedBlock && (
                <>
                  <div className="space-y-2">
                    {phoneNumbers.map((phone, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="text"
                          placeholder="Утасны дугаар (жишээ: 99123456)"
                          value={phone}
                          onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
                          className="flex-1"
                        />
                        {phoneNumbers.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePhoneNumber(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Нийт: {phoneNumbers.filter(p => p.trim()).length} дугаар</span>
                    <span>Гараар нэмэх эсвэл блокоор сонгох</span>
                  </div>
                </>
              )}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Мэссэж
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Илгээх мэссэжээ бичнэ үү..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
              />
              <p className="text-xs text-slate-500">
                Тэмдэгтийн тоо: {message.length}
              </p>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Илгээх хугацаа
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={getCurrentDateTime()}
                  className="w-full"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-xs text-slate-500">
                Мэссэж хэзээ илгээгдэх огноо, цаг
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Болих
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <LoadingSpinner text="Илгээж байна..." size="md" color="white" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Илгээх
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Show All Numbers Modal */}
      {showAllNumbers && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowAllNumbers(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Сонгогдсон дугаарууд
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Нийт {phoneNumbers.filter(p => p.trim()).length} дугаар
                </p>
              </div>
              <button
                onClick={() => setShowAllNumbers(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {phoneNumbers.filter(p => p.trim()).map((phone, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-center px-3 py-2 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded"
                  >
                    {phone}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <Button
                type="button"
                variant="default"
                onClick={() => setShowAllNumbers(false)}
              >
                Хаах
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
