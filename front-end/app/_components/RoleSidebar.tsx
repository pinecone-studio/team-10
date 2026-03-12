"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { AppRole } from "../_lib/roles";
import { getRoleMeta } from "../_lib/roles";
import { getSectionHref, navItems, roleNavSections, type NavIcon, type SectionKey } from "../_lib/navigation";
import { RoleSwitcher } from "./RoleSwitcher";

type RoleSidebarProps = {
  role?: AppRole;
  currentSection?: SectionKey;
};

function Icon({ kind, active }: { kind: NavIcon; active: boolean }) {
  const common = active ? "h-[21px] w-[21px] shrink-0 text-white" : "h-[21px] w-[21px] shrink-0 text-[#b0b0b0]";

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

export function RoleSidebar({ role, currentSection = "order" }: RoleSidebarProps) {
  const pathname = usePathname();
  const roleMeta = role ? getRoleMeta(role) : null;
  const visibleItems = navItems.filter(
    (item) => item.section === "home" || (role ? roleNavSections[role].includes(item.section) : false),
  );

  return (
    <aside className="flex min-h-screen w-[275px] shrink-0 flex-col border-r border-white/10 bg-[#020202] px-[12px] pt-[60px] pb-[28px] text-white">
      <div className="mx-[12px] flex items-start gap-[12px] border-b border-white/10 pb-[20px]">
        <div className="mt-[1px] flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-white text-black">
          <Image
            src="/file.svg"
            alt=""
            width={18}
            height={18}
            className="h-[18px] w-[18px] shrink-0 brightness-0"
          />
        </div>
        <div>
          <h1 className="text-[27px] font-semibold leading-none tracking-tight text-[#f5f5f5]">
            AMS
          </h1>
          <p className="mt-[4px] max-w-[106px] text-[11px] leading-[1.2] text-[#7d7d7d]">
            Asset Management System
          </p>
        </div>
      </div>

      <nav className="mt-[14px] flex flex-1 flex-col gap-[4px]">
        {visibleItems.map((item) => {
          const href = getSectionHref(role, item.section);
          const isActive =
            item.section === "home"
              ? pathname === "/"
              : pathname === `/${role}` && currentSection === item.section;

          return (
            <Link
              key={item.label}
              href={href}
              className={`flex h-[42px] items-center gap-[12px] overflow-hidden rounded-[8px] px-[12px] text-left text-[17px] font-medium tracking-[0.01em] transition ${
                isActive ? "bg-[#1f2738] text-white" : "text-[#c7c7c7] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon kind={item.icon} active={isActive} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 pt-[12px]">
        <div className="rounded-[8px] bg-[#0f131b] px-[14px] py-[12px]">
          <div className="flex items-center gap-[10px]">
            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white text-[11px] font-semibold text-[#363636]">
              BD
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-white">Batbayar Dorj</p>
              <p className="text-[11px] text-[#8f8f8f]">{roleMeta?.label ?? "Admin"}</p>
            </div>
          </div>
          <div className="mt-[10px]">
            <RoleSwitcher initialRole={role} variant="dark" />
          </div>
        </div>
      </div>
    </aside>
  );
}
