"use client";

import React, { useState, useEffect } from "react";
import { X, Send, Plus, Users } from "lucide-react";
import { Button } from "../../../ui/button";
import { DateTimePicker } from "../../../ui/datetime-picker";
import { toast } from "sonner";
import { sendMessage, getSmsBlocks, getSmsNumbersByBlock, SmsBlock } from "@/lib/api";
import { LoadingSpinner } from "./BlockLoadingSkeleton";
import { PhoneNumberInput } from "./send-message-components/PhoneNumberInput";
import { BlockSelector } from "./send-message-components/BlockSelector";
import { BlockNumbersList } from "./send-message-components/BlockNumbersList";
import { AllNumbersModal } from "./send-message-components/AllNumbersModal";

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
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<SmsBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const [blockNumbers, setBlockNumbers] = useState<string[]>([]);
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
      setBlockNumbers([]);
      return;
    }

    setSelectedBlock(blockId);
    setLoadingNumbers(true);

    try {
      const response = await getSmsNumbersByBlock(Number(blockId));

      if (response.error) {
        toast.error("Дугаарууд татахад алдаа гарлаа");
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
          // Combine with existing blockNumbers and remove duplicates
          const combined = [...blockNumbers, ...cleanedNumbers];
          const unique = Array.from(new Set(combined));

          setBlockNumbers(unique);
          toast.success(
            filteredOut > 0
              ? `${cleanedNumbers.length} дугаар татагдлаа (${filteredOut} буруу дугаар алгасан)`
              : `${cleanedNumbers.length} дугаар татагдлаа`
          );
        } else {
          toast.warning("Энэ блокт хүчинтэй дугаар олдсонгүй");
        }
      }
    } catch (err) {
      toast.error("Дугаарууд татахад алдаа гарлаа");
      setBlockNumbers([]);
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

  const handleAddToBlock = () => {
    // Validate and clean manual phone numbers
    const validNumbers = phoneNumbers
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

    if (validNumbers.length === 0) {
      toast.error("Хүчинтэй дугаар оруулна уу (7+ орон)");
      return;
    }

    // Add to block numbers (remove duplicates)
    const combined = [...blockNumbers, ...validNumbers];
    const unique = Array.from(new Set(combined));

    setBlockNumbers(unique);
    setPhoneNumbers([""]); // Reset manual inputs

    toast.success(`${validNumbers.length} дугаар блок жагсаалтад нэмэгдлээ`);
  };

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = "00";
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Combine manual phone numbers and block numbers
    const manualNumbers = phoneNumbers
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

    // Combine manual + block numbers
    const allNumbers = [...manualNumbers, ...blockNumbers];

    // Remove duplicates
    const uniqueNumbers = Array.from(new Set(allNumbers));

    if (uniqueNumbers.length === 0) {
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

    const finalPhoneNumbers = uniqueNumbers.filter(phone => {
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
      const formattedDate = formatDateForAPI(dueDate!);

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
              <BlockSelector
                blocks={blocks}
                selectedBlock={selectedBlock}
                loadingBlocks={loadingBlocks}
                loadingNumbers={loadingNumbers}
                onBlockSelect={handleBlockSelect}
              />

              {/* Saved Block Numbers List */}
              <BlockNumbersList
                blockNumbers={blockNumbers}
                onClear={() => setBlockNumbers([])}
                onRemoveDuplicates={() => {
                  const unique = Array.from(new Set(blockNumbers));
                  setBlockNumbers(unique);
                }}
                onShowAll={() => setShowAllNumbers(true)}
              />

              {/* Manual Phone Number Inputs */}
              <div className="space-y-2">
                <PhoneNumberInput
                  phoneNumbers={phoneNumbers}
                  onAdd={handleAddPhoneNumber}
                  onRemove={handleRemovePhoneNumber}
                  onChange={handlePhoneNumberChange}
                />

                {/* Add to Block Button */}
                {phoneNumbers.some(p => p.trim()) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddToBlock}
                    className="w-full border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Блок жагсаалтад нэмэх ({phoneNumbers.filter(p => p.trim()).length})
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Гараар: {phoneNumbers.filter(p => p.trim()).length} дугаар
                  {blockNumbers.length > 0 && (
                    <span className="text-blue-600 ml-1">
                      | Блок: {blockNumbers.length} дугаар
                    </span>
                  )}
                </span>
                <span>Гараар нэмэх эсвэл блокоор сонгох</span>
              </div>
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
              <DateTimePicker
                value={dueDate}
                onChange={setDueDate}
                minDate={new Date()}
                placeholder="Огноо цаг сонгох"
              />
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
      <AllNumbersModal
        isOpen={showAllNumbers}
        blockNumbers={blockNumbers}
        onClose={() => setShowAllNumbers(false)}
      />
    </div>
  );
};
