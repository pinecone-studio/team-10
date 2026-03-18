"use client";

import { useEffect, useMemo, useState } from "react";

type StatCard = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  context: string;
  icon: "wallet" | "requests" | "alert" | "depreciation";
};

type ActivityItem = {
  initials: string;
  message: string;
  timeAgo: string;
  status: "completed" | "pending";
  icon: "laptop" | "approval" | "maintenance" | "delivery" | "audit";
};

type AlertItem = {
  title: string;
  severity: "Urgent" | "Medium";
  description: string;
  department: string;
  action: string;
};

const statCards: StatCard[] = [
  {
    label: "Total Inventory Value",
    value: "$2.4M",
    delta: "+5.2%",
    trend: "up",
    context: "vs last month",
    icon: "wallet",
  },
  {
    label: "Active Requests",
    value: "24",
    delta: "+3",
    trend: "up",
    context: "vs last month",
    icon: "requests",
  },
  {
    label: "Maintenance Alerts",
    value: "8",
    delta: "-2",
    trend: "down",
    context: "vs last month",
    icon: "alert",
  },
  {
    label: "Monthly Depreciation",
    value: "$45.2K",
    delta: "-1.8%",
    trend: "down",
    context: "vs last month",
    icon: "depreciation",
  },
];

const lifecycleData = [
  { label: "New", value: 35, color: "#4ADE80" },
  { label: "Good", value: 42, color: "#60A5FA" },
  { label: "Maintenance Needed", value: 15, color: "#FB923C" },
  { label: "Near Disposal", value: 8, color: "#F87171" },
];

const departmentData = [
  { label: "IT", value: 980, width: "100%" },
  { label: "Finance", value: 720, width: "73.5%" },
  { label: "HR", value: 420, width: "42.9%" },
  { label: "Operations", value: 610, width: "62.2%" },
];

const activityItems: ActivityItem[] = [
  {
    initials: "ST",
    message: "Solongo Gantumur registered a new MacBook Pro M3",
    timeAgo: "2 min ago",
    status: "completed",
    icon: "laptop",
  },
  {
    initials: "AN",
    message: "Ariuntsetseg Naran approved request for 4K Monitor Dell",
    timeAgo: "15 min ago",
    status: "completed",
    icon: "approval",
  },
  {
    initials: "NA",
    message: "Nyamjav Avid requested maintenance for HP LaserJet Pro",
    timeAgo: "1 hour ago",
    status: "pending",
    icon: "maintenance",
  },
  {
    initials: "MM",
    message: "Munkhzul Myagmar received delivery of Office Chairs",
    timeAgo: "3 hours ago",
    status: "completed",
    icon: "delivery",
  },
  {
    initials: "OD",
    message: "Oyun Davaa requested approval for Standing Desks (x5)",
    timeAgo: "4 hours ago",
    status: "pending",
    icon: "approval",
  },
  {
    initials: "NG",
    message: "Nomin Gerelkhuu completed audit for IT Department",
    timeAgo: "5 hours ago",
    status: "completed",
    icon: "audit",
  },
];

const alertItems: AlertItem[] = [
  {
    title: "Dell OptiPlex 7060",
    severity: "Urgent",
    description: "End of life - 6+ years old",
    department: "Finance",
    action: "Dispose",
  },
  {
    title: "HP OfficeJet Pro 9015",
    severity: "Medium",
    description: "Repair costs exceed value",
    department: "HR",
    action: "Replace",
  },
  {
    title: "Microsoft Surface Pro 5",
    severity: "Urgent",
    description: "Battery degradation critical",
    department: "IT",
    action: "Replace",
  },
];

function formatClockParts(date: Date) {
  return {
    time: new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date),
    date: new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date),
  };
}

function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-[24px] border border-white/35 bg-white/45 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl ${className ?? ""}`}
    >
      {children}
    </section>
  );
}

function IconShell({
  tone = "slate",
  children,
}: {
  tone?: "slate" | "orange";
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
        tone === "orange"
          ? "bg-linear-to-br from-[#fe9a00] to-[#ff6900] text-white shadow-[0_12px_30px_rgba(254,154,0,0.28)]"
          : "bg-slate-300 text-white"
      }`}
    >
      {children}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
      <path d="M16 14v2M14 16h2M18 18h2M20 14v2M16 20h4" />
    </svg>
  );
}

function AssetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3 4 7v5c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V7l-8-4Z" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12 2 1.8 4.2L18 8l-4.2 1.8L12 14l-1.8-4.2L6 8l4.2-1.8Z" />
      <path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9Z" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M4 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1H6a2 2 0 1 0 0 4h13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <path d="M18 12h2v-2h-2a2 2 0 1 0 0 4h2v-2Z" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M9 4h6l1 2h3v14H5V6h3l1-2Z" />
      <path d="M9 11h6M9 15h4" />
    </svg>
  );
}

function ShieldAlertIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M12 3 5 6v6c0 4.5 2.8 7.6 7 9 4.2-1.4 7-4.5 7-9V6l-7-3Z" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  );
}

function TrendingDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="m4 7 6 6 4-4 6 6" />
      <path d="M20 10v5h-5" />
    </svg>
  );
}

function ActionGlyph({ kind }: { kind: StatCard["icon"] }) {
  if (kind === "wallet") return <WalletIcon />;
  if (kind === "requests") return <ClipboardIcon />;
  if (kind === "alert") return <ShieldAlertIcon />;
  return <TrendingDownIcon />;
}

function ActivityGlyph({ kind }: { kind: ActivityItem["icon"] }) {
  const common = "h-4 w-4";
  if (kind === "laptop") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16v10H4zM2 18h20" />
      </svg>
    );
  }
  if (kind === "maintenance") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m14 7 3-3 3 3-3 3M4 20l8-8M5 13l6 6" />
      </svg>
    );
  }
  if (kind === "delivery") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 7h13v9H3zM16 10h3l2 3v3h-5zM7 19a1 1 0 1 0 0 .01M18 19a1 1 0 1 0 0 .01" />
      </svg>
    );
  }
  if (kind === "audit") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TrendArrow({ trend }: { trend: "up" | "down" }) {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      {trend === "up" ? <path d="m3 10 3-3 2 2 5-5" /> : <path d="m3 6 3 3 2-2 5 5" />}
      <path d={trend === "up" ? "M10 4h3v3" : "M10 12h3V9"} />
    </svg>
  );
}

function StatCardView({ card }: { card: StatCard }) {
  const trendClass = card.trend === "up" ? "text-emerald-400" : "text-rose-400";

  return (
    <GlassCard className="relative overflow-hidden p-5">
      <div className="absolute inset-0 rounded-[24px] bg-white/10" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-400">{card.label}</p>
          <p className="text-[2rem] font-semibold leading-none tracking-[-0.03em] text-[#0a0a0a]">
            {card.value}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className={`inline-flex items-center gap-1 font-semibold ${trendClass}`}>
              <TrendArrow trend={card.trend} />
              {card.delta}
            </span>
            <span className="text-slate-400">{card.context}</span>
          </div>
        </div>
        <IconShell>
          <ActionGlyph kind={card.icon} />
        </IconShell>
      </div>
    </GlassCard>
  );
}

function formatValue(value: number) {
  return `$${value}K`;
}

export function HomeDashboard() {
  const [tab, setTab] = useState<"all" | "pending" | "completed">("all");
  const [now, setNow] = useState(() => formatClockParts(new Date()));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(formatClockParts(new Date()));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const visibleActivity = useMemo(() => {
    if (tab === "all") return activityItems;
    return activityItems.filter((item) => item.status === tab);
  }, [tab]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#eef5fb]">
      <div className="min-h-screen bg-[radial-gradient(84.85%_113.14%_at_40%_20%,rgba(64,137,255,0.3)_0%,rgba(64,198,255,0)_50%),radial-gradient(141.42%_70.71%_at_0%_50%,rgba(105,179,243,0.2)_0%,rgba(105,211,243,0)_50%),radial-gradient(113.14%_70.71%_at_80%_50%,rgba(0,122,133,0.2)_0%,rgba(0,122,133,0)_50%),radial-gradient(113.14%_141.42%_at_80%_100%,rgba(0,111,167,0.15)_0%,rgba(0,111,167,0)_50%),linear-gradient(180deg,#f4faff_0%,#edf6fb_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1237px] flex-col gap-6 rounded-[32px]">
          <header className="space-y-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-1">
                <h1 className="text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-[#0a0a0a]">
                  Good afternoon, Batbayar!
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-slate-600">
                  <span className="text-lg">{now.time}</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-sm">{now.date}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex h-10 min-w-[220px] items-center gap-2 rounded-xl border border-white/30 bg-white/40 px-3 text-sm text-slate-500 shadow-sm backdrop-blur-xl">
                  <SearchIcon />
                  <input
                    type="search"
                    placeholder="Search assets..."
                    className="w-full bg-transparent outline-none placeholder:text-slate-500"
                  />
                </label>
                <button
                  type="button"
                  aria-label="Notifications"
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/40 text-[#0a0a0a] backdrop-blur-xl"
                >
                  <BellIcon />
                  <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-rose-400" />
                </button>
                <button
                  type="button"
                  aria-label="Quick settings"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/40 text-[#0a0a0a] backdrop-blur-xl"
                >
                  <SparkIcon />
                </button>
              </div>
            </div>

            <GlassCard className="p-4">
              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-3 rounded-xl border border-blue-200 bg-white/15 px-4 text-sm font-medium text-[#0a0a0a] shadow-sm"
                >
                  <PlusIcon />
                  New Order
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-3 rounded-xl border border-orange-200 bg-white/15 px-4 text-sm font-medium text-[#0a0a0a] shadow-sm"
                >
                  <QrIcon />
                  Scan QR
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-3 rounded-xl border border-green-200 bg-white/15 px-4 text-sm font-medium text-[#0a0a0a] shadow-sm"
                >
                  <AssetIcon />
                  Register Asset
                </button>
              </div>
            </GlassCard>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <StatCardView key={card.label} card={card} />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <GlassCard className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#0a0a0a]">Asset Lifecycle Status</h2>
                  <p className="mt-1 text-sm text-slate-500">Health distribution across all assets</p>
                </div>
                <button
                  type="button"
                  aria-label="Lifecycle options"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/40 text-[#0a0a0a]"
                >
                  <QrIcon />
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center">
                <div
                  className="relative h-[240px] w-[240px] rounded-full"
                  style={{
                    background: `conic-gradient(${lifecycleData[0].color} 0deg 126deg, ${lifecycleData[1].color} 126deg 277.2deg, ${lifecycleData[2].color} 277.2deg 331.2deg, ${lifecycleData[3].color} 331.2deg 360deg)`,
                  }}
                >
                  <div className="absolute inset-[34px] rounded-full bg-[#eef5fb]/90 backdrop-blur-sm" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-sm text-slate-500">Asset health</span>
                    <span className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-[#0a0a0a]">1,284</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-2 sm:grid-cols-2">
                {lifecycleData.map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-xl px-2 py-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="flex-1 text-xs text-slate-500">{item.label}</span>
                    <span className="text-xs font-semibold text-[#0a0a0a]">{item.value}%</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#0a0a0a]">Recent Activity</h2>
                  <p className="mt-1 text-sm text-slate-500">Live updates from your team</p>
                </div>
              </div>

              <div className="mt-5 flex rounded-2xl bg-white/20 p-1">
                {[
                  { key: "all", label: "All" },
                  { key: "pending", label: "Pending" },
                  { key: "completed", label: "Completed" },
                ].map((item) => {
                  const active = tab === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTab(item.key as typeof tab)}
                      className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
                        active ? "border border-blue-200 bg-white/50 text-[#0a0a0a]" : "text-slate-500"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 space-y-1">
                {visibleActivity.map((item) => (
                  <div key={`${item.initials}-${item.message}`} className="flex items-center gap-3 rounded-2xl p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-400">
                      {item.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#0a0a0a]">{item.message}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-slate-500">{item.timeAgo}</span>
                        <span
                          className={`rounded px-2 py-0.5 font-medium ${
                            item.status === "completed"
                              ? "bg-green-200 text-green-700"
                              : "bg-orange-200 text-orange-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-500">
                      <ActivityGlyph kind={item.icon} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <GlassCard className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#0a0a0a]">Asset Value by Department</h2>
                  <p className="mt-1 text-sm text-slate-500">Click a bar to filter</p>
                </div>
                <button
                  type="button"
                  aria-label="Department chart options"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/40 text-[#0a0a0a]"
                >
                  <QrIcon />
                </button>
              </div>

              <div className="mt-8 space-y-6">
                {departmentData.map((item, index) => (
                  <div key={item.label} className="grid grid-cols-[76px_minmax(0,1fr)] items-center gap-4">
                    <div className="text-right text-sm text-slate-500">{item.label}</div>
                    <div className="relative h-12 rounded-full bg-white/20 px-1 py-1">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-[#5fefff] to-[#5194ff] shadow-[0_10px_24px_rgba(81,148,255,0.2)]"
                        style={{ width: item.width, opacity: 1 - index * 0.05 }}
                      />
                      <div className="absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-[#0a0a0a]">
                        {formatValue(item.value)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {departmentData.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="rounded-full bg-white/25 px-4 py-1.5 text-xs font-medium text-[#0a0a0a]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </GlassCard>

            <section className="rounded-[24px] border border-white/30 bg-[linear-gradient(90deg,rgba(254,154,0,0.18)_0%,rgba(255,105,0,0.18)_50%,rgba(251,44,54,0.18)_100%)] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <IconShell tone="orange">
                    <ShieldAlertIcon />
                  </IconShell>
                  <div>
                    <h2 className="text-lg font-semibold text-[#0a0a0a]">Critical Alerts</h2>
                    <p className="mt-1 text-sm text-slate-600">Items requiring immediate attention</p>
                  </div>
                </div>
                <span className="rounded-full border border-orange-300 bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-500">
                  3 Items
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {alertItems.map((item) => {
                  const urgent = item.severity === "Urgent";

                  return (
                    <div
                      key={item.title}
                      className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/20 p-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-medium text-[#0a0a0a]">{item.title}</h3>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                              urgent
                                ? "border-red-300 bg-red-200 text-red-600"
                                : "border-orange-300 bg-orange-100 text-orange-500"
                            }`}
                          >
                            {item.severity}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                        <p className="mt-1 text-xs text-slate-500">Department: {item.department}</p>
                      </div>
                      <button
                        type="button"
                        className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium ${
                          urgent ? "text-red-600" : "text-orange-500"
                        }`}
                      >
                        {item.action}
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl px-2 text-sm font-medium text-slate-500"
              >
                View All Alerts
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </button>
            </section>
          </section>
        </div>
      </div>
    </div>
  );
}
