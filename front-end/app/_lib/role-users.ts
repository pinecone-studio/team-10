"use client";

import type { AppRole } from "./roles";

const roleUserIds: Record<AppRole, string> = {
  employee: "8101",
  higherUpApprover: "8201",
  inventoryHead: "8301",
  finance: "8401",
  itAdmin: "8501",
  hrManager: "8601",
  systemAdmin: "8901",
};

export function getRoleUserId(role: AppRole) {
  return roleUserIds[role];
}
