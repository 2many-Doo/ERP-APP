"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Send, Plus, ArrowLeft } from "lucide-react";
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

function extractSmsBlocks(raw: unknown): SmsBlock[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return normalizeBlockItems(raw);
  }
  if (typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;

  if (Array.isArray(o.data)) {
    return normalizeBlockItems(o.data);
  }
  if (o.data && typeof o.data === "object") {
    const d = o.data as Record<string, unknown>;
    if (Array.isArray(d.data)) return normalizeBlockItems(d.data);
    if (Array.isArray(d.blocks)) return normalizeBlockItems(d.blocks);
  }
  if (Array.isArray(o.blocks)) {
    return normalizeBlockItems(o.blocks);
  }
  return [];
}

/** Туршилтын/placeholder блокуудыг жагсаалтаас хасна (жишээ: name, name1, name2) */
function isHiddenPlaceholderBlockName(name: string): boolean {
  const t = name.trim();
  if (!t) return true;
  return /^name\d*$/i.test(t);
}

function normalizeBlockItems(items: unknown[]): SmsBlock[] {
  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const b = item as Record<string, unknown>;
      const id = Number(b.id);
      const name = b.name != null ? String(b.name) : "";
      if (!Number.isFinite(id)) return null;
      if (isHiddenPlaceholderBlockName(name)) return null;
      return {
        id,
        name,
        phone_numbers: b.phone_numbers as string[] | undefined,
        merchants: b.merchants,
      } as SmsBlock;
    })
    .filter((x): x is SmsBlock => x != null);
}

export const SendMessageModal: React.FC<SendMessageModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([""]);
  const [message, setMessage] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<SmsBlock[]>([]);
  const [selectedBlockIds, setSelectedBlockIds] = useState<number[]>([]);
  const [blockNumbers, setBlockNumbers] = useState<string[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingNumbers, setLoadingNumbers] = useState(false);
  const [showAllNumbers, setShowAllNumbers] = useState(false);
  const [step, setStep] = useState<"edit" | "preview">("edit");
  const [previewPhones, setPreviewPhones] = useState<string[]>([]);
  const [previewMessage, setPreviewMessage] = useState("");
  const [previewDueDate, setPreviewDueDate] = useState<Date | null>(null);
  const blockNumbersRef = useRef<string[]>([]);

  useEffect(() => {
    blockNumbersRef.current = blockNumbers;
  }, [blockNumbers]);

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    setLoadingBlocks(true);
    try {
      const response = await getSmsBlocks();
      if (response.error) {
        toast.error(response.error);
        setBlocks([]);
        return;
      }
      if (response.data !== undefined && response.data !== null) {
        const blocksList = extractSmsBlocks(response.data);
        setBlocks(blocksList);
        setSelectedBlockIds((prev) =>
          prev.filter((id) => blocksList.some((b) => b.id === id)),
        );
      } else {
        setBlocks([]);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Блокын жагсаалт татахад алдаа гарлаа",
      );
      setBlocks([]);
    } finally {
      setLoadingBlocks(false);
    }
  };

  const parseNumbersPayload = (data: unknown): any[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      const o = data as Record<string, unknown>;
      if (Array.isArray(o.data)) return o.data;
      if (o.data && typeof o.data === "object") {
        const d = o.data as Record<string, unknown>;
        if (Array.isArray(d.data)) return d.data;
        if (Array.isArray(d.phone_numbers)) return d.phone_numbers;
        if (Array.isArray(d.numbers)) return d.numbers;
      }
      if (Array.isArray(o.phone_numbers)) return o.phone_numbers;
      if (Array.isArray(o.numbers)) return o.numbers;
    }
    return [];
  };

  const cleanRawNumbers = (numbersData: any[]): string[] =>
    numbersData
      .map((num) => {
        if (num == null) return "";
        if (typeof num === "object") {
          const o = num as Record<string, unknown>;
          const v =
            o.phone ?? o.phone_number ?? o.mobile ?? o.number ?? o.tel;
          if (v != null) return String(v).trim();
        }
        return String(num).trim();
      })
      .map((num) => num.replace(/\s+/g, ""))
      .filter((num) => {
        if (!num || num === "") return false;
        if (!/^[\d+]+$/.test(num)) return false;
        const digitCount = (num.match(/\d/g) || []).length;
        if (digitCount < 7) return false;
        return true;
      });

  const fetchNumbersFromSelectedBlocks = async () => {
    if (selectedBlockIds.length === 0) {
      toast.error("Хамгийн багадаа нэг блок сонгоно уу");
      return;
    }

    setLoadingNumbers(true);

    try {
      const responses = await Promise.all(
        selectedBlockIds.map((id) => getSmsNumbersByBlock(id)),
      );

      let combinedCleaned: string[] = [];
      let errorCount = 0;
      let totalFilteredOut = 0;

      for (let i = 0; i < responses.length; i++) {
        const response = responses[i];
        if (response.error) {
          errorCount += 1;
          continue;
        }
        if (!response.data) continue;

        const numbersData = parseNumbersPayload(response.data);
        const cleaned = cleanRawNumbers(numbersData);
        totalFilteredOut += numbersData.length - cleaned.length;
        combinedCleaned = [...combinedCleaned, ...cleaned];
      }

      if (errorCount > 0 && errorCount === responses.length) {
        toast.error("Дугаарууд татахад алдаа гарлаа");
        return;
      }

      if (combinedCleaned.length === 0) {
        toast.warning("Сонгосон блокуудад хүчинтэй дугаар олдсонгүй");
        return;
      }

      const prev = blockNumbersRef.current;
      const merged = Array.from(new Set([...prev, ...combinedCleaned]));
      const newCount = merged.length - prev.length;
      setBlockNumbers(merged);

      const msg =
        newCount > 0
          ? totalFilteredOut > 0
            ? `${newCount} шинэ дугаар нэмэгдлээ (нийт ${merged.length} өөр дугаар; ${totalFilteredOut} буруу алгасан)`
            : `${newCount} шинэ дугаар нэмэгдлээ (нийт ${merged.length} өөр дугаар)`
          : "Бүх дугаар аль хэдийн жагсаалтад байна (давхардал хасагдсан)";

      if (errorCount > 0) {
        toast.warning(`${errorCount} блокийн дугаар татагдаагүй. ${msg}`);
      } else {
        toast.success(msg);
      }
    } catch {
      toast.error("Дугаарууд татахад алдаа гарлаа");
    } finally {
      setLoadingNumbers(false);
    }
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

  const collectFinalPhoneNumbers = (): string[] | null => {
    const manualNumbers = phoneNumbers
      .filter(phone => phone && typeof phone === "string")
      .map(phone => phone.trim())
      .map(phone => phone.replace(/\s+/g, ""))
      .filter(phone => {
        if (!phone || phone === "") return false;
        if (!/^[\d+]+$/.test(phone)) return false;
        const digitCount = (phone.match(/\d/g) || []).length;
        if (digitCount < 7) return false;
        return true;
      });

    const allNumbers = [...manualNumbers, ...blockNumbers];
    const uniqueNumbers = Array.from(new Set(allNumbers));

    if (uniqueNumbers.length === 0) {
      toast.error("Утасны дугаар оруулна уу");
      return null;
    }

    if (!message.trim()) {
      toast.error("Мэссэж оруулна уу");
      return null;
    }

    if (!dueDate) {
      toast.error("Илгээх хугацаа сонгоно уу");
      return null;
    }

    const finalPhoneNumbers = uniqueNumbers.filter(phone => {
      return (
        phone &&
        typeof phone === "string" &&
        phone.trim().length >= 7 &&
        /^[\d+]+$/.test(phone)
      );
    });

    if (finalPhoneNumbers.length === 0) {
      toast.error("Хүчинтэй утасны дугаар олдсонгүй");
      return null;
    }

    return finalPhoneNumbers;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPhoneNumbers = collectFinalPhoneNumbers();
    if (!finalPhoneNumbers || !dueDate) return;

    setPreviewPhones(finalPhoneNumbers);
    setPreviewMessage(message.trim());
    setPreviewDueDate(dueDate);
    setStep("preview");
  };

  const handleConfirmSend = async () => {
    if (!previewDueDate || previewPhones.length === 0 || !previewMessage.trim()) {
      toast.error("Өгөгдөл дутуу байна");
      return;
    }

    setLoading(true);

    try {
      const formattedDate = formatDateForAPI(previewDueDate);

      const payload = {
        phone_numbers: previewPhones,
        message: previewMessage.trim(),
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

  const handleBackFromPreview = () => {
    setStep("edit");
  };

  const formatDateDisplay = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${d} ${h}:${min}`;
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            {step === "preview" ? "Урьдчилан харах" : "Мэссэж илгээх"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "preview" && previewDueDate ? (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 space-y-2">
                <p className="text-sm font-medium text-slate-700">Хүлээн авагчид</p>
                <p className="text-lg font-semibold text-slate-900">
                  {previewPhones.length} дугаарт илгээгдэнэ
                </p>
                <div className="max-h-36 overflow-y-auto rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 flex flex-wrap gap-2">
                  {previewPhones.map((p, i) => (
                    <span
                      key={`${p}-${i}`}
                      className="inline-flex rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-800"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Мэссэж</p>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 whitespace-pre-wrap min-h-[5rem]">
                  {previewMessage}
                </div>
                <p className="text-xs text-slate-500">Тэмдэгтийн тоо: {previewMessage.length}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Илгээх хугацаа</p>
                <p className="text-base text-slate-900">{formatDateDisplay(previewDueDate)}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <Button
                type="button"
                variant="outline"
                onClick={handleBackFromPreview}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Засах
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={handleConfirmSend}
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
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col min-h-0">
            <div className="px-6 py-6 space-y-6">
              {/* Phone Numbers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    Утасны дугаарууд
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                </div>

                {/* Block Selection */}
                <BlockSelector
                  blocks={blocks}
                  selectedBlockIds={selectedBlockIds}
                  onSelectedChange={setSelectedBlockIds}
                  loadingBlocks={loadingBlocks}
                  loadingNumbers={loadingNumbers}
                  onFetchSelected={fetchNumbersFromSelectedBlocks}
                />

                {/* Saved Block Numbers List */}
                <BlockNumbersList
                  blockNumbers={blockNumbers}
                  onClear={() => setBlockNumbers([])}
                  onShowAll={() => setShowAllNumbers(true)}
                  onRemoveNumber={(phone) => {
                    setBlockNumbers(blockNumbers.filter(num => num !== phone));
                  }}
                />

                {/* Manual Phone Number Inputs */}
                <div className="space-y-2 flex items-center gap-2 justify-center">
                  <PhoneNumberInput
                    phoneNumbers={phoneNumbers}
                    onRemove={handleRemovePhoneNumber}
                    onChange={handlePhoneNumberChange}
                  />

                  {/* Add to Block Button */}
                  {phoneNumbers.some(p => p.trim()) && (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={handleAddToBlock}
                      className=" border-green-300 text-white p-4"
                    >
                      <Plus className="h-4 w-4" />
                      Нэмэх ({phoneNumbers.filter(p => p.trim()).length})
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
                <Send className="h-4 w-4" />
                Урьдчилан харах
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Show All Numbers Modal */}
      <AllNumbersModal
        isOpen={showAllNumbers}
        blockNumbers={blockNumbers}
        onClose={() => setShowAllNumbers(false)}
        onRemoveNumber={(phone) => {
          setBlockNumbers(blockNumbers.filter(num => num !== phone));
          toast.success("Дугаар хасагдлаа");
        }}
      />
    </div>
  );
};
