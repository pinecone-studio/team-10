"use client";

import { useState } from "react";
import { ActionButton, WorkspaceShell } from "../shared/WorkspacePrimitives";
import DistributionHeader from "../distribution/DistributionHeader";
import DistributionDashboard from "../distribution/DistributionDashboard";
import DistributionSearchFilter from "../distribution/DistributionSearchFilter";
import DistributionOrder from "../distribution/DistributionOrder";
import AvailableOrder from "../distribution/AvailableOrder";
import EmployeeOrder from "../distribution/EmployeeOrder";
import PendingRetrievalPanel from "../distribution/PendingRetrievalPanel";

export function HRDistributionSection() {
  const [activeTab, setActiveTab] = useState<
    "distributions" | "available-assets" | "employee-requests" | "pending-retrieval"
  >("distributions");

  return (
    <WorkspaceShell
      title="Distribution"
      subtitle="Assign stored goods to employees and other internal recipients."
      actions={<ActionButton variant="light">Generate QR batch</ActionButton>}
      hideHeader
      backgroundClassName="bg-[#F8FAFC]"
      outerClassName="px-0 py-0"
      contentWidthClassName="max-w-none"
      contentAlignment="left"
    >
      <DistributionHeader />
      <DistributionDashboard />
      <DistributionSearchFilter
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      {activeTab === "distributions" ? <DistributionOrder /> : null}
      {activeTab === "available-assets" ? <AvailableOrder /> : null}
      {activeTab === "employee-requests" ? <EmployeeOrder /> : null}
      {activeTab === "pending-retrieval" ? <PendingRetrievalPanel /> : null}
    </WorkspaceShell>
  );
}
