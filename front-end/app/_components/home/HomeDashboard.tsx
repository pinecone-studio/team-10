"use client";

import { useEffect, useMemo, useState } from "react";

type ActivityFilter = "all" | "pending" | "completed";

type MetricCard = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: "stack" | "requests" | "alert" | "depreciation";
};

type ActivityItem = {
  initials: string;
  title: string;
  time: string;
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

const metricCards: MetricCard[] = [
  {
    label: "Total Inventory Value",
    value: "$2.4M",
    delta: "+5.2%",
    trend: "up",
    icon: "stack",
  },
  {
    label: "Active Requests",
    value: "24",
    delta: "+3",
    trend: "up",
    icon: "requests",
  },
  {
    label: "Maintenance Alerts",
    value: "8",
    delta: "-2",
    trend: "down",
    icon: "alert",
  },
  {
    label: "Monthly Depreciation",
    value: "$45.2K",
    delta: "-1.8%",
    trend: "down",
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
  { label: "IT", value: 920 },
  { label: "Finance", value: 710 },
  { label: "HR", value: 470 },
  { label: "Operations", value: 640 },
];

const activityItems: ActivityItem[] = [
  {
    initials: "SG",
    title: "Solongo Gantumur registered a new MacBook Pro M3",
    time: "2 min ago",
    status: "completed",
    icon: "laptop",
  },
  {
    initials: "AN",
    title: "Ariuntsetseg Naran approved request for 4K Monitor Dell",
    time: "15 min ago",
    status: "completed",
    icon: "approval",
  },
  {
    initials: "NA",
    title: "Nyamjav Avid requested maintenance for HP LaserJet Pro",
    time: "1 hour ago",
    status: "pending",
    icon: "maintenance",
  },
  {
    initials: "MM",
    title: "Munkhzul Myagmar received delivery of Office Chairs",
    time: "3 hours ago",
    status: "completed",
    icon: "delivery",
  },
  {
    initials: "OD",
    title: "Oyun Davaa requested approval for Standing Desks (x5)",
    time: "4 hours ago",
    status: "pending",
    icon: "approval",
  },
  {
    initials: "NG",
    title: "Nomin Gerelkhuu completed audit for IT Department",
    time: "5 hours ago",
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

function formatNow(date: Date) {
  return {
    time: new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date),
    fullDate: new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date),
  };
}

export function HomeDashboard() {
  const [now, setNow] = useState(() => new Date());
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const formattedNow = useMemo(() => formatNow(now), [now]);

  const filteredActivity = useMemo(() => {
    if (activityFilter === "all") {
      return activityItems;
    }

    return activityItems.filter((item) => item.status === activityFilter);
  }, [activityFilter]);

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#eef6ff_0%,#f8fbff_24%,#ffffff_100%)]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <header className="flex flex-col gap-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-[30px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#0A0A0A]">
                Good afternoon, Batbayar!
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span>{formattedNow.time}</span>
                <span className="text-slate-400">|</span>
                <span>{formattedNow.fullDate}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex h-10 w-full min-w-0 items-center gap-2 rounded-xl border border-[#e5edf7] bg-white px-4 text-sm text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:min-w-[260px] sm:max-w-[280px]">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search assets..."
                  className="w-full bg-transparent outline-none placeholder:text-slate-400"
                />
              </label>
              <div className="flex items-center gap-3">
                <RoundIconButton>
                  <InboxIcon />
                  <span className="absolute right-[5px] top-[5px] h-2.5 w-2.5 rounded-full bg-[#F87171]" />
                </RoundIconButton>
                <RoundIconButton>
                  <SparkIcon />
                </RoundIconButton>
              </div>
            </div>
          </div>

          <div className="soft-panel flex flex-wrap justify-end gap-3 rounded-2xl p-4">
            <QuickAction tone="blue" label="New Order" icon={<PlusIcon />} />
            <QuickAction tone="orange" label="Scan QR" icon={<QrIcon />} />
            <QuickAction tone="green" label="Register Asset" icon={<BoxArrowIcon />} />
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => (
            <MetricPanel key={card.label} card={card} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <WhitePanel
            title="Asset Lifecycle Status"
            subtitle="Health distribution across all assets"
            trailing={<MiniGridIcon />}
          >
            <div className="flex flex-col items-center gap-8 py-2">
              <LifecycleChart />
              <div className="grid w-full gap-3 sm:grid-cols-2">
                {lifecycleData.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="flex-1 text-slate-500">{item.label}</span>
                    <span className="font-semibold text-slate-950">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </WhitePanel>

          <WhitePanel
            title="Recent Activity"
            subtitle="Live updates from your team"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-3 rounded-2xl bg-[#f6f9fd] p-1">
                {(["all", "pending", "completed"] as const).map((filter) => {
                  const active = activityFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActivityFilter(filter)}
                      className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                        active
                          ? "border border-[#BFDBFE] bg-white text-slate-950 shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                          : "text-slate-500"
                      }`}
                    >
                      {filter[0]!.toUpperCase() + filter.slice(1)}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1">
                {filteredActivity.map((item) => (
                  <ActivityRow key={`${item.initials}-${item.title}`} item={item} />
                ))}
              </div>
            </div>
          </WhitePanel>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <WhitePanel
            title="Asset Value by Department"
            subtitle="Click a bar to filter"
            trailing={<MiniGridIcon />}
          >
            <div className="space-y-6 pt-1">
              <DepartmentBars />
              <div className="flex flex-wrap gap-2 pt-1">
                {departmentData.map((item) => (
                  <span
                    key={item.label}
                    className="rounded-full bg-[#f6f9fd] px-3 py-1.5 text-xs font-medium text-slate-950"
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </WhitePanel>

          <section className="relative overflow-hidden rounded-2xl border border-[#f4d7c4] bg-[linear-gradient(180deg,#fff7ef_0%,#fff9f4_100%)] p-6 shadow-[0_12px_24px_rgba(251,146,60,0.08)]">
            <div className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#FE9A00_0%,#FF6900_100%)] text-white shadow-[0_10px_15px_-3px_rgba(254,154,0,0.25)]">
                    <AlertBoltIcon />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#0A0A0A]">
                      Critical Alerts
                    </h2>
                    <p className="text-sm text-slate-500">
                      Items requiring immediate attention
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-orange-300 bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-500">
                  3 Items
                </span>
              </div>

              <div className="space-y-3">
                {alertItems.map((item) => (
                  <AlertRow key={item.title} item={item} />
                ))}
              </div>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-white/50"
              >
                View All Alerts
                <ArrowRightIcon />
              </button>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}

function WhitePanel({
  title,
  subtitle,
  trailing,
  children,
}: {
  title: string;
  subtitle: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="soft-panel rounded-2xl p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#0A0A0A]">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {trailing ? (
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5edf7] bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
          >
            {trailing}
          </button>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MetricPanel({ card }: { card: MetricCard }) {
  return (
    <section className="soft-panel rounded-2xl p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2.5">
          <p className="text-xs text-slate-400 sm:text-sm">{card.label}</p>
          <div className="text-[28px] font-semibold leading-none tracking-[-0.02em] text-[#0A0A0A]">
            {card.value}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs">
            <span className={card.trend === "up" ? "text-[#4ADE80]" : "text-[#F87171]"}>
              {card.trend === "up" ? <TrendUpIcon /> : <TrendDownIcon />}
            </span>
            <span
              className={`font-semibold ${
                card.trend === "up" ? "text-[#4ADE80]" : "text-[#F87171]"
              }`}
            >
              {card.delta}
            </span>
            <span className="text-slate-400">vs last month</span>
          </div>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#CBD5E1] text-white">
          <MetricIcon kind={card.icon} />
        </div>
      </div>
    </section>
  );
}

function QuickAction({
  tone,
  label,
  icon,
}: {
  tone: "blue" | "orange" | "green";
  label: string;
  icon: React.ReactNode;
}) {
  const toneClass =
    tone === "blue"
      ? "border-blue-200"
      : tone === "orange"
        ? "border-orange-200"
        : "border-green-200";

  return (
    <button
      type="button"
      className={`flex h-9 items-center gap-2 rounded-[10px] border bg-white px-3 text-xs font-medium text-slate-950 shadow-[0_8px_16px_rgba(15,23,42,0.06)] transition hover:bg-slate-50 ${toneClass}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl p-3 transition hover:bg-[#f8fbff]">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-400">
        {item.initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-950">{item.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">{item.time}</span>
          <span
            className={`rounded px-1.5 py-0.5 font-medium ${
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
        <ActivityIcon kind={item.icon} />
      </div>
    </div>
  );
}

function AlertRow({ item }: { item: AlertItem }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/70 p-4 shadow-[0_6px_18px_rgba(251,146,60,0.05)] md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-medium text-slate-950">{item.title}</h3>
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
              item.severity === "Urgent"
                ? "border-red-300 bg-red-200 text-red-600"
                : "border-orange-300 bg-orange-100 text-orange-500"
            }`}
          >
            {item.severity}
          </span>
        </div>
        <p className="text-sm text-slate-500">{item.description}</p>
        <p className="text-xs text-slate-500">Department: {item.department}</p>
      </div>

      <button
        type="button"
        className={`inline-flex h-8 items-center gap-2 rounded-[10px] px-3 text-sm font-medium ${
          item.action === "Dispose" ? "text-red-600" : "text-orange-500"
        }`}
      >
        {item.action === "Dispose" ? <TrashIcon /> : <MiniGridIcon />}
        {item.action}
      </button>
    </div>
  );
}

function LifecycleChart() {
  const cumulativeAngles = lifecycleData.reduce<number[]>((acc, item, index) => {
    const previous = index === 0 ? 0 : acc[index - 1]!;
    acc.push(previous + (item.value / 100) * 360);
    return acc;
  }, []);

  const gradient = lifecycleData
    .map((item, index) => {
      const start = index === 0 ? 0 : cumulativeAngles[index - 1]!;
      const end = cumulativeAngles[index]!;
      return `${item.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div className="relative flex h-[220px] w-full items-center justify-center sm:h-[250px]">
      <div
        className="h-[150px] w-[150px] rounded-full sm:h-[170px] sm:w-[170px]"
        style={{ background: `conic-gradient(${gradient})` }}
      />
      <div className="absolute h-[72px] w-[72px] rounded-full bg-white sm:h-[82px] sm:w-[82px]" />
    </div>
  );
}

function DepartmentBars() {
  return (
    <div className="space-y-5">
      <div className="ml-auto hidden max-w-[84%] justify-between text-[11px] text-slate-500 sm:flex">
        <span>$0K</span>
        <span>$250K</span>
        <span>$500K</span>
        <span>$750K</span>
        <span>$1000K</span>
      </div>
      <div className="space-y-4">
        {departmentData.map((item, index) => (
          <div
            key={item.label}
            className="grid grid-cols-1 gap-2 sm:grid-cols-[70px_minmax(0,1fr)] sm:items-center sm:gap-4"
          >
            <span className="text-sm text-slate-500 sm:text-right">{item.label}</span>
            <div className="h-7 rounded-full bg-[#f3f7fb] p-1 sm:h-8">
              <div
                className={`h-full rounded-full ${
                  index === 0
                    ? "bg-[linear-gradient(135deg,#5FEFFF_11.06%,#5194FF_69.2%)]"
                    : index === 1
                      ? "bg-[linear-gradient(135deg,#5FEFFF_16.99%,#5194FF_74.68%)]"
                      : index === 2
                        ? "bg-[linear-gradient(132.92deg,#5FEFFF_12.65%,#5194FF_89.23%)]"
                        : "bg-[linear-gradient(135deg,#5FEFFF_0%,#5194FF_100%)]"
                }`}
                style={{ width: `${Math.max((item.value / 1000) * 100, 18)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoundIconButton({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#e5edf7] bg-white text-slate-950 shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
    >
      {children}
    </button>
  );
}

function MetricIcon({ kind }: { kind: MetricCard["icon"] }) {
  if (kind === "stack") {
    return <StackIcon />;
  }
  if (kind === "requests") {
    return <RequestsIcon />;
  }
  if (kind === "alert") {
    return <WarningIcon />;
  }

  return <TrendDownIcon />;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M3 3h3v3H3zM10 3h3v3h-3zM3 10h3v3H3z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10 10h1.5M11.5 10v1.5M10 13h3v-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function BoxArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M3 5.5 8 3l5 2.5v5L8 13l-5-2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8 13V8M3 5.5l5 2.5 5-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M3 4.5h10v7H10.5L9 13H7L5.5 11.5H3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M8 2v2.2M8 11.8V14M2 8h2.2M11.8 8H14M4.2 4.2l1.6 1.6M10.2 10.2l1.6 1.6M11.8 4.2l-1.6 1.6M5.8 10.2l-1.6 1.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="8" r="2.1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function MiniGridIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function TrendUpIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M3 10.5 6.5 7l2.3 2.3L13 5.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.7 5H13v2.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendDownIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M3 5.5 6.5 9l2.3-2.3L13 10.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.7 11H13V8.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StackIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M10 3.5 4.5 6.2 10 9l5.5-2.8L10 3.5ZM4.5 9.3 10 12l5.5-2.7M4.5 12.4 10 15l5.5-2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RequestsIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
      <rect x="4" y="3.5" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M10 4.5 16 15.5H4L10 4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M10 8v3.5M10 13.6h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ActivityIcon({ kind }: { kind: ActivityItem["icon"] }) {
  if (kind === "laptop") {
    return (
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
        <path d="M3.5 4h9v5h-9zM2.5 11.5h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "maintenance") {
    return (
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
        <path d="M6 3.5a2.5 2.5 0 1 0 3.7 3.1l2.8 2.8-1.2 1.2-2.8-2.8A2.5 2.5 0 0 0 5.4 4.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "delivery") {
    return (
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
        <path d="M3 5.5 8 3l5 2.5v5L8 13l-5-2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "audit") {
    return (
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
        <path d="M4 3.5h6l2 2v7H4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M6 8h4M6 10.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M3 8h10M8 3v10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function AlertBoltIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M10 2.5 4.5 6v8L10 17.5 15.5 14V6L10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 6.5v4M10 13.2h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M3.5 4.5h9M6 4.5V3.2h4v1.3M5 6.5v5M8 6.5v5M11 6.5v5M4.5 4.5l.6 8h5.8l.6-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M3.5 8h9M9.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
