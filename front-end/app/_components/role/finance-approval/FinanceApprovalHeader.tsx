"use client";

export function FinanceApprovalHeader(props: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  pendingOrders: number;
  pendingItems: number;
  approvedItems: number;
  rejectedItems: number;
  allCount: number;
  needsDecisionCount: number;
  readyCount: number;
  activeTab: "all" | "needs-decision" | "ready";
  onTabChange: (value: "all" | "needs-decision" | "ready") => void;
}) {
  const metrics = [
    ["Pending orders", props.pendingOrders],
    ["Pending items", props.pendingItems],
    ["Marked approve", props.approvedItems],
    ["Marked reject", props.rejectedItems],
  ] as const;

  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <label className="relative flex h-10 min-w-[280px] flex-1 items-center rounded-[10px] border border-[#d7e4f2] bg-white px-4 shadow-[0_4px_16px_rgba(148,163,184,0.08)]">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none absolute left-[12px] top-[10px] h-4 w-4 text-[#64748b]"
            aria-hidden="true"
          >
            <path
              d="M7.33335 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33335C12.6667 4.38783 10.2789 2 7.33335 2C4.38783 2 2 4.38783 2 7.33335C2 10.2789 4.38783 12.6667 7.33335 12.6667Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 14L11.1 11.1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            value={props.searchValue}
            onChange={(event) => props.onSearchChange(event.target.value)}
            placeholder="Search by request number, requester, or department..."
            className="w-full bg-transparent pl-7 text-[14px] text-[#0f172a] outline-none placeholder:text-[#7b8ca4]"
          />
        </label>
        <button
          type="button"
          className="flex items-center justify-center gap-[10px] rounded-[6px] border border-[#d8e8ff] bg-[rgba(255,255,255,0.40)] px-4 py-2 text-[14px] font-medium text-[#111827]"
        >
          Download summary
        </button>
      </div>
      <div className="grid gap-5 md:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div
            key={label}
            className="h-[110px] w-full rounded-[16px] bg-[rgba(255,255,255,0)] px-6 py-5 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-4px_rgba(0,0,0,0.05)] md:w-[268.25px]"
          >
            <p className="text-[14px] text-[#64748b]">{label}</p>
            <p className="mt-3 font-[var(--font-manrope)] text-[30px] font-semibold leading-[36px] tracking-[-0.225px] text-[#0A1020]">
              {value}
            </p>
          </div>
        ))}
      </div>
      <div className="flex self-stretch rounded-[8px] border border-[rgba(255,255,255,0.20)] bg-[rgba(216,232,255,0.60)] p-1 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-4px_rgba(0,0,0,0.05)]">
        <HeaderTab label="All queue" value={props.allCount} active={props.activeTab === "all"} onClick={() => props.onTabChange("all")} />
        <HeaderTab label="Needs decision" value={props.needsDecisionCount} active={props.activeTab === "needs-decision"} onClick={() => props.onTabChange("needs-decision")} />
        <HeaderTab label="Ready to submit" value={props.readyCount} active={props.activeTab === "ready"} onClick={() => props.onTabChange("ready")} />
      </div>
    </>
  );
}

function HeaderTab({ label, value, active = false, onClick }: { label: string; value: number; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-[10px] rounded-[4px] px-8 py-1 text-[14px] whitespace-nowrap ${
        active ? "bg-white text-[#111827] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-4px_rgba(0,0,0,0.05)]" : "text-[#64748b]"
      }`}
    >
      <span>{label}</span>
      <span
        className={`inline-flex h-[15px] min-w-[15px] items-center justify-center rounded-[4px] px-[2px] font-[var(--font-inter)] text-[12px] font-normal leading-none ${
          active ? "bg-[#93c5fd] text-white" : "bg-[#bcd2fb] text-[#5080C8]"
        }`}
      >
        {value}
      </span>
    </button>
  );
}
