"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { setNotificationsViewerUserId } from "../_lib/notification-store";
import { getRoleUserId } from "../_lib/role-users";
import type { AppRole } from "../_lib/roles";

export function RoleSessionProvider({
  role,
  children,
}: {
  role: AppRole;
  children: ReactNode;
}) {
  useEffect(() => {
    setNotificationsViewerUserId(getRoleUserId(role));
  }, [role]);

  return children;
}
