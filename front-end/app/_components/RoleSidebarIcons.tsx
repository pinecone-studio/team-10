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
      <svg viewBox="0 0 21 21" fill="none" className={common} aria-hidden="true">
        <path
          d="M9.625 19.0139C9.89103 19.1675 10.1928 19.2484 10.5 19.2484C10.8072 19.2484 11.109 19.1675 11.375 19.0139L17.5 15.5139C17.7658 15.3605 17.9865 15.1398 18.1401 14.8741C18.2937 14.6084 18.3747 14.307 18.375 14.0002V7.00016C18.3747 6.69327 18.2937 6.39187 18.1401 6.12618C17.9865 5.86048 17.7658 5.63985 17.5 5.48641L11.375 1.98641C11.109 1.83281 10.8072 1.75195 10.5 1.75195C10.1928 1.75195 9.89103 1.83281 9.625 1.98641L3.5 5.48641C3.23423 5.63985 3.01348 5.86048 2.8599 6.12618C2.70632 6.39187 2.62531 6.69327 2.625 7.00016V14.0002C2.62531 14.307 2.70632 14.6084 2.8599 14.8741C3.01348 15.1398 3.23423 15.3605 3.5 15.5139L9.625 19.0139Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.5 19.25V10.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.87878 6.125L10.5 10.5L18.1213 6.125"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.5625 3.73633L14.4375 8.24258"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
