"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { AppRole } from "../_lib/roles";
import {
  getSectionHref,
  navItems,
  roleNavSections,
  type SectionKey,
} from "../_lib/navigation";
import { RoleSidebarIcon } from "./RoleSidebarIcons";
import { RoleSwitcher } from "./RoleSwitcher";

type RoleSidebarProps = {
  role?: AppRole;
  currentSection?: SectionKey;
};

export function RoleSidebar({
  role,
  currentSection = "order",
}: RoleSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const visibleItems = navItems.filter(
    (item) =>
      item.section === "home" ||
      (role ? roleNavSections[role].includes(item.section) : false),
  );

  return (
    <aside className="flex h-full w-full max-w-[275px] shrink-0 self-stretch overflow-hidden border-r border-white/10 bg-[#050810] px-3 py-[40px] text-white backdrop-blur-[12px]">
      <div className="flex h-full w-full min-w-0 flex-col px-0">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-[60px]">
          <div className="flex min-w-0 items-center gap-3 px-3">
            <div className="min-w-0">
              <h1 className="bg-[linear-gradient(114.9deg,#7AAAE8_0%,#5080C8_100%)] bg-clip-text text-[26px] font-extrabold leading-[26px] tracking-[-0.52px] text-transparent [font-family:var(--font-manrope)]">
                AMS
              </h1>
            </div>
            <div className="h-[38px] w-[2px] rounded-[2px] bg-[linear-gradient(180deg,rgba(80,128,200,0)_0%,#5080C8_40%,rgba(80,128,200,0)_100%)] opacity-50" />
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[1.4px] text-[#D8E8FF] [font-family:var(--font-manrope)]">
                Asset Management
              </p>
              <p className="mt-[3px] truncate text-[7px] font-light uppercase tracking-[2.66px] text-[#2A4A80]">
                System · Enterprise
              </p>
            </div>
          </div>

          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-3">
            <nav className="flex min-w-0 flex-col gap-1.5">
              {visibleItems.map((item) => {
                const href = getSectionHref(role, item.section);
                const itemLabel =
                  role === "employee" && item.section === "distribution"
                    ? "ASSETS"
                    : item.label;
                const isActive =
                  item.section === "home"
                    ? pathname === "/" &&
                      (role ? searchParams.get("role") === role : !searchParams.get("role"))
                    : pathname === `/${role}` && currentSection === item.section;

                return (
                  <Link
                    key={item.label}
                    href={href}
                    className={`group relative flex min-h-[42px] min-w-0 items-center gap-3 overflow-hidden rounded-[8px] px-3 py-2 text-left transition ${
                      isActive
                        ? "bg-[linear-gradient(90deg,#223450_0%,#081327_100%)]"
                        : "text-[#64748B] hover:bg-[#0c1320] hover:text-[#94A3B8]"
                    }`}
                  >
                    {isActive ? (
                      <span className="pointer-events-none absolute inset-0 rounded-[8px] bg-[radial-gradient(circle_at_left_center,rgba(95,239,255,0.12),transparent_48%),linear-gradient(90deg,#223450_0%,#081327_100%)]" />
                    ) : null}
                    <div
                      className={`relative z-10 flex h-[21px] w-[21px] shrink-0 items-center justify-center transition ${
                        isActive
                          ? "text-[#7CCBFF]"
                          : "text-[#64748B] group-hover:text-[#94A3B8]"
                      }`}
                    >
                      <RoleSidebarIcon kind={item.icon} active={isActive} />
                    </div>
                    <span
                      className={`relative z-10 block truncate text-[14px] font-medium leading-[17px] ${
                        isActive
                          ? "bg-[linear-gradient(135deg,#5FEFFF_11.06%,#5194FF_69.2%)] bg-clip-text text-transparent"
                          : "text-[#64748B] group-hover:text-[#94A3B8]"
                      }`}
                    >
                      {itemLabel}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="mt-5 min-w-0 border-t border-[#2E333D] px-3 pt-[17px]">
          <RoleSwitcher
            initialRole={role}
            variant="card"
            displayName="Batbayar Dorj"
          />
        </div>
      </div>
    </aside>
  );
}
