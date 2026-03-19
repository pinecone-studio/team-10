"use client";

import { Card, WorkspaceShell } from "../shared/WorkspacePrimitives";

export function HigherUpApprovalSection() {
  return (
    <WorkspaceShell title="Higher-up approvals" subtitle="This approval step has been removed from the order workflow.">
      <Card title="Workflow updated">
        <p className="text-sm text-[#475569]">
          New orders now go directly to Finance review. There are no higher-up pending orders anymore.
        </p>
      </Card>
    </WorkspaceShell>
  );
}
