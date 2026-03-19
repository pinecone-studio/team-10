"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchAssetDistributionsRequest,
  fetchEmployeeDirectoryRequest,
  terminateEmployeeAssetsRequest,
  type DistributionRecordDto,
  type EmployeeDirectoryEntryDto,
} from "@/app/(dashboard)/_graphql/distribution/distribution-api";
import {
  ActionButton,
  Card,
  EmptyState,
  WorkspaceShell,
} from "../shared/WorkspacePrimitives";

type TerminatingEmployee = EmployeeDirectoryEntryDto & {
  pendingAssets: DistributionRecordDto[];
};

export function HigherUpTerminateSection() {
  const [employees, setEmployees] = useState<EmployeeDirectoryEntryDto[]>([]);
  const [records, setRecords] = useState<DistributionRecordDto[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function reload() {
    const [employeeDirectory, distributions] = await Promise.all([
      fetchEmployeeDirectoryRequest(true),
      fetchAssetDistributionsRequest(false),
    ]);
    setEmployees(employeeDirectory);
    setRecords(distributions);
  }

  useEffect(() => {
    void reload();
  }, []);

  const terminatingEmployees = useMemo<TerminatingEmployee[]>(() => {
    return employees
      .map((employee) => ({
        ...employee,
        pendingAssets: records.filter(
          (record) =>
            record.employeeId === employee.id &&
            record.status === "active" &&
            record.assetStatus === "assigned",
        ),
      }))
      .filter((employee) => employee.pendingAssets.length > 0);
  }, [employees, records]);

  const effectiveSelectedEmployeeId =
    terminatingEmployees.some((employee) => employee.id === selectedEmployeeId)
      ? selectedEmployeeId
      : terminatingEmployees[0]?.id ?? "";

  const selectedEmployee =
    terminatingEmployees.find(
      (employee) => employee.id === effectiveSelectedEmployeeId,
    ) ?? null;

  async function terminateEmployee() {
    if (!selectedEmployee) {
      setNotice("No employee selected.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await terminateEmployeeAssetsRequest({
        employeeId: selectedEmployee.id,
        note: note.trim() || null,
      });

      if (!result) {
        setNotice("Termination request finished without response.");
      } else {
        setNotice(
          `${result.employeeName} terminated. ${result.pendingAssetCount} asset(s) moved to pending retrieval. Email status: ${result.emailStatus}${result.emailError ? ` (${result.emailError})` : ""}`,
        );
      }
      setNote("");
      await reload();
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Failed to terminate employee.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!selectedEmployee) {
    return (
      <WorkspaceShell
        title="Terminate access"
        subtitle="Review offboarding and confirm assets that must be retrieved."
      >
        <EmptyState
          title="No employees queued for termination"
          description="Once an active employee has assigned assets, they appear here for termination."
        />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell
      title="Terminate access"
      subtitle="Select a real employee from DB, review assigned assets, and terminate with retrieval workflow."
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
                value={effectiveSelectedEmployeeId}
                onChange={(event) => setSelectedEmployeeId(event.target.value)}
                className="h-[42px] rounded-[10px] border border-[#d7dde5] bg-[#f8fafc] px-3 text-[13px] text-[#171717] outline-none"
              >
                {terminatingEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.fullName}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-4">
              <p className="text-[15px] font-semibold text-[#111827]">{selectedEmployee.fullName}</p>
              <p className="mt-1 text-[12px] text-[#64748b]">{selectedEmployee.role}</p>
              <div className="mt-4 space-y-2 text-[12px] text-[#475569]">
                <div className="flex items-center justify-between gap-3">
                  <span>Email</span>
                  <span className="font-medium text-[#0f172a]">{selectedEmployee.email}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Assigned assets</span>
                  <span className="font-medium text-[#0f172a]">{selectedEmployee.pendingAssets.length}</span>
                </div>
              </div>
            </div>

            <label className="flex flex-col gap-2 text-[12px] text-[#525252]">
              <span>Termination note (optional)</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                className="rounded-[10px] border border-[#d7dde5] bg-[#f8fafc] px-3 py-2 text-[13px] text-[#171717] outline-none"
              />
            </label>

            <ActionButton variant="warning" onClick={() => void terminateEmployee()} disabled={isSubmitting}>
              {isSubmitting ? "Terminating..." : "Terminate"}
            </ActionButton>
            {notice ? <p className="text-[12px] text-[#166534]">{notice}</p> : null}
          </div>
        </Card>

        <div className="space-y-5">
          <Card title="Assigned assets">
            <div className="space-y-3">
              {selectedEmployee.pendingAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="grid gap-3 rounded-[14px] border border-[#e5e7eb] bg-[#fcfcfd] px-4 py-4 md:grid-cols-[1.3fr_0.7fr_0.7fr_auto]"
                >
                  <div>
                    <p className="text-[14px] font-semibold text-[#0f172a]">{asset.assetName}</p>
                    <p className="mt-1 text-[12px] text-[#64748b]">{asset.assetCode}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#94a3b8]">Issued</p>
                    <p className="mt-1 text-[13px] text-[#334155]">{asset.distributedAt.slice(0, 10)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#94a3b8]">Condition</p>
                    <p className="mt-1 text-[13px] text-[#334155]">{asset.conditionStatus}</p>
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
