"use client";

import type { AppRole } from "../_lib/roles";
import type { SectionKey } from "../_lib/navigation";
import { OrderWorkspace } from "./OrderWorkspace";
import { EmployeeAssetsSection } from "./role/EmployeeAssetsSection";
import { EmployeeNotificationsSection } from "./role/EmployeeNotificationsSection";
import { EmployeeRequestsSection } from "./role/EmployeeRequestsSection";
import { EmployeeSupportSection } from "./role/EmployeeSupportSection";
import { FinanceApprovalSection } from "./role/FinanceApprovalSection";
import { HigherUpApprovalSection } from "./role/HigherUpApprovalSection";
import { HRDistributionSection } from "./role/HRDistributionSection";
import { HigherUpTerminateSection } from "./role/HigherUpTerminateSection";
import { InventoryReceiveSection } from "./role/InventoryReceiveSection";
import { InventoryStorageSection } from "./role/InventoryStorageSection";
import { PlaceholderSection } from "./role/PlaceholderSection";

export function RoleWorkspace({ role, roleLabel, section }: { role: AppRole; roleLabel: string; section: SectionKey }) {
  if (section === "order" && (role === "systemAdmin" || role === "inventoryHead")) return <OrderWorkspace role={role} roleLabel={roleLabel} />;
  if (role === "higherUpApprover" && section === "order") return <HigherUpApprovalSection />;
  if ((role === "higherUpApprover" || role === "systemAdmin") && section === "terminate") return <HigherUpTerminateSection />;
  if (role === "finance" && section === "order") return <FinanceApprovalSection />;
  if ((role === "inventoryHead" || role === "systemAdmin") && section === "receive") return <InventoryReceiveSection />;
  if (role === "inventoryHead" && section === "storage") return <InventoryStorageSection />;
  if ((role === "hrManager" || role === "systemAdmin") && section === "distribution") return <HRDistributionSection />;
  if (role === "employee" && section === "distribution") return <EmployeeAssetsSection />;
  if (role === "employee" && section === "employeeRequests") return <EmployeeRequestsSection />;
  if (role === "employee" && section === "employeeSupport") return <EmployeeSupportSection />;
  if (role === "employee" && section === "employeeNotifications") return <EmployeeNotificationsSection />;
  if (role === "systemAdmin") return <PlaceholderSection title="System admin overview" subtitle="Unified operational snapshot for the asset lifecycle." description={`Current section: ${section.toUpperCase()}`} />;
  if (role === "itAdmin") return <PlaceholderSection title="IT Admin workspace" subtitle="Receiving, maintenance, and disposal support." description="This role stays as a placeholder while the inventory-to-HR flow is being extended." />;
  return <PlaceholderSection title="Section unavailable" subtitle={`${roleLabel} role cannot open this workflow.`} description="Choose one of the allowed sidebar sections for this role." />;
}
