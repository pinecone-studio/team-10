import type { AppRole } from "../_lib/roles";
import { RoleSwitcher } from "./RoleSwitcher";
import { getRoleMeta } from "../_lib/roles";

const navItems = [
  { label: "HOME", icon: "grid", active: true },
  { label: "ORDER", icon: "box" },
  { label: "RECEIVE", icon: "chart" },
  { label: "STORAGE", icon: "users" },
  { label: "DISTRIBUTION", icon: "file" },
  { label: "DISPOSE", icon: "gear" },
] as const;

type RoleSidebarProps = {
  role: AppRole;
};

function Icon({ kind }: { kind: (typeof navItems)[number]["icon"] }) {
  const common = "h-4 w-4 shrink-0 text-slate-300";

  if (kind === "grid") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden="true">
        <path d="M2.5 2.5h4v4h-4zm7 0h4v4h-4zm-7 7h4v4h-4zm7 0h4v4h-4z" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }

  if (kind === "box") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden="true">
        <path d="m8 2 5 2.5v7L8 14 3 11.5v-7L8 2Zm0 0v12" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }

  if (kind === "chart") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden="true">
        <path d="M2.5 13.5h11M4 11V6m4 5V3m4 8V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "users") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden="true">
        <path d="M5.5 8A2.5 2.5 0 1 0 5.5 3a2.5 2.5 0 0 0 0 5Zm5 1.5A2 2 0 1 0 10.5 5a2 2 0 0 0 0 4ZM1.5 13c.4-1.7 1.9-2.5 4-2.5s3.6.8 4 2.5m1-1c.9.1 1.9.5 2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "file") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden="true">
        <path d="M4 2.5h5L12 5v8.5H4zM9 2.5V5h3" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden="true">
      <path d="M8 2.5v2m0 7v2m5.5-5.5h-2m-7 0h-2m8.4-3.9-1.4 1.4m-4.6 4.6-1.4 1.4m0-7.4 1.4 1.4m4.6 4.6 1.4 1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function RoleSidebar({ role }: RoleSidebarProps) {
  const roleMeta = getRoleMeta(role);

  return (
    <aside className="flex h-[calc(100vh-32px)] w-[240px] flex-col rounded-[28px] border border-cyan-500/30 bg-black px-4 py-5 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.18)]">
      <div className="flex items-center gap-3 border-b border-white/10 pb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
          <svg viewBox="0 0 16 16" fill="none" className="h-5 w-5" aria-hidden="true">
            <path d="m8 2 5 2.5v7L8 14 3 11.5v-7L8 2Zm0 0v12" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide">AMS</p>
          <p className="text-[11px] text-white/50">System</p>
        </div>
      </div>

      <nav className="mt-5 space-y-2">
        {navItems.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
              item.active ? "bg-slate-800 text-white" : "text-white/80"
            }`}
          >
            <Icon kind={item.icon} />
            <span className="tracking-wide">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4">
        <div className="rounded-xl bg-slate-900 px-3 py-3">
          <p className="mb-2 text-[11px] font-semibold tracking-[0.22em] text-white/45 uppercase">
            Role
          </p>
          <p className="mb-3 truncate text-sm font-medium text-white">{roleMeta.label}</p>
          <RoleSwitcher initialRole={role} />
        </div>
      </div>
    </aside>
  );
}
