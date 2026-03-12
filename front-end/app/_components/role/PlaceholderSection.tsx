"use client";

import { EmptyState, WorkspaceShell } from "../shared/WorkspacePrimitives";

export function PlaceholderSection({
  title,
  subtitle,
  description,
}: {
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <WorkspaceShell title={title} subtitle={subtitle}>
      <EmptyState title={title} description={description} />
    </WorkspaceShell>
  );
}
