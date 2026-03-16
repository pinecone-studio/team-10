"use client";

import type { NavIcon } from "../_lib/navigation";

export function RoleSidebarIcon({
  kind,
  active,
}: {
  kind: NavIcon;
  active: boolean;
}) {
  const common = active
    ? "h-[21px] w-[21px] shrink-0 text-white"
    : "h-[21px] w-[21px] shrink-0 text-[#b0b0b0]";

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
