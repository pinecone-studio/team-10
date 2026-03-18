"use client";

import { useMemo, useState } from "react";
import {
  ActionButton,
  Card,
  EmptyState,
  WorkspaceShell,
} from "../shared/WorkspacePrimitives";

type PendingAsset = {
  name: string;
  code: string;
  issuedAt: string;
  condition: string;
};

type TerminatingEmployee = {
  id: string;
  name: string;
  role: string;
  department: string;
  manager: string;
  lastWorkingDay: string;
  location: string;
  pendingAssets: PendingAsset[];
};

const terminatingEmployees: TerminatingEmployee[] = [
  {
    id: "emp-001",
    name: "Nomin-Erdene Bat",
    role: "Senior Product Designer",
    department: "Design",
    manager: "Ariunaa Tsogt",
    lastWorkingDay: "2026-03-29",
    location: "HQ, 4th floor",
    pendingAssets: [
      { name: 'MacBook Pro 14"', code: "IT-2041", issuedAt: "2025-08-12", condition: "Good" },
      { name: "Dell 27 Monitor", code: "IT-3188", issuedAt: "2025-11-03", condition: "Needs cable check" },
      { name: "Access card", code: "SEC-0081", issuedAt: "2024-01-15", condition: "Active" },
    ],
  },
  {
    id: "emp-002",
    name: "Temuulen Munkh",
    role: "Finance Analyst",
    department: "Finance",
    manager: "Solongo Erdene",
    lastWorkingDay: "2026-03-24",
    location: "Annex, 2nd floor",
    pendingAssets: [
      { name: 'ThinkPad X1 Carbon', code: "IT-2207", issuedAt: "2025-02-01", condition: "Good" },
      { name: "YubiKey", code: "SEC-0212", issuedAt: "2025-02-01", condition: "Active" },
    ],
  },
  {
    id: "emp-003",
    name: "Batjargal Enkhjin",
    role: "Operations Coordinator",
    department: "Operations",
    manager: "Ganbaatar Lhagva",
    lastWorkingDay: "2026-04-02",
    location: "Warehouse B",
    pendingAssets: [
      { name: "Samsung A54", code: "MOB-1142", issuedAt: "2025-06-09", condition: "Good" },
    ],
  },
];

export function HigherUpTerminateSection() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(terminatingEmployees[0]?.id ?? "");
  const selectedEmployee = useMemo(
    () =>
      terminatingEmployees.find((employee) => employee.id === selectedEmployeeId) ??
      terminatingEmployees[0] ??
      null,
    [selectedEmployeeId],
  );

  if (!selectedEmployee) {
    return (
      <WorkspaceShell
        title="Terminate access"
        subtitle="Review offboarding and confirm assets that must be retrieved."
      >
        <EmptyState
          title="No employees queued for termination"
          description="Once HR starts an offboarding flow, the responsible employee and pending assets will appear here."
        />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell
      title="Terminate access"
      subtitle="Select an employee, review assigned assets, and terminate access when the offboarding review is ready."
    >
      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card
          title="Terminate employee"
          trailing={<span className="text-[11px] text-[#8a8a8a]">{terminatingEmployees.length} active</span>}
        >
          <div className="space-y-4">
            <label className="flex flex-col gap-2 text-[12px] text-[#525252]">
              <span>Select employee</span>
              <select
                value={selectedEmployeeId}
                onChange={(event) => setSelectedEmployeeId(event.target.value)}
                className="h-[42px] rounded-[10px] border border-[#d7dde5] bg-[#f8fafc] px-3 text-[13px] text-[#171717] outline-none"
              >
                {terminatingEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.department}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-4">
              <p className="text-[15px] font-semibold text-[#111827]">{selectedEmployee.name}</p>
              <p className="mt-1 text-[12px] text-[#64748b]">{selectedEmployee.role}</p>
              <div className="mt-4 space-y-2 text-[12px] text-[#475569]">
                <div className="flex items-center justify-between gap-3">
                  <span>Department</span>
                  <span className="font-medium text-[#0f172a]">{selectedEmployee.department}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Last working day</span>
                  <span className="font-medium text-[#0f172a]">{selectedEmployee.lastWorkingDay}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Assigned assets</span>
                  <span className="font-medium text-[#0f172a]">{selectedEmployee.pendingAssets.length}</span>
                </div>
              </div>
            </div>

            <ActionButton variant="warning">Terminate</ActionButton>
          </div>
        </Card>

        <div className="space-y-5">
          <Card
            title="Assigned assets"
          >
            <div className="space-y-3">
              {selectedEmployee.pendingAssets.map((asset) => (
                <div
                  key={asset.code}
                  className="grid gap-3 rounded-[14px] border border-[#e5e7eb] bg-[#fcfcfd] px-4 py-4 md:grid-cols-[1.3fr_0.7fr_0.7fr_auto]"
                >
                  <div>
                    <p className="text-[14px] font-semibold text-[#0f172a]">{asset.name}</p>
                    <p className="mt-1 text-[12px] text-[#64748b]">{asset.code}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#94a3b8]">Issued</p>
                    <p className="mt-1 text-[13px] text-[#334155]">{asset.issuedAt}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#94a3b8]">Condition</p>
                    <p className="mt-1 text-[13px] text-[#334155]">{asset.condition}</p>
                  </div>
                  <div className="flex items-center md:justify-end">
                    <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-[11px] font-medium text-[#1d4ed8]">
                      Assigned
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </WorkspaceShell>
  );
}
