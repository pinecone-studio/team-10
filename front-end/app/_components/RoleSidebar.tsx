"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { AppRole } from "../_lib/roles";
import { getRoleMeta } from "../_lib/roles";
import { RoleSwitcher } from "./RoleSwitcher";

type NavIcon =
  | "home"
  | "order"
  | "receive"
  | "storage"
  | "distribution"
  | "dispose"
  | "broken";

const navItems = [
  { label: "HOME", icon: "home", href: "/" },
  { label: "ORDER", icon: "order" },
  { label: "RECEIVE", icon: "receive" },
  { label: "STORAGE", icon: "storage" },
  { label: "BROKEN OR MISSING ASSET", icon: "broken" },
  { label: "DISTRIBUTION", icon: "distribution" },
  { label: "DISPOSE", icon: "dispose" },
] as const;

const roleNavItems: Record<AppRole, readonly string[]> = {
  employee: ["DISTRIBUTION", "DISPOSE"],
  inventoryHead: ["ORDER", "RECEIVE", "STORAGE"],
  finance: ["RECEIVE"],
  itAdmin: ["STORAGE", "BROKEN OR MISSING ASSET", "DISPOSE"],
  hrManager: ["DISTRIBUTION", "DISPOSE"],
  systemAdmin: navItems.filter((item) => item.label !== "HOME").map((item) => item.label),
};

type RoleSidebarProps = {
  role?: AppRole;
};

function Icon({ kind, active }: { kind: NavIcon; active: boolean }) {
  const common = active ? "h-[14px] w-[14px] shrink-0 text-white" : "h-[14px] w-[14px] shrink-0 text-[#b0b0b0]";

  if (kind === "home") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden="true">
        <path d="M2.75 6.5 8 2.5l5.25 4v6.75H9.75v-3.5h-3.5v3.5H2.75z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "order") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden="true">
        <path d="m8 2 5 2.5v7L8 14 3 11.5v-7L8 2Zm0 0v12" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }

  if (kind === "receive") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden="true">
        <path d="M8 2.75v7.5m0 0 2.5-2.5M8 10.25l-2.5-2.5M3 13.25h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "storage") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden="true">
        <path d="M2.75 4.25h10.5v3.25H2.75zm0 4.25h10.5v3.25H2.75zm2 1.625h.01m0-4.25h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "distribution") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden="true">
        <path d="M3 4.25h4.25v4.25H3zm5.75 0H13v4.25H8.75zM5.125 8.5v3.25m5.75-3.25v3.25M5.125 11.75h5.75" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "broken") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden="true">
        <path d="M4 3.5h8v4.25H9.25L8 9l-1.25-1.25H4zm1 7.25h6M6.5 8.5l-1 2.25m5-2.25 1 2.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden="true">
      <path d="M4 4h8m-7 3h6m-5 3h4m-4 3h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function RoleSidebar({ role }: RoleSidebarProps) {
  const pathname = usePathname();
  const roleMeta = role ? getRoleMeta(role) : null;
  const visibleItems = navItems.filter((item) => item.label === "HOME" || (role ? roleNavItems[role].includes(item.label) : false));

  return (
    <aside className="flex min-h-screen w-[244px] shrink-0 flex-col bg-[#010101] px-[20px] pt-[58px] pb-[36px] text-white">
      <div className="flex items-start gap-[10px] border-b border-white/10 pb-[34px]">
        <div className="mt-[2px] flex h-[29px] w-[29px] items-center justify-center rounded-[8px] bg-white text-black">
          <Image
            src="/file.svg"
            alt=""
            width={16}
            height={16}
            className="h-[16px] w-[16px] shrink-0 brightness-0"
          />
        </div>
        <div>
          <h1 className="text-[14px] font-semibold leading-none tracking-tight text-[#f5f5f5]">
            AMS
          </h1>
          <p className="mt-[6px] max-w-[108px] text-[10px] leading-[1.18] text-[#6d6d6d]">
            Asset Management System
          </p>
        </div>
      </div>

      <nav className="mt-[16px] flex flex-1 flex-col gap-[6px]">
        {visibleItems.map((item) => (
          item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className={`flex h-[32px] items-center gap-[10px] overflow-hidden rounded-[7px] px-[10px] text-left text-[11px] font-medium tracking-[0.01em] transition ${
                pathname === item.href
                  ? "bg-[#1c2436] text-white"
                  : "text-[#b0b0b0] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon kind={item.icon} active={pathname === item.href} />
              <span className="truncate">{item.label}</span>
            </Link>
          ) : (
            <button
              key={item.label}
              type="button"
              className="flex h-[32px] items-center gap-[10px] overflow-hidden rounded-[7px] px-[10px] text-left text-[11px] font-medium tracking-[0.01em] text-[#b0b0b0] transition hover:bg-white/5 hover:text-white"
            >
              <Icon kind={item.icon} active={false} />
              <span className="truncate">{item.label}</span>
            </button>
          )
        ))}
      </nav>

      <div className="border-t border-white/10 pt-[20px]">
        <div className="rounded-[10px] bg-[#0a0a0a] px-[12px] py-[12px]">
          <p className="text-[10px] font-medium tracking-[0.18em] text-[#6d6d6d] uppercase">
            Role
          </p>
          <p className="mt-[6px] truncate text-[12px] font-medium text-white">
            {roleMeta?.label ?? "Select role"}
          </p>
          <div className="mt-[10px]">
            <RoleSwitcher initialRole={role} variant="dark" />
          </div>
        </div>
      </div>
    </aside>
  );
}
