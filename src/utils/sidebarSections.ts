import {
  ClipboardList,
  PanelsTopLeft,
  Settings,
  Store,
  DollarSign,
  MoreHorizontal,
  type LucideIcon,
  FileText,
} from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  href?: string;
  active?: boolean;
  children?: NavItem[];
  componentKey?: string;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
};

export type NavSection = {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
};

export const sidebarSections: NavSection[] = [
  {
    title: "Мерчант цэс",
    icon: Store,
    permission: "merchant_menu_show",
    items: [
      {
        id: "merchant-list",
        label: "Мерчант жагсаалт",
        componentKey: "merchant-list",
        permission: "merchant_menu_show",
      },
      {
        id: "vip-merchant-list",
        label: "VIP",
        componentKey: "vip-merchant-list",
        permission: "merchant_menu_show",
      },
      {
        id: "message",
        label: "Мэссэж",
        componentKey: "message",
        permission: "merchant_menu_show",
      },
      {
        id: "notification",
        label: "Мэдэгдэл",
        componentKey: "notification",
        permission: "merchant_menu_show",
      },
    ],
  },
  {
    title: "Гэрээ бүртгэл",
    icon: ClipboardList,
    permission: "contract_menu_show",
    items: [
      {
        id: "agreement-layout",
        label: "Түрээсийн хүсэлтүүд",
        componentKey: "tenant-list",
        permission: "lease_request_show",
      },
      {
        id: "layout",
        label: "Гэрээний бүрдүүлбэр",
        componentKey: "approved-tenant-list",
        permission: "lease_agreement_show",
      },
      {
        id: "contract-process",
        label: "Гэрээний процесс",
        componentKey: "contract-process",
        permission: "lease_agreement_show",
      },
      {
        id: "contract-template",
        label: "Гэрээний загвар",
        componentKey: "contract-layout",
        permission: "lease_agreement_show",
      },
      {
        id: "components",
        label: "Даатгалын мэдээлэл",
        componentKey: "insurance-management",
        permission: "lease_agreement_show",
      },
    ],
  },
  {
    title: "Талбай менежмент",
    icon: PanelsTopLeft,
    permission: "property_menu_show",
    items: [
      {
        id: "property-management",
        label: "Талбай бүртгэл",
        componentKey: "property-management",
        permission: "property_menu_show",
      },
      {
        id: "property-rate-update",
        label: "Үнэлгээ засах",
        componentKey: "property-rate-update",
        permission: "property_menu_show",
      },
      {
        id: "property-rate-history",
        label: "Үнэлгээний түүх",
        componentKey: "property-rate-history",
        permission: "property_menu_show",
      },
      {
        id: "property-type-list",
        label: "Талбайн төрөл",
        componentKey: "property-type-list",
        permission: "property_menu_show",
      },
      {
        id: "property-category-list",
        label: "Талбайн ангилал",
        componentKey: "property-category-list",
        permission: "property_menu_show",
      },
      {
        id: "property-product-type-list",
        label: "Бүтээгдэхүүний төрөл",
        componentKey: "property-product-type-list",
        permission: "property_menu_show",
      },
    ],
  },
  {
    title: "Санхүү",
    icon: DollarSign,
    permission: "finance_menu_show",
    items: [
      {
        id: "finance-bank-accounts",
        label: "Банкны данс",
        componentKey: "finance-bank-accounts",
        permission: "finance_menu_show",
      },
      {
        id: "finance-invoices",
        label: "Нэхэмжлэл",
        componentKey: "finance-invoices",
        permission: "finance_menu_show",
      },
    ],
  },
  {
    title: "Бусад",
    icon: MoreHorizontal,
    permission: "other_menu_show",
    items: [
      {
        id: "other-terms",
        label: "Үйлчилгээний нөхцөл",
        componentKey: "legal-documents",
      },
      {
        id: "other-settings",
        label: "Системийн тохиргоо",
        href: "#other-settings",
        permission: "",
      },
      {
        id: "other-help",
        label: "Тусламж",
        href: "#other-help",
      },
    ],
  },
  {
    title: "Удирдлага",
    icon: Settings,
    permission: "user_menu_show",
    items: [
      {
        id: "management-users",
        label: "Хэрэглэгчийн удирдлага",
        componentKey: "user-management",
        permission: "user_menu_show",
      },
      {
        id: "management-permissions",
        label: "Эрхийн удирдлага",
        componentKey: "permission-management",
        permission: "role_show",
      },
    ],
  },
  {
    title: "Файл сан",
    icon: FileText,
    items: [
      {
        id: "Tag-management",
        label: "Тaaг",
        componentKey: "Tag-management",
      },
      {
        id: "Category-management",
        label: "Ангилал",
        componentKey: "Category-management",
      },
      {
        id: "Photo-management",
        label: "Зураг",
        componentKey: "Photo-management",
      },
    ],
  },
];
