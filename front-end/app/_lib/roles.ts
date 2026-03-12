export const roleOptions = [
  {
    value: "employee",
    label: "Employee",
    description: "Asset request and personal dashboard",
  },
  {
    value: "higherUpApprover",
    label: "Any Higher-ups",
    description: "Simulated higher-up approval before Finance review",
  },
  {
    value: "inventoryHead",
    label: "Inventory Head",
    description: "Storage, distribution, and approval flow",
  },
  {
    value: "finance",
    label: "Finance",
    description: "Budget, purchase, and disposal review",
  },
  {
    value: "itAdmin",
    label: "IT Admin",
    description: "Device setup, assignment, and maintenance",
  },
  {
    value: "hrManager",
    label: "HR Manager",
    description: "Employee lifecycle and onboarding support",
  },
  {
    value: "systemAdmin",
    label: "System Admin",
    description: "Platform settings and access control",
  },
] as const;

export type AppRole = (typeof roleOptions)[number]["value"];

export function isAppRole(value: string): value is AppRole {
  return roleOptions.some((role) => role.value === value);
}

export function getRoleMeta(role: AppRole) {
  return roleOptions.find((item) => item.value === role)!;
}
