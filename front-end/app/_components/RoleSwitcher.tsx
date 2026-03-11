"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AppRole } from "../_lib/roles";
import { roleOptions } from "../_lib/roles";

type RoleSwitcherProps = {
  initialRole?: AppRole;
};

export function RoleSwitcher({ initialRole }: RoleSwitcherProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<AppRole | "">(
    initialRole ?? "",
  );

  const handleChange = (value: string) => {
    if (!value) {
      setSelectedRole("");
      return;
    }

    const role = value as AppRole;
    setSelectedRole(role);
    router.push(`/${role}`);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <select
          id="role-switcher"
          className="w-full appearance-none rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 pr-12 text-base text-slate-900 outline-none transition-all duration-200 ease-out focus:border-cyan-500 focus:bg-white focus:shadow-[0_10px_30px_rgba(34,211,238,0.14)]"
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
        <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-400">
          v
        </span>
      </div>
    </div>
  );
}
