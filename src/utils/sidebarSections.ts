import {
  ClipboardList,
  PanelsTopLeft,
  Settings,
  Store,
  DollarSign,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  href?: string;
  active?: boolean;
  children?: NavItem[];
  componentKey?: string;
};

export type NavSection = {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
};

export const sidebarSections: NavSection[] = [
  {
    title: "Удирдлага",
    icon: Settings,
    items: [
      {
        id: "management-users",
        label: "Хэрэглэгчийн удирдлага",
        componentKey: "user-management",
      },
      {
        id: "management-permissions",
        label: "Эрхийн удирдлага",
        componentKey: "permission-management",
      },
    ],
  },
  {
    title: "Мерчант цэс",
    icon: Store,
    items: [
      {
        id: "merchant-list",
        label: "Мерчант жагсаалт",
        componentKey: "merchant-list",
      },
    ],
  },
  {
    title: "Гэрээ бүртгэл",
    icon: ClipboardList,
    items: [
      {
        id: "agreement-layout",
        label: "Түрээсийн хүсэлтүүд",
        componentKey: "tenant-list",
      },
      {
        id: "layout",
        label: "Гэрээний бүрдүүлбэр",
        componentKey: "approved-tenant-list",
      },
      {
        id: "utilities",
        label: "Гэрээний процесс",
        componentKey: "contract-process",
      },
      {
        id: "components",
        label: "Даатгалын мэдээлэл",
        componentKey: "insurance-management",
      },
    ],
  },
  {
    title: "Талбай менежмент",
    icon: PanelsTopLeft,
    items: [
      {
        id: "field-dashboard",
        label: "Талбай бүртгэл",
        componentKey: "property-management",
      },
      {
        id: "rate-history",
        label: "Үнэлгээний түүх",
        componentKey: "property-rate-history",
      },
    ],
  },
  {
    title: "Санхүү",
    icon: DollarSign,
    items: [
      {
        id: "finance-transactions",
        label: "Гүйлгээ",
        href: "#finance-transactions",
      },
      {
        id: "finance-payments",
        label: "Төлбөр",
        href: "#finance-payments",
      },
      {
        id: "finance-invoices",
        label: "Нэхэмжлэх",
        href: "#finance-invoices",
      },
      {
        id: "finance-reports",
        label: "Санхүүгийн тайлан",
        href: "#finance-reports",
      },
    ],
  },
  {
    title: "Бусад",
    icon: MoreHorizontal,
    items: [
      {
        id: "other-settings",
        label: "Системийн тохиргоо",
        href: "#other-settings",
      },
      {
        id: "other-help",
        label: "Тусламж",
        href: "#other-help",
      },
      {
        id: "other-about",
        label: "Системийн тухай",
        href: "#other-about",
      },
    ],
  },
];


