import type { AppRole } from "./roles";

export type NavIcon =
  | "home"
  | "order"
  | "receive"
  | "storage"
  | "distribution"
  | "dispose"
  | "terminate";

export type SectionKey =
  | "home"
  | "order"
  | "receive"
  | "storage"
  | "distribution"
  | "dispose"
  | "terminate";

export type NavItem = {
  label: string;
  icon: NavIcon;
  section: SectionKey;
  homeOnly?: boolean;
};

export const navItems: readonly NavItem[] = [
  { label: "HOME", icon: "home", section: "home", homeOnly: true },
  { label: "ORDER", icon: "order", section: "order" },
  { label: "RECEIVE", icon: "receive", section: "receive" },
  { label: "STORAGE", icon: "storage", section: "storage" },
  { label: "DISTRIBUTION", icon: "distribution", section: "distribution" },
  { label: "DISPOSE", icon: "dispose", section: "dispose" },
  { label: "TERMINATE", icon: "terminate", section: "terminate" },
];

export const roleNavSections: Record<AppRole, readonly SectionKey[]> = {
  employee: ["distribution", "dispose"],
  higherUpApprover: ["terminate"],
  inventoryHead: ["order", "receive", "storage"],
  finance: ["order"],
  itAdmin: ["storage", "dispose"],
  hrManager: ["distribution", "dispose"],
  systemAdmin: ["order", "receive", "storage", "distribution", "dispose", "terminate"],
};

export function getSectionHref(role: AppRole | undefined, section: SectionKey) {
  if (section === "home") return "/";
  if (!role) return "/";
  return `/${role}?section=${section}`;
}
