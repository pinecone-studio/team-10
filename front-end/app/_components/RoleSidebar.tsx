"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { AppRole } from "../_lib/roles";
import { getRoleMeta } from "../_lib/roles";
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
  const roleMeta = role ? getRoleMeta(role) : null;
  const visibleItems = navItems.filter(
    (item) =>
      item.section === "home" ||
      (role ? roleNavSections[role].includes(item.section) : false),
  );

  return (
    <aside className="flex min-h-screen w-[275px] shrink-0 flex-col border-r border-white/10 bg-[#020202] px-[12px] pt-[60px] pb-[28px] text-white">
      <div className="mx-[12px] flex items-start gap-[12px] border-b border-white/10 pb-[20px]">
        <div className="mt-[1px] flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-white text-black">
          <Image
            src="/box.svg"
            alt=""
            width={18}
            height={18}
            className="h-[16px] w-[16px] shrink-0"
          />
        </div>
        <div>
          <h1 className="text-[20px] font-semibold leading-none tracking-tight text-[#f5f5f5]">
            AMS
          </h1>
          <p className="mt-[4px] max-w-[106px] text-[12px] leading-[1.2] text-[#7d7d7d]">
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
              className={`flex h-[42px] items-center gap-[12px] overflow-hidden rounded-[8px] px-[12px] text-left text-[14px] font-medium tracking-[0.01em] transition ${
                isActive
                  ? "bg-[#1f2738] text-white"
                  : "text-[#c7c7c7] hover:bg-white/5 hover:text-white"
              }`}
            >
              <RoleSidebarIcon kind={item.icon} active={isActive} />
              <span className="truncate text-[14px]">{item.label}</span>
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
              <p className="truncate text-[13px] font-medium text-white">
                Batbayar Dorj
              </p>
              <p className="text-[11px] text-[#8f8f8f]">
                {roleMeta?.label ?? "Admin"}
              </p>
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
