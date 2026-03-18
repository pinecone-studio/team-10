"use client";

import { useState } from "react";

type RetrievalMode = "solved" | "issue";

type RetrievalFormState = {
  mode: RetrievalMode;
  condition: string;
  status: string;
  notes: string;
  storageLocation: string;
};

const conditionOptions = [
  "Excellent",
  "Good",
  "Fair",
  "Worn",
  "Damaged",
  "Missing accessories",
] as const;

const solvedStatusOptions = [
  "Returned",
  "Returned to storage",
  "Ready for reassignment",
  "Resolved with employee",
] as const;

const issueStatusOptions = ["Broken", "Missing"] as const;
const storageLocationOptions = [
  "Main warehouse / Intake",
  "Main warehouse / Shelf A",
  "Quarantine storage",
  "Repair bench",
  "Security hold",
] as const;

const pendingRetrievalAssets = [
  {
    id: "retrieval-1",
    employee: "Nomin-Erdene Bat",
    department: "Design",
    assets: "MacBook Pro, Monitor, Access card",
    dueDate: "2026-03-29",
  },
  {
    id: "retrieval-2",
    employee: "Temuulen Munkh",
    department: "Finance",
    assets: "ThinkPad X1, YubiKey",
    dueDate: "2026-03-24",
  },
  {
    id: "retrieval-3",
    employee: "Batjargal Enkhjin",
    department: "Operations",
    assets: "Samsung A54",
    dueDate: "2026-04-02",
  },
] as const;

function getDefaultForm(mode: RetrievalMode): RetrievalFormState {
  return {
    mode,
    condition: "Good",
    status: mode === "solved" ? solvedStatusOptions[0] : issueStatusOptions[0],
    notes: "",
    storageLocation: mode === "solved" ? storageLocationOptions[0] : storageLocationOptions[2],
  };
}

export default function PendingRetrievalPanel() {
  const [activeForms, setActiveForms] = useState<Record<string, RetrievalFormState>>({});
  const [successMessageByItem, setSuccessMessageByItem] = useState<Record<string, string>>({});

  function openForm(itemId: string, mode: RetrievalMode) {
    setActiveForms((current) => ({
      ...current,
      [itemId]: getDefaultForm(mode),
    }));
  }

  function updateForm(
    itemId: string,
    key: keyof RetrievalFormState,
    value: RetrievalFormState[keyof RetrievalFormState],
  ) {
    setActiveForms((current) => {
      const existing = current[itemId];
      if (!existing) return current;

      return {
        ...current,
        [itemId]: {
          ...existing,
          [key]: value,
        },
      };
    });
  }

  function finalizeItem(itemId: string) {
    setSuccessMessageByItem((current) => ({
      ...current,
      [itemId]: "Successfully updated",
    }));
  }

  return (
    <section className="w-full rounded-[16px] border border-[#fecaca] bg-[linear-gradient(135deg,#fff7f7_0%,#ffffff_42%,#f8fafc_100%)] p-5 shadow-[0_10px_30px_rgba(239,68,68,0.06)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-[#fee2e2] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b91c1c]">
            Pending retrieval
          </span>
          <h3 className="mt-3 text-[24px] font-semibold tracking-[-0.03em] text-[#111827]">
            Assets that must be collected from employees
          </h3>
          <p className="mt-2 max-w-[760px] text-[13px] leading-6 text-[#64748b]">
            Keep offboarding and return work visible here so the team can retrieve company assets
            before reassignment, storage, or closure.
          </p>
        </div>
        <div className="rounded-[14px] border border-[#fca5a5] bg-white/85 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#b91c1c]">Open cases</p>
          <p className="mt-1 text-[22px] font-semibold text-[#111827]">
            {pendingRetrievalAssets.length}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-3">
        {pendingRetrievalAssets.map((item) => {
          const activeForm = activeForms[item.id];
          const statusOptions =
            activeForm?.mode === "issue" ? issueStatusOptions : solvedStatusOptions;
          const successMessage = successMessageByItem[item.id];

          return (
            <article
              key={item.id}
              className="rounded-[14px] border border-[#e5e7eb] bg-white/90 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold text-[#111827]">{item.employee}</p>
                  <p className="mt-1 text-[12px] text-[#64748b]">{item.department}</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#94a3b8]">Assets</p>
                  <p className="mt-1 text-[13px] leading-5 text-[#334155]">{item.assets}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#94a3b8]">Due back</p>
                  <p className="mt-1 text-[13px] font-medium text-[#0f172a]">{item.dueDate}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openForm(item.id, "solved")}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                    activeForm?.mode === "solved"
                      ? "bg-[#dcfce7] text-[#166534]"
                      : "bg-[#ecfdf3] text-[#15803d] hover:bg-[#dcfce7]"
                  }`}
                >
                  Solved
                </button>
                <button
                  type="button"
                  onClick={() => openForm(item.id, "issue")}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                    activeForm?.mode === "issue"
                      ? "bg-[#fee2e2] text-[#b91c1c]"
                      : "bg-[#fff1f2] text-[#e11d48] hover:bg-[#ffe4e6]"
                  }`}
                >
                  Broken or Missing
                </button>
              </div>

              {activeForm ? (
                <div className="mt-5 space-y-4 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4">
                  {successMessage ? (
                    <div className="rounded-[10px] border border-[#86efac] bg-[#f0fdf4] px-3 py-2 text-[12px] font-medium text-[#166534]">
                      {successMessage}
                    </div>
                  ) : null}
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-[12px] text-[#475569]">
                      <span>Condition</span>
                      <select
                        value={activeForm.condition}
                        onChange={(event) =>
                          updateForm(item.id, "condition", event.target.value)
                        }
                        className="h-[42px] rounded-[10px] border border-[#d7dde5] bg-white px-3 text-[13px] text-[#171717] outline-none"
                      >
                        {conditionOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="flex flex-col gap-2 text-[12px] text-[#475569]">
                      <span>Status</span>
                      <select
                        value={activeForm.status}
                        onChange={(event) =>
                          updateForm(item.id, "status", event.target.value)
                        }
                        className="h-[42px] rounded-[10px] border border-[#d7dde5] bg-white px-3 text-[13px] text-[#171717] outline-none"
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-[12px] text-[#475569]">
                      <span>Storage location</span>
                      <select
                        value={activeForm.storageLocation}
                        onChange={(event) =>
                          updateForm(item.id, "storageLocation", event.target.value)
                        }
                        className="h-[42px] rounded-[10px] border border-[#d7dde5] bg-white px-3 text-[13px] text-[#171717] outline-none"
                      >
                        {storageLocationOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="flex flex-col gap-2 text-[12px] text-[#475569]">
                    <span>Additional notes</span>
                    <textarea
                      value={activeForm.notes}
                      onChange={(event) => updateForm(item.id, "notes", event.target.value)}
                      rows={4}
                      placeholder="Add retrieval details, damage context, or handoff notes..."
                      className="rounded-[12px] border border-[#d7dde5] bg-white px-3 py-3 text-[13px] text-[#171717] outline-none placeholder:text-[#94a3b8]"
                    />
                  </label>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e2e8f0] pt-4">
                    <p className="text-[12px] text-[#64748b]">
                      Finalizing will close this retrieval case and pass the selected outcome to storage handling.
                    </p>
                    <button
                      type="button"
                      onClick={() => finalizeItem(item.id)}
                      className={`rounded-[10px] px-4 py-2 text-[12px] font-semibold text-white transition ${
                        activeForm.mode === "issue"
                          ? "bg-[#dc2626] hover:bg-[#b91c1c]"
                          : "bg-[#15803d] hover:bg-[#166534]"
                      }`}
                    >
                      Finalize and update storage
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
