"use client";

import type { ReactNode } from "react";
import { WorkspaceShell } from "../shared/WorkspacePrimitives";
import { StorageWorkspaceHeader } from "./StorageWorkspaceHeader";

export function StorageWorkspaceFrame(props: {
  title: string;
  subtitle: string;
  backLabel?: string;
  onBack?: () => void;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <WorkspaceShell
      title={props.title}
      subtitle={props.subtitle}
      hideHeader
      contentAlignment="left"
      contentWidthClassName="max-w-none"
      outerClassName="min-h-full px-0 py-0"
      contentPaddingClassName=""
      backgroundClassName="bg-[radial-gradient(ellipse_at_52%_22%,rgba(191,219,254,0.72)_0%,rgba(191,219,254,0.34)_18%,rgba(191,219,254,0.12)_34%,rgba(191,219,254,0)_56%),radial-gradient(ellipse_at_85%_78%,rgba(186,230,253,0.34)_0%,rgba(186,230,253,0.18)_20%,rgba(186,230,253,0.08)_34%,rgba(186,230,253,0)_54%),radial-gradient(ellipse_at_72%_58%,rgba(191,219,254,0.18)_0%,rgba(191,219,254,0.09)_18%,rgba(191,219,254,0.03)_32%,rgba(191,219,254,0)_48%),linear-gradient(180deg,#ffffff_0%,#ffffff_14%,#f8fbff_30%,#f5faff_54%,#eef5fb_100%)]"
    >
      <StorageWorkspaceHeader
        title={props.title}
        subtitle={props.subtitle}
        backLabel={props.backLabel}
        onBack={props.onBack}
        action={props.action}
      />
      <div className="px-[44px] pb-8 pt-0">{props.children}</div>
    </WorkspaceShell>
  );
}
