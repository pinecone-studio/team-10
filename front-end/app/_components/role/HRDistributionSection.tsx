"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAssetDistributionsRequest, type DistributionRecordDto } from "@/app/(dashboard)/_graphql/distribution/distribution-api";
import DistributionHeader from "../distribution/DistributionHeader";
import { WorkspaceShell } from "../shared/WorkspacePrimitives";

export function HRDistributionSection() {
  const [records, setRecords] = useState<DistributionRecordDto[]>([]);

  useEffect(() => {
    let live = true;
    void fetchAssetDistributionsRequest(true).then((distributions) => {
      if (!live) return;
      setRecords(distributions);
    });
    return () => {
      live = false;
    };
  }, []);

  const metricStats = useMemo(() => {
    const norm = (value?: string | null) => (value ?? "").toLowerCase();
    return {
      pending: records.filter((record) => norm(record.status).includes("pending") || norm(record.assetStatus).includes("pending")).length,
      inTransit: records.filter((record) => norm(record.status).includes("transit") || norm(record.assetStatus).includes("transit") || norm(record.status) === "active").length,
      delivered: records.filter((record) => norm(record.status).includes("deliver") || norm(record.assetStatus).includes("deliver") || Boolean(record.returnedAt)).length,
      signed: records.filter((record) => norm(record.status).includes("sign") || norm(record.assetStatus).includes("sign")).length,
    };
  }, [records]);

  return (
    <WorkspaceShell hideHeader title="Distribution" subtitle="" contentAlignment="left" contentWidthClassName="max-w-none" outerClassName="pl-[44px] pr-[60px] pt-[60px] pb-[24px]" backgroundClassName="bg-[radial-gradient(circle_at_top_left,#d8ebff_0%,#eef6ff_34%,#ffffff_74%)]">
      <DistributionHeader pendingCount={metricStats.pending} inTransitCount={metricStats.inTransit} deliveredCount={metricStats.delivered} signedCount={metricStats.signed} />
    </WorkspaceShell>
  );
}
