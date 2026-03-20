import type { AppRole } from "./roles";

export type NavIcon =
  | "home"
  | "order"
  | "receive"
  | "storage"
  | "distribution"
  | "dispose"
  | "terminate"
  | "requests"
  | "support"
  | "notifications";

export type SectionKey =
  | "home"
  | "order"
  | "receive"
  | "storage"
  | "distribution"
  | "dispose"
  | "terminate"
  | "employeeRequests"
  | "employeeSupport"
  | "employeeNotifications";

export type NavItem = {
  label: string;
  icon: NavIcon;
  section: SectionKey;
  homeOnly?: boolean;
};

export const navItems: readonly NavItem[] = [
  { label: "ORDER", icon: "order", section: "order" },
  { label: "RECEIVE", icon: "receive", section: "receive" },
  { label: "STORAGE", icon: "storage", section: "storage" },
  { label: "DISTRIBUTION", icon: "distribution", section: "distribution" },
  { label: "REQUESTS", icon: "requests", section: "employeeRequests" },
  { label: "SUPPORT", icon: "support", section: "employeeSupport" },
  { label: "NOTIFICATIONS", icon: "notifications", section: "employeeNotifications" },
  { label: "TERMINATE", icon: "terminate", section: "terminate" },
];

export const roleNavSections: Record<AppRole, readonly SectionKey[]> = {
  employee: ["distribution", "employeeRequests", "employeeSupport", "employeeNotifications"],
  higherUpApprover: ["terminate"],
  inventoryHead: ["order", "receive", "storage"],
  finance: ["order"],
  itAdmin: ["storage", "dispose"],
  hrManager: ["storage", "distribution", "dispose"],
  systemAdmin: ["order", "receive", "storage", "distribution", "dispose", "terminate"],
};

export function getSectionHref(role: AppRole | undefined, section: SectionKey) {
  if (section === "home") {
    if (!role) return "/";
    return `/?role=${role}`;
  }
  if (!role) return "/";
  return `/${role}?section=${section}`;
}
