"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AppRole } from "../_lib/roles";
import { roleOptions } from "../_lib/roles";

type RoleSwitcherProps = {
  initialRole?: AppRole;
  variant?: "light" | "dark" | "card";
  displayName?: string;
};

export function RoleSwitcher({
  initialRole,
  variant = "light",
  displayName = "Batbayar Dorj",
}: RoleSwitcherProps) {
  const router = useRouter();
  const selectedRole = initialRole ?? "";
  const currentRole = roleOptions.find((role) => role.value === initialRole);
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleChange = (value: string) => {
    if (!value) return;

    const role = value as AppRole;
    setOpen(false);
    router.push(`/${role}`);
  };

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!cardRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const selectClassName =
    variant === "dark"
      ? "w-full appearance-none rounded-[14px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,32,51,0.95)_0%,rgba(12,20,34,0.95)_100%)] px-3.5 py-3 pr-10 text-sm font-medium text-white outline-none transition focus:border-[#5e87c7] focus:shadow-[0_0_0_3px_rgba(96,165,250,0.16)]"
      : "w-full appearance-none rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 pr-12 text-base text-slate-900 outline-none transition-all duration-200 ease-out focus:border-cyan-500 focus:bg-white focus:shadow-[0_10px_30px_rgba(34,211,238,0.14)]";

  const arrowClassName =
    variant === "dark"
      ? "pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#7f93b4]"
      : "pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-400";

  if (variant === "card") {
    return (
      <div ref={cardRef} className="relative min-w-0 overflow-visible">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex w-full min-w-0 items-center gap-3 rounded-[20px] bg-[#171d29] px-4 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition hover:bg-[#1b2331]"
        >
          <div className="relative flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_35%_30%,#19d3c5_0%,#142433_38%,#0d1019_68%,#090b12_100%)]">
            <div className="absolute top-[9px] h-[21px] w-[25px] rounded-full bg-[linear-gradient(135deg,#8b3dff_0%,#ff5f3d_55%,#ffbb38_100%)]" />
            <div className="absolute top-[19px] h-[22px] w-[20px] rounded-[45%] bg-[#ffb19d]" />
            <div className="absolute top-[39px] h-[24px] w-[30px] rounded-t-[16px] bg-[linear-gradient(180deg,#5763d5_0%,#2f3571_100%)]" />
            <div className="absolute top-[38px] left-[20px] h-[24px] w-[4px] rotate-[16deg] bg-white/80" />
            <div className="absolute top-[38px] right-[20px] h-[24px] w-[4px] -rotate-[16deg] bg-white/80" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[18px] font-medium leading-tight tracking-[-0.03em] text-[#eef4ff]">
              {displayName}
            </p>
            <p className="mt-0.5 truncate text-[16px] leading-tight text-[#5d8de6]">
              {currentRole?.label ?? "Admin"}
            </p>
          </div>
          <span className={`shrink-0 text-[#7f93b4] transition ${open ? "rotate-180" : ""}`}>
            v
          </span>
        </button>

        {open ? (
          <div className="absolute inset-x-0 bottom-full z-20 mb-2 overflow-hidden rounded-[18px] border border-white/10 bg-[#171d29] p-2 shadow-[0_20px_50px_rgba(2,6,23,0.5)]">
            {roleOptions.map((role) => {
              const isCurrent = role.value === selectedRole;

              return (
                <Link
                  key={role.value}
                  href={`/${role.value}`}
                  onClick={() => setOpen(false)}
                  className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left transition ${
                    isCurrent
                      ? "bg-[#23324a] text-white"
                      : "text-[#c9d7ee] hover:bg-[#1f2a3d] hover:text-white"
                  }`}
                >
                  <span className="text-sm font-medium">{role.label}</span>
                  {isCurrent ? (
                    <span className="text-xs text-[#5d8de6]">Current</span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <select
          id="role-switcher"
          className={selectClassName}
          value={selectedRole}
          onChange={(event) => handleChange(event.target.value)}
        >
          <option value="">Role songono uu</option>
          {roleOptions.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        <span className={arrowClassName}>
          v
        </span>
      </div>
    </div>
  );
}
