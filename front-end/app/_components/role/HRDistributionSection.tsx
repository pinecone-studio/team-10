"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAssetDistributionsRequest, type DistributionRecordDto } from "@/app/(dashboard)/_graphql/distribution/distribution-api";
import { fetchStorageAssetsRequest, type StorageAssetDto } from "@/app/(dashboard)/_graphql/storage/storage-api";
import DistributionAssetGrid from "../distribution/DistributionAssetGrid";
import EmployeeOrder from "../distribution/EmployeeOrder";
import DistributionFilterPanel, { type DistributionTab } from "../distribution/DistributionFilterPanel";
import DistributionHeader from "../distribution/DistributionHeader";
import DistributionOrder from "../distribution/DistributionOrder";
import PendingRetrievalPanel from "../distribution/PendingRetrievalPanel";
import { buildAssignedItems, buildAvailableItems, buildHistoryMap, matchesAssetQuery } from "../distribution/hrDistributionHelpers";
import { WorkspaceShell } from "../shared/WorkspacePrimitives";

export function HRDistributionSection() {
  const [records, setRecords] = useState<DistributionRecordDto[]>([]);
  const [storageAssets, setStorageAssets] = useState<StorageAssetDto[]>([]);
  const [activeTab, setActiveTab] = useState<DistributionTab>("available-assets");
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    let live = true;
    void Promise.all([fetchAssetDistributionsRequest(true), fetchStorageAssetsRequest()]).then(([distributions, assets]) => {
      if (!live) return;
      setRecords(distributions);
      setStorageAssets(assets);
    });
    return () => {
      live = false;
    };
  }, []);

  const historyMap = useMemo(() => buildHistoryMap(records), [records]);
  const distributionRows = useMemo(() => records.filter((record) => [record.employeeName, record.assetName, record.assetCode, record.currentStorageName ?? "", record.recipientRole ?? ""].some((value) => value.toLowerCase().includes(searchValue.trim().toLowerCase()))), [records, searchValue]);
  const available = useMemo(() => buildAvailableItems(storageAssets, historyMap).filter((item) => item.holder === null && item.storageName !== "Assigned to employee" && matchesAssetQuery(item, searchValue)), [historyMap, searchValue, storageAssets]);
  const assigned = useMemo(() => buildAssignedItems(records).filter((item) => matchesAssetQuery(item, searchValue)), [records, searchValue]);
  const requested = useMemo(() => records.filter((record) => {
    const query = searchValue.trim().toLowerCase();
    const matchesQuery = !query || [record.employeeName, record.assetName, record.note ?? "", record.recipientRole ?? ""].some((value) => value.toLowerCase().includes(query));
    return matchesQuery && ((record.status ?? "").toLowerCase().includes("pending") || Boolean(record.assignmentRequestId));
  }), [records, searchValue]);
  const pendingRetrieval = useMemo(() => assigned.filter((item) => item.assetStatus.toLowerCase().includes("return") || item.assetStatus.toLowerCase().includes("retrieval")), [assigned]);
  const metricStats = useMemo(() => {
    const norm = (value?: string | null) => (value ?? "").toLowerCase();
    return {
      pending: records.filter((record) => norm(record.status).includes("pending") || norm(record.assetStatus).includes("pending")).length,
      inTransit: records.filter((record) => norm(record.status).includes("transit") || norm(record.assetStatus).includes("transit") || norm(record.status) === "active").length,
      delivered: records.filter((record) => norm(record.status).includes("deliver") || norm(record.assetStatus).includes("deliver") || Boolean(record.returnedAt)).length,
      signed: records.filter((record) => norm(record.status).includes("sign") || norm(record.assetStatus).includes("sign")).length,
    };
  }, [records]);

  const counts: Record<DistributionTab, number> = {
    distributions: distributionRows.length,
    "available-assets": available.length,
    "employee-requests": requested.length,
    "pending-retrieval": pendingRetrieval.length,
  };
  const visibleItems = activeTab === "available-assets" ? available : activeTab === "distributions" ? assigned : activeTab === "pending-retrieval" ? pendingRetrieval : [];

  return (
    <WorkspaceShell hideHeader title="Distribution" subtitle="" contentAlignment="left" contentWidthClassName="max-w-none" outerClassName="pl-[44px] pr-[60px] pt-[60px] pb-[24px]" backgroundClassName="bg-[radial-gradient(circle_at_top_left,#d8ebff_0%,#eef6ff_34%,#ffffff_74%)]">
      <DistributionHeader pendingCount={metricStats.pending} inTransitCount={metricStats.inTransit} deliveredCount={metricStats.delivered} signedCount={metricStats.signed} />
      <DistributionFilterPanel activeTab={activeTab} searchValue={searchValue} onSearchChange={setSearchValue} onTabChange={setActiveTab} counts={counts} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {activeTab === "distributions" ? <DistributionOrder rows={distributionRows} /> : null}
          {activeTab === "available-assets" ? <DistributionAssetGrid items={visibleItems.slice(0, 6)} /> : null}
          {activeTab === "employee-requests" ? <EmployeeOrder rows={requested} /> : null}
          {activeTab === "pending-retrieval" ? <PendingRetrievalPanel items={pendingRetrieval} /> : null}
        </div>
      </div>
    </WorkspaceShell>
  );
}
