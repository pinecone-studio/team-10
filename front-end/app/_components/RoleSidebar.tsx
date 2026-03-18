"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  const visibleItems = navItems.filter(
    (item) =>
      item.section === "home" ||
      (role ? roleNavSections[role].includes(item.section) : false),
  );

  return (
    <aside className="flex min-h-screen w-full max-w-[304px] shrink-0 self-stretch overflow-x-hidden overflow-y-visible bg-[linear-gradient(180deg,#08111f_0%,#0d1828_55%,#0f1d31_100%)] px-4 py-3 text-white sm:px-5 sm:py-4">
      <div className="flex min-h-full w-full min-w-0 flex-col px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex items-start gap-3 border-b border-white/10 pb-4">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#f8fbff_0%,#d9e7ff_100%)] shadow-[0_10px_24px_rgba(148,163,184,0.18)]">
            <Image
              src="/box.svg"
              alt=""
              width={18}
              height={18}
              className="h-[17px] w-[17px] shrink-0"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="inline-flex rounded-full border border-[#3c4e69] bg-white/6 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9fb3d9]">
              Workspace
            </div>
            <h1 className="mt-2.5 text-[20px] font-semibold leading-none tracking-[-0.03em] text-[#f8fbff]">
              AMS
            </h1>
            <p className="mt-1 max-w-[150px] text-[11px] leading-[1.35] text-[#8da0bf]">
              Asset Management System
            </p>
          </div>
        </div>

        <div className="mt-4 min-w-0">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5f7497]">
            Navigation
          </p>
          <nav className="mt-2.5 flex flex-1 min-w-0 flex-col gap-1.5">
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
                  className={`group flex min-h-[48px] min-w-0 items-center gap-3 overflow-hidden rounded-[18px] border px-3 py-2.5 text-left transition ${
                    isActive
                      ? "border-transparent bg-[linear-gradient(135deg,rgba(92,136,201,0.3)_0%,rgba(33,55,89,0.92)_100%)] text-white shadow-[0_14px_28px_rgba(15,23,42,0.32)]"
                      : "border-transparent bg-transparent text-[#b7c5dc] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border transition ${
                      isActive
                        ? "border-white/12 bg-white/10 text-white"
                        : "border-white/8 bg-[#101b2d] text-[#9db1d4] group-hover:border-white/10 group-hover:bg-white/7 group-hover:text-white"
                    }`}
                  >
                    <RoleSidebarIcon kind={item.icon} active={isActive} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-semibold tracking-[0.16em]">
                      {item.label}
                    </span>
                    <span
                      className={`mt-0.5 block truncate text-[10px] ${
                        isActive ? "text-[#d8e5ff]" : "text-[#6f84a5] group-hover:text-[#aebfe0]"
                      }`}
                    >
                      {item.section === "home" ? "Overview" : "Open workspace"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto min-w-0 overflow-visible border-t border-white/10 pt-3">
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
