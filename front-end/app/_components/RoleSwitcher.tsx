"use client";

import { useRouter } from "next/navigation";
import type { AppRole } from "../_lib/roles";
import { roleOptions } from "../_lib/roles";

type RoleSwitcherProps = {
  initialRole?: AppRole;
  variant?: "light" | "dark";
};

export function RoleSwitcher({
  initialRole,
  variant = "light",
}: RoleSwitcherProps) {
  const router = useRouter();
  const selectedRole = initialRole ?? "";

  const handleChange = (value: string) => {
    if (!value) return;

    const role = value as AppRole;
    router.push(`/${role}`);
  };

  const selectClassName =
    variant === "dark"
      ? "w-full appearance-none rounded-[10px] border border-white/10 bg-[#111111] px-3 py-2.5 pr-10 text-sm text-white outline-none transition focus:border-white/20"
      : "w-full appearance-none rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 pr-12 text-base text-slate-900 outline-none transition-all duration-200 ease-out focus:border-cyan-500 focus:bg-white focus:shadow-[0_10px_30px_rgba(34,211,238,0.14)]";

  const arrowClassName =
    variant === "dark"
      ? "pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-white/45"
      : "pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-400";

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
