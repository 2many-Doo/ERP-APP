"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Merchant } from "@/hooks/useMerchantManagement";
import { updateMerchant } from "@/lib/api";

interface EditMerchantModalProps {
  merchant: Merchant;
  onClose: () => void;
  onSuccess: () => void;
}

type MerchantType = "individual" | "organization";

const resolveType = (merchant: Merchant): MerchantType => {
  if (merchant.type === "organization") return "organization";
  if ((merchant as any).company_name || (merchant as any).company_rd) return "organization";
  return "individual";
};

export const EditMerchantModal: React.FC<EditMerchantModalProps> = ({ merchant, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: resolveType(merchant) as MerchantType,
    family_name: merchant.family_name || "",
    last_name: merchant.last_name || "",
    first_name: merchant.first_name || "",
    gender: merchant.gender || "",
    rd: merchant.rd || "",
    email: merchant.email || "",
    phone: merchant.phone || "",
    address: merchant.address || "",
    address_description: merchant.address_description || "",
    company_rd: (merchant as any).company_rd || "",
    company_name: (merchant as any).company_name || "",
    company_email: (merchant as any).company_email || "",
    company_phone: (merchant as any).company_phone || "",
    company_address: (merchant as any).company_address || "",
    company_address_description: (merchant as any).company_address_description || "",
    status: merchant.status || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData({
      type: resolveType(merchant),
      family_name: merchant.family_name || "",
      last_name: merchant.last_name || "",
      first_name: merchant.first_name || "",
      gender: merchant.gender || "",
      rd: merchant.rd || "",
      email: merchant.email || "",
      phone: merchant.phone || "",
      address: merchant.address || "",
      address_description: merchant.address_description || "",
      company_rd: (merchant as any).company_rd || "",
      company_name: (merchant as any).company_name || "",
      company_email: (merchant as any).company_email || "",
      company_phone: (merchant as any).company_phone || "",
      company_address: (merchant as any).company_address || "",
      company_address_description: (merchant as any).company_address_description || "",
      status: merchant.status || "",
    });
  }, [merchant]);

  const handleTypeChange = (value: MerchantType) => {
    // Төрлөө шилжүүлэхдээ талбаруудыг устгахгүй, байгууллага бол нэмэлт талбарууд л нэмэгдэнэ.
    setFormData((prev) => ({
      ...prev,
      type: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.family_name.trim() || !formData.last_name.trim() || !formData.first_name.trim()) {
      toast.error("Овог, Эцэг/эхийн нэр, Өөрийн нэрийг оруулна уу");
      return;
    }
    if (formData.type === "organization" && !formData.company_name.trim()) {
      toast.error("Компанийн нэрийг оруулна уу");
      return;
    }

    setSaving(true);
    try {
      const payload: any = { type: formData.type };

      if (formData.status) {
        payload.status = formData.status;
      }

      // Хувь хүний талбарууд үргэлж хадгална (байгууллага дээр ч илгээж болно)
      payload.family_name = formData.family_name.trim();
      payload.last_name = formData.last_name.trim();
      payload.first_name = formData.first_name.trim();
      if (formData.gender) payload.gender = formData.gender;
      if (formData.rd.trim()) payload.rd = formData.rd.trim();
      if (formData.email.trim()) payload.email = formData.email.trim();
      if (formData.phone.trim()) payload.phone = formData.phone.trim();
      if (formData.address.trim()) payload.address = formData.address.trim();
      if (formData.address_description.trim()) payload.address_description = formData.address_description.trim();

      if (formData.type === "organization") {
        payload.company_name = formData.company_name.trim();
        if (formData.company_rd.trim()) payload.company_rd = formData.company_rd.trim();
        if (formData.company_email.trim()) payload.company_email = formData.company_email.trim();
        if (formData.company_phone.trim()) payload.company_phone = formData.company_phone.trim();
        if (formData.company_address.trim()) payload.company_address = formData.company_address.trim();
        if (formData.company_address_description.trim())
          payload.company_address_description = formData.company_address_description.trim();
      }

      const response = await updateMerchant(merchant.id, payload);
      if (response.error) {
        toast.error(response.error || "Алдаа гарлаа");
      } else {
        toast.success("Мерчант мэдээлэл шинэчлэгдлээ");
        onSuccess();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[101] w-full max-w-2xl mx-4 bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Мерчант засах</h2>
            <p className="text-sm text-slate-500">Хувь хүн эсвэл байгууллага сонгоод талбаруудыг шинэчлэнэ.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Төлөв</label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Төлөв сонгох" />
              </SelectTrigger>
              <SelectContent className="z-[200] bg-white">
                <SelectItem value="active">Идэвхтэй</SelectItem>
                <SelectItem value="inactive">Идэвхгүй</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Хувь хүний талбарууд үргэлж харагдана */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Овог <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.family_name}
                onChange={(e) => setFormData({ ...formData, family_name: e.target.value })}
                placeholder="Овог"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Эцэг/эхийн нэр <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Эцэг/эхийн нэр"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Өөрийн нэр <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Өөрийн нэр"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Хүйс</label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Хүйс сонгох" />
                </SelectTrigger>
                <SelectContent className="z-[200] bg-white">
                  <SelectItem value="male">Эрэгтэй</SelectItem>
                  <SelectItem value="female">Эмэгтэй</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Регистрийн дугаар</label>
              <Input
                value={formData.rd}
                onChange={(e) => setFormData({ ...formData, rd: e.target.value })}
                placeholder="АБ12345678"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Имэйл</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Утасны дугаар</label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="99112233"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Хаяг</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Улаанбаатар"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Хаягийн тайлбар</label>
            <Input
              value={formData.address_description}
              onChange={(e) => setFormData({ ...formData, address_description: e.target.value })}
              placeholder="Баянзүрх дүүрэг 5-р хороо"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 bg-slate-50">
            <div>
              <p className="text-sm font-medium text-slate-800">Байгууллага эсэр</p>
              <p className="text-xs text-slate-500">Сонговол байгууллагын талбарууд нэмэгдэнэ</p>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4 accent-blue-600"
                checked={formData.type === "organization"}
                onChange={(e) => handleTypeChange(e.target.checked ? "organization" : "individual")}
              />
              <span className="text-sm text-slate-700">Байгууллага</span>
            </label>
          </div>

          {/* Байгууллагын талбарууд чеклэгдсэн үед нэмж харагдана */}
          {formData.type === "organization" && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Компанийн нэр <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="байгууллагын нэр"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Компанийн РД</label>
                <Input
                  value={formData.company_rd}
                  onChange={(e) => setFormData({ ...formData, company_rd: e.target.value })}
                  placeholder="байгууллагын РД"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Компанийн имэйл</label>
                <Input
                  type="email"
                  value={formData.company_email}
                  onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                  placeholder="company@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Компанийн утас</label>
                <Input
                  type="tel"
                  value={formData.company_phone}
                  onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                  placeholder="байгууллагын утас"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Компанийн хаяг</label>
                <Input
                  value={formData.company_address}
                  onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                  placeholder="байгууллагын хаяг"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Компанийн хаягийн дэлгэрэнгүй</label>
                <Input
                  value={formData.company_address_description}
                  onChange={(e) => setFormData({ ...formData, company_address_description: e.target.value })}
                  placeholder="байгууллагын хаягийн тайлбар"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Цуцлах
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              saving ||
              (formData.type === "individual"
                ? !formData.family_name.trim() || !formData.last_name.trim() || !formData.first_name.trim()
                : !formData.company_name.trim())
            }
          >
            {saving ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </div>
      </div>
    </div>
  );
};
