"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  downloadAssetLabelsPdfRequest,
  fetchStorageAssetDetailRequest,
  type StorageAssetDto,
  updateStorageAssetRequest,
} from "@/app/(dashboard)/_graphql/storage/storage-api";
import {
  fetchAssetDistributionsRequest,
  type DistributionRecordDto,
} from "@/app/(dashboard)/_graphql/distribution/distribution-api";
import { downloadBase64File } from "@/app/_lib/download-base64";
import { parseIntakeMetadata } from "@/app/_lib/intake-metadata";
import {
  formatCurrency,
  formatDisplayDate,
  useOrdersStore,
} from "@/app/_lib/order-store";
import { buildRegisteredAssetScanUrl } from "@/app/_lib/qr-links";
import { EmptyState } from "../shared/WorkspacePrimitives";
import { BrandedQrCode } from "../shared/BrandedQrCode";
import { StorageWorkspaceFrame } from "../storage/StorageWorkspaceFrame";
import {
  STORAGE_CONDITION_OPTIONS,
  STORAGE_STATUS_OPTIONS,
  StorageConditionBadge,
  StorageSelectMenu,
} from "./storagePresentation";

type HistoryEntry = {
  title: string;
  status: string;
  owner: string;
  location: string;
  date: string;
};

type MobileTab = "details" | "history";
type RegisteredQrMode = "employee" | "audit";
function getMatchingDistributionRecords(
  asset: StorageAssetDto | null,
  records: DistributionRecordDto[],
) {
  if (!asset) return null;
  return records
    .filter(
      (record) =>
        record.assetId === asset.id ||
        record.assetCode === asset.assetCode ||
        (!!asset.serialNumber && record.serialNumber === asset.serialNumber),
    )
    .sort(
      (left, right) =>
        new Date(right.distributedAt || right.createdAt).getTime() -
        new Date(left.distributedAt || left.createdAt).getTime(),
    );
}

export function StorageAssetDetailPage({
  assetId,
  role,
  qrContext,
}: {
  assetId: string;
  role: string;
  qrContext?: {
    orderId?: string;
    requestNumber?: string;
    department?: string;
    storageLocation?: string;
    ownerName?: string;
    ownerRole?: string;
  };
}) {
  const orders = useOrdersStore();
  const [asset, setAsset] = useState<StorageAssetDto | null>(null);
  const [hasResolvedAsset, setHasResolvedAsset] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState("");
  const [confirmedLocation, setConfirmedLocation] = useState("");
  const [mobileTab, setMobileTab] = useState<MobileTab>("details");
  const [registeredQrMode, setRegisteredQrMode] =
    useState<RegisteredQrMode>("employee");
  const [distributionRecords, setDistributionRecords] = useState<
    DistributionRecordDto[]
  >([]);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      setErrorMessage(null);

      try {
        const [detail, distributions] = await Promise.all([
          fetchStorageAssetDetailRequest({ id: assetId }),
          fetchAssetDistributionsRequest(true),
        ]);
        if (!isMounted) return;

        if (!detail) {
          setErrorMessage("That asset could not be found.");
          return;
        }

        setAsset(detail);
        setDistributionRecords(distributions);
        setAuditResult(detail.receiveNote ?? "");
        setConfirmedLocation(detail.storageName);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load asset detail.",
        );
      } finally {
        if (isMounted) {
          setHasResolvedAsset(true);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [assetId]);

  async function handleAssetUpdate(nextValues: {
    assetStatus?: string;
    conditionStatus?: string;
  }) {
    if (!asset) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const updated = await updateStorageAssetRequest({
        id: asset.id,
        assetStatus: nextValues.assetStatus ?? asset.assetStatus,
        conditionStatus: nextValues.conditionStatus ?? asset.conditionStatus,
      });

      setAsset(updated);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update asset.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDownloadLabels() {
    if (!asset) return;

    setIsDownloadingPdf(true);
    setErrorMessage(null);

    try {
      const pdf = await downloadAssetLabelsPdfRequest([asset.assetCode]);
      downloadBase64File(pdf);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to download label PDF.",
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  const unitCostLabel = useMemo(() => {
    if (!asset) return "-";
    return formatCurrency(
      asset.unitCost ?? 0,
      parseCurrency(asset.currencyCode),
    );
  }, [asset]);
  const linkedOrder = useMemo(
    () =>
      asset
        ? (orders.find(
            (order) =>
              order.id === asset.orderId || order.id === qrContext?.orderId,
          ) ?? null)
        : null,
    [asset, orders, qrContext?.orderId],
  );
  const intakeMetadata = useMemo(
    () => parseIntakeMetadata(asset?.receiveNote),
    [asset?.receiveNote],
  );
  const matchedHandoff = useMemo(
    () => getMatchingDistributionRecords(asset, distributionRecords),
    [asset, distributionRecords],
  );
  const ownershipSummary = useMemo(() => {
    const records = matchedHandoff ?? [];
    const currentRecord =
      records.find((record) => record.status === "active") ?? null;
    const shouldUseFallbackOwner =
      asset && normalizeStorageStatus(asset.assetStatus) !== "available";
    const currentHolderName =
      currentRecord?.employeeName ??
      (shouldUseFallbackOwner
        ? qrContext?.ownerName ?? linkedOrder?.assignedTo
        : null) ??
      "Unassigned";
    const currentHolderRole =
      currentRecord?.recipientRole ??
      (shouldUseFallbackOwner
        ? qrContext?.ownerRole ?? linkedOrder?.assignedRole
        : null) ??
      "Unassigned";
    const previousSessions = records
      .filter((record) => !currentRecord || record.id !== currentRecord.id)
      .map(
        (record) =>
          `${record.employeeName} (${record.recipientRole || "Employee"}${asset?.department ? `, ${asset.department}` : ""})`,
      )
      .filter(
        (holder, index, list) => holder && list.indexOf(holder) === index,
      );
    const usageNotes = records
      .filter(
        (record) =>
          !!record.note?.trim() ||
          !!record.usageYears?.trim() ||
          !!record.returnCondition?.trim() ||
          !!record.returnPower?.trim(),
      )
      .map(
        (record, index) =>
          `${index + 1}. ${record.employeeName} (${record.recipientRole || "Employee"})\nReceived: ${formatDateOnly(record.distributedAt || record.createdAt)}\nReturned: ${record.returnedAt ? formatDateOnly(record.returnedAt) : "-"}\nUsed: ${calculateUsageDuration(record.distributedAt || record.createdAt, record.returnedAt) || record.usageYears || "-"}\nCondition: ${record.returnCondition || "-"}\nPower: ${record.returnPower || "-"}\nNote: ${record.note?.trim() || "No notes"}`,
      );
    return {
      holder: currentHolderName,
      previousHolder:
        previousSessions.length > 0
          ? previousSessions
              .map((holder, index) => `${index + 1}. ${holder}`)
              .join("\n")
          : "-",
      holderRole: currentHolderRole,
      usageNotes: usageNotes.length > 0 ? usageNotes.join("\n\n") : "No notes",
      department:
        linkedOrder?.department ??
        qrContext?.department ??
        asset?.department ??
        "-",
      requestNumber:
        linkedOrder?.requestNumber ??
        qrContext?.requestNumber ??
        asset?.requestNumber ??
        "-",
      storage:
        linkedOrder?.storageLocation ??
        qrContext?.storageLocation ??
        asset?.storageName ??
        "Main warehouse / Intake",
      specifications:
          asset?.assetAttributes.length
            ? asset.assetAttributes
                .map(
                  (attribute, index) =>
                    `${index + 1}. ${attribute.attributeName}: ${attribute.attributeValue}`,
                )
                .join("\n")
            : intakeMetadata.specifications.length > 0
            ? intakeMetadata.specifications
                .map(
                  (specification, index) =>
                    `${index + 1}. ${specification.name}: ${specification.value}`,
                )
                .join("\n")
          : "No specifications",
    };
    }, [
      asset,
      intakeMetadata.specifications,
      linkedOrder,
      matchedHandoff,
    qrContext,
  ]);

  const detailItems = useMemo(() => {
    if (!asset) return [];

    return [
      { label: "Asset ID", value: asset.assetCode },
      { label: "Asset Name", value: asset.assetName },
      { label: "Department", value: asset.department || "-" },
      { label: "Type", value: asset.itemType || "-" },
      { label: "Location", value: asset.storageName },
      {
        label: "Condition",
        value: humanizeConditionLabel(asset.conditionStatus),
      },
      { label: "Quantity", value: "1" },
      {
        label: "Status",
        value: humanizeStatusLabel(normalizeStorageStatus(asset.assetStatus)),
      },
    ];
  }, [asset]);

  const historyItems = useMemo(() => {
    if (!asset) return [];

    return buildHistoryEntries(asset, matchedHandoff ?? undefined);
  }, [asset, matchedHandoff]);

  const showEmployeeView = role === "employee";
  const router = useRouter();

  return (
    <StorageWorkspaceFrame
      title="Storage"
      subtitle="Manage your inventory stock levels"
      backLabel="Back to Storage Assets"
      onBack={() => router.push(`/${role}?section=storage`)}
    >
      {errorMessage && !asset ? (
        <EmptyState
          title="Asset detail unavailable"
          description={errorMessage}
        />
      ) : !hasResolvedAsset || !asset ? null : (
        <div className="mx-auto w-full max-w-[1280px]">
          <div className={showEmployeeView ? "" : "lg:hidden"}>
            <MobileAssetDetailView
              asset={asset}
              role={role}
              activeTab={mobileTab}
              onTabChange={setMobileTab}
              historyItems={historyItems}
              qrMode={registeredQrMode}
              onQrModeChange={setRegisteredQrMode}
              ownershipSummary={ownershipSummary}
            />
          </div>
          <div
            className={`gap-5 xl:grid-cols-[310px_minmax(0,1fr)] ${
              showEmployeeView ? "hidden" : "hidden lg:grid"
            }`}
          >
            <section className="overflow-hidden rounded-[20px] border border-[#d6e4f2] bg-white shadow-[0_20px_50px_rgba(148,163,184,0.16)]">
              <div className="border-b border-[#dbe7f3] px-5 py-4">
                <h2 className="text-[16px] font-semibold leading-tight text-[#101828]">
                  Storage
                </h2>
              </div>

              <div className="px-5 py-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dfeeff] text-[12px] font-semibold text-[#1d4ed8]">
                    {buildInitials(asset.assetName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-[#111827]">
                      Storage Team
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-[12px] text-[#64748b]">
                        Storage Coordinator
                      </span>
                      <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[12px] font-medium text-[#35589c]">
                        Storage
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[16px] border border-[#e5edf6] bg-[#f8fbff] p-4">
                  <div className="flex min-h-[170px] items-center justify-center overflow-hidden rounded-[14px] bg-white p-3 shadow-[inset_0_0_0_1px_rgba(219,231,243,0.8)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        asset.assetImageDataUrl || buildAssetIllustration(asset)
                      }
                      alt={asset.assetName}
                      className="h-full max-h-[160px] w-full object-contain"
                    />
                  </div>
                  <p className="mt-4 text-[12px] leading-5 text-[#475467]">
                    {asset.receiveNote ||
                      `${asset.assetName} is currently tracked in storage and ready for review, reassignment, or maintenance updates.`}
                  </p>
                  <p className="mt-4 text-[12px] text-[#8b99ac]">
                    {formatDisplayDate(asset.updatedAt)} 11:10 PM
                  </p>
                </div>

                <div className="mt-4 space-y-0">
                  {detailItems.map((item, index) => (
                    <div
                      key={item.label}
                      className={`flex items-center justify-between gap-4 border-[#dbe7f3] py-3 ${
                        index === 0 ? "border-t" : ""
                      } ${index === detailItems.length - 1 ? "border-b" : "border-b"}`}
                    >
                      <span className="text-[12px] text-[#667085]">
                        {item.label}
                      </span>
                      <span className="text-right text-[12px] font-medium text-[#101828]">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[20px] border border-[#d6e4f2] bg-white shadow-[0_20px_50px_rgba(148,163,184,0.16)]">
              <div className="border-b border-[#dbe7f3] px-5 py-4">
                <h3 className="text-[16px] font-semibold leading-tight text-[#101828]">
                  Audit Item
                </h3>
              </div>

              <div className="space-y-5 px-5 py-5">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <DisplayField
                    label="Request ID"
                    value={ownershipSummary.requestNumber}
                  />
                  <DisplayField
                    label="Request Date"
                    value={formatDisplayDate(asset.requestDate)}
                  />
                  <DisplayField
                    label="Owner Role"
                    value={ownershipSummary.holderRole}
                  />
                  <DisplayField label="Owner" value={ownershipSummary.holder} />
                  <DisplayField
                    label="Previous Holder"
                    value={ownershipSummary.previousHolder}
                  />
                  <DisplayField
                    label="Department"
                    value={ownershipSummary.department}
                  />
                  <DisplayField
                    label="Storage"
                    value={ownershipSummary.storage}
                  />
                  <DisplayField
                    label="Usage Notes"
                    value={ownershipSummary.usageNotes}
                  />
                  <DisplayField
                    label="Specifications"
                    value={ownershipSummary.specifications}
                  />
                  <ControlField label="Confirmed Location">
                    <select
                      value={confirmedLocation}
                      onChange={(event) =>
                        setConfirmedLocation(event.target.value)
                      }
                      className="h-12 w-full rounded-[12px] border border-[#d0d5dd] bg-white px-4 text-[14px] text-[#344054] outline-none shadow-[0_12px_30px_rgba(148,163,184,0.12)]"
                    >
                      {buildLocationOptions(asset.storageName).map(
                        (location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ),
                      )}
                    </select>
                  </ControlField>
                  <ControlField label="Condition">
                    <StorageSelectMenu
                      label=""
                      value={asset.conditionStatus}
                      options={STORAGE_CONDITION_OPTIONS}
                      disabled={isSaving}
                      onChange={(conditionStatus) =>
                        void handleAssetUpdate({ conditionStatus })
                      }
                      compact
                    />
                  </ControlField>
                  <ControlField label="Status">
                    <StorageSelectMenu
                      label=""
                      value={normalizeStorageStatus(asset.assetStatus)}
                      options={STORAGE_STATUS_OPTIONS}
                      disabled={isSaving}
                      onChange={(assetStatus) =>
                        void handleAssetUpdate({ assetStatus })
                      }
                      compact
                    />
                  </ControlField>
                </div>

                <div className="rounded-[16px] border border-[#dbe7f3] bg-[#f8fbff] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-[16px] font-semibold text-[#101828]">
                      Value
                    </h4>
                    <span className="rounded-full bg-[#e8f0ff] px-3 py-1 text-[12px] font-semibold text-[#35589c]">
                      1 item
                    </span>
                  </div>
                  <div className="mt-4 space-y-3 text-[14px]">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#667085]">Subtotal</span>
                      <span className="font-medium text-[#101828]">
                        {unitCostLabel}
                      </span>
                    </div>
                    <div className="border-t border-[#dbe7f3] pt-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[16px] font-semibold text-[#101828]">
                          Total
                        </span>
                        <span className="text-[16px] font-semibold leading-none text-[#101828]">
                          {unitCostLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-[14px] font-semibold text-[#111827]">
                    Audit Result
                  </span>
                  <textarea
                    value={auditResult}
                    onChange={(event) => setAuditResult(event.target.value)}
                    rows={4}
                    placeholder="Add notes for approvers..."
                    className="w-full rounded-[12px] border border-[#d0d5dd] bg-white px-4 py-3 text-[12px] text-[#101828] outline-none"
                  />
                </label>

                <div className="rounded-[16px] border border-[#dbe7f3] bg-[#f8fbff] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[12px] font-semibold text-[#0f172a]">
                      Scan QR
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleDownloadLabels()}
                      disabled={isDownloadingPdf}
                      className="cursor-pointer rounded-[10px] border border-[#d7e2ef] bg-white px-3 py-2 text-[12px] font-medium text-[#334155] transition hover:bg-[#f8fbff] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDownloadingPdf ? "Preparing..." : "Print Label PDF"}
                    </button>
                  </div>
                  <div className="mt-3 rounded-[10px] border border-[#dbeafe] bg-white p-3">
                    <ReceiveStyleQrCard
                      asset={asset}
                      role={role}
                      mode={registeredQrMode}
                      onModeChange={setRegisteredQrMode}
                      ownershipSummary={ownershipSummary}
                    />
                  </div>
                </div>

                {errorMessage ? (
                  <p className="text-[12px] font-medium text-[#dc2626]">
                    {errorMessage}
                  </p>
                ) : null}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      void handleAssetUpdate({
                        assetStatus: asset.assetStatus,
                        conditionStatus: asset.conditionStatus,
                      })
                    }
                    disabled={isSaving}
                    className="inline-flex h-11 cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#5d88ce] px-5 text-[14px] font-medium text-white transition duration-150 hover:bg-[#4c78c1] active:scale-[0.98] active:bg-[#436cae] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfdbfe] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#cbd5e1] disabled:text-white disabled:opacity-100"
                  >
                    <span className="fx-submit-icon-wrapper">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="fx-submit-icon"
                      >
                        <path d="m22 2-7 20-4-9-9-4Z" />
                        <path d="M22 2 11 13" />
                      </svg>
                    </span>
                    <span className="fx-submit-label">
                      {isSaving ? "Saving..." : "Submit"}
                    </span>
                  </button>
                </div>

                <div>
                  <h4 className="text-[16px] font-semibold text-[#101828]">
                    History
                  </h4>
                  <div className="mt-4 grid gap-3 xl:grid-cols-3">
                    {historyItems.map((entry, index) => (
                      <HistoryCard
                        key={`${entry.title}-${entry.date}-${index}`}
                        entry={entry}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </StorageWorkspaceFrame>
  );
}

function MobileAssetDetailView({
  asset,
  role,
  activeTab,
  onTabChange,
  historyItems,
  qrMode,
  onQrModeChange,
  ownershipSummary,
}: {
  asset: StorageAssetDto;
  role: string;
  activeTab: MobileTab;
  onTabChange: (value: MobileTab) => void;
  historyItems: HistoryEntry[];
  qrMode: RegisteredQrMode;
  onQrModeChange: (value: RegisteredQrMode) => void;
  ownershipSummary: {
    holder: string;
    previousHolder: string;
    holderRole: string;
    usageNotes: string;
    specifications: string;
    department: string;
    requestNumber: string;
    storage: string;
  };
}) {
  const heroImage = asset.assetImageDataUrl || buildAssetIllustration(asset);
  const [isQrZoomOpen, setIsQrZoomOpen] = useState(false);
  const qrLink = buildRegisteredAssetScanUrl({
    qrCode: asset.qrCode,
    mode: qrMode,
    role: qrMode === "employee" ? "employee" : role,
    orderId: asset.orderId,
    requestNumber: ownershipSummary.requestNumber,
    department: ownershipSummary.department,
    storageLocation: ownershipSummary.storage,
    ownerName: ownershipSummary.holder,
    ownerRole: ownershipSummary.holderRole,
  });

  return (
    <section className="overflow-hidden rounded-[24px] border border-[#d6e4f2] bg-white shadow-[0_20px_50px_rgba(148,163,184,0.16)]">
      <div className="overflow-hidden border-b border-[#dbe7f3] bg-[linear-gradient(180deg,#eff6ff_0%,#dbeafe_100%)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt={asset.assetName}
          className="h-[290px] w-full object-cover object-center"
        />
      </div>

      <div className="px-4 pb-5 pt-4">
        <h2 className="text-[18px] font-semibold text-[#101828]">
          {asset.assetName}
        </h2>
        <p className="mt-1 text-[13px] text-[#667085]">
          {asset.assetCode} · {asset.itemType || "Asset"}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#ebf3ff] px-2.5 py-1 text-[11px] font-semibold text-[#255df0]">
            {humanizeStatusLabel(normalizeStorageStatus(asset.assetStatus))}
          </span>
          <span className="rounded-full bg-[#ecfff4] px-2.5 py-1 text-[11px] font-semibold text-[#12a150]">
            {humanizeConditionLabel(asset.conditionStatus)}
          </span>
          <span className="rounded-full bg-[#f5f7fb] px-2.5 py-1 text-[11px] font-medium text-[#667085]">
            {asset.itemType || "Asset"}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 rounded-[12px] bg-[#f8fafc] p-1">
          {[
            { value: "details", label: "Details" },
            { value: "history", label: "History" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange(tab.value as MobileTab)}
              className={`cursor-pointer rounded-[10px] px-3 py-2 text-[13px] font-medium transition ${
                activeTab === tab.value
                  ? "bg-white text-[#101828] shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
                  : "text-[#667085]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "details" ? (
          <div className="mt-5 space-y-5">
            <MobileSection
              eyebrow="Ownership"
              subtitle="Current responsible person"
            >
              <MobileInfoRow label="Role" value={ownershipSummary.holderRole} />
              <MobileInfoRow label="Holder" value={ownershipSummary.holder} />
              <MobileInfoRow
                label="Previous holder"
                value={ownershipSummary.previousHolder}
              />
              <MobileInfoRow
                label="Usage notes"
                value={ownershipSummary.usageNotes}
              />
              <MobileInfoRow
                label="Specifications"
                value={ownershipSummary.specifications}
              />
              <MobileInfoRow
                label="Department"
                value={ownershipSummary.department}
              />
              <MobileInfoRow
                label="Request"
                value={ownershipSummary.requestNumber}
              />
              <MobileInfoRow label="Storage" value={ownershipSummary.storage} />
            </MobileSection>

            <MobileSection
              eyebrow="Location"
              subtitle="Most recently recorded place"
            >
              <div className="rounded-[14px] border border-[#e4e7ec] bg-white px-4 py-3">
                <p className="text-[14px] font-medium text-[#101828]">
                  {ownershipSummary.storage}
                </p>
              </div>
            </MobileSection>

            {role !== "employee" ? (
              <MobileSection
                eyebrow="Scan QR"
                subtitle="Scan this code to open the asset record"
              >
                <div className="rounded-[16px] border border-[#dbeafe] bg-[#f8fbff] p-4">
                  <QrModeSwitch value={qrMode} onChange={onQrModeChange} />
                  <div className="flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsQrZoomOpen(true)}
                      className="inline-flex cursor-pointer items-center justify-center rounded-[16px]"
                      aria-label="Open QR preview"
                    >
                      <BrandedQrCode
                        value={qrLink}
                        title={asset.assetCode}
                        size={132}
                        className="w-full max-w-[210px] shrink-0 p-2 shadow-none"
                        showValue={false}
                      />
                    </button>
                    <div className="w-full rounded-[12px] border border-[#dbe7f3] bg-white px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8fa0ba]">
                          {qrMode === "employee"
                            ? "Employee QR Link"
                            : "Audit QR Link"}
                        </p>
                        <Link
                          href={qrLink}
                          className="text-[11px] font-semibold text-[#2563eb] underline underline-offset-2"
                        >
                          Open
                        </Link>
                      </div>
                      <p className="mt-2 break-all text-[11px] leading-5 text-[#475569]">
                        {qrLink}
                      </p>
                    </div>
                    <p className="text-center text-[12px] font-medium text-[#64748b]">
                      {qrMode === "employee"
                        ? "Employee phone-oor scan hiigeed detail ruu orno."
                        : "Audit team scan hiigeed storage record shalgana."}
                    </p>
                  </div>
                </div>
                {isQrZoomOpen ? (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
                    <button
                      type="button"
                      onClick={() => setIsQrZoomOpen(false)}
                      className="inline-flex cursor-pointer rounded-[24px] bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.24)]"
                      aria-label="Close QR preview"
                    >
                      <BrandedQrCode
                        value={qrLink}
                        title={asset.assetCode}
                        size={300}
                        className="w-full max-w-[360px] p-2 shadow-none"
                        showValue={false}
                      />
                    </button>
                  </div>
                ) : null}
              </MobileSection>
            ) : null}
          </div>
        ) : null}

        {activeTab === "history" ? (
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                  History
                </p>
              </div>
              <button
                type="button"
                className="cursor-pointer text-[12px] font-medium text-[#667085]"
              >
                See all
              </button>
            </div>
            <div className="space-y-4">
              {historyItems.map((entry, index) => (
                <div
                  key={`${entry.title}-${index}`}
                  className="flex items-start gap-3"
                >
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${historyToneClass(entry.title)}`}
                  >
                    <span className="text-[15px] text-white">
                      {historyIcon(entry.title)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-medium text-[#101828]">
                          {entry.title}
                        </p>
                        <p className="text-[13px] text-[#667085]">
                          {entry.owner} · {entry.location}
                        </p>
                      </div>
                      <span className="shrink-0 text-[12px] text-[#667085]">
                        {entry.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function MobileSection({
  eyebrow,
  subtitle,
  children,
}: {
  eyebrow: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
        {eyebrow}
      </p>
      <p className="mt-1 text-[12px] text-[#667085]">{subtitle}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function MobileInfoRow({ label, value }: { label: string; value: string }) {
  const lines = value.split("\n").filter(Boolean);
  const normalizedLabel = label.toLowerCase();
  const segments = value.split("\n\n").filter(Boolean);
  const hasUsageNotes =
    normalizedLabel === "usage notes" &&
    value.trim() !== "" &&
    value.trim().toLowerCase() !== "no notes";
  const isPreviousHolderList =
    normalizedLabel === "previous holder" && lines.length > 1;
  const isUsageNotesList = hasUsageNotes && segments.length > 1;
  const isSpecificationList =
    normalizedLabel === "specifications" && lines.length > 1;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#eef2f6] py-3 last:border-b-0">
      <span className="text-[13px] text-[#667085]">{label}</span>
      {isPreviousHolderList ? (
        <div className="max-w-[62%] space-y-2 text-right">
          {lines.map((line) => (
            <div
              key={line}
              className="rounded-[10px] border border-[#dbe7f3] bg-[#f8fbff] px-3 py-2 text-[13px] font-medium leading-5 text-[#101828]"
            >
              {line}
            </div>
          ))}
        </div>
      ) : isSpecificationList ? (
        <div className="max-w-[62%] space-y-2 text-left">
          {lines.map((line) => (
            <div
              key={line}
              className="rounded-[10px] border border-[#dbe7f3] bg-[#f8fbff] px-3 py-2 text-[13px] leading-5 text-[#101828]"
            >
              {line}
            </div>
          ))}
        </div>
      ) : isUsageNotesList ? (
        <div className="max-w-[62%] space-y-2 overflow-y-auto text-left max-h-[300px] pr-1">
          {segments.map((segment) => (
            <div
              key={segment}
              className="rounded-[10px] border border-[#dbe7f3] bg-[#f8fbff] px-3 py-2 text-[13px] leading-5 text-[#101828] whitespace-pre-wrap break-words"
            >
              {segment}
            </div>
          ))}
        </div>
      ) : hasUsageNotes ? (
        <div className="max-w-[62%] max-h-[300px] overflow-y-auto rounded-[10px] border border-[#dbe7f3] bg-[#f8fbff] px-3 py-2 text-[13px] leading-5 text-[#101828] whitespace-pre-wrap break-words text-left">
          {value}
        </div>
      ) : (
        <span className="max-w-[62%] whitespace-pre-wrap text-right text-[14px] font-medium leading-5 text-[#101828]">
          {value}
        </span>
      )}
    </div>
  );
}

function DisplayField({ label, value }: { label: string; value: string }) {
  const isMultiline = value.includes("\n") || value.length > 72;
  const lines = value.split("\n").filter(Boolean);
  const normalizedLabel = label.toLowerCase();
  const segments = value.split("\n\n").filter(Boolean);
  const hasUsageNotes =
    normalizedLabel === "usage notes" &&
    value.trim() !== "" &&
    value.trim().toLowerCase() !== "no notes";
  const isPreviousHolderList =
    normalizedLabel === "previous holder" && lines.length > 1;
  const isUsageNotesList = hasUsageNotes && segments.length > 1;
  const isSpecificationList =
    normalizedLabel === "specifications" && lines.length > 1;
  return (
    <div>
      <p className="mb-2 text-[12px] font-semibold text-[#111827]">{label}</p>
      {isPreviousHolderList ? (
        <div className="space-y-2 rounded-[12px] border border-[#d0d5dd] bg-[#f8fbff] p-3">
          {lines.map((line) => (
            <div
              key={line}
              className="rounded-[10px] border border-[#dbe7f3] bg-white px-3 py-2 text-[12px] font-medium leading-5 text-[#344054]"
            >
              {line}
            </div>
          ))}
        </div>
      ) : isSpecificationList ? (
        <div className="space-y-2 rounded-[12px] border border-[#d0d5dd] bg-[#f8fbff] p-3">
          {lines.map((line) => (
            <div
              key={line}
              className="rounded-[10px] border border-[#dbe7f3] bg-white px-3 py-2 text-[12px] leading-5 text-[#344054]"
            >
              {line}
            </div>
          ))}
        </div>
      ) : isUsageNotesList ? (
        <div className="max-h-[300px] space-y-3 overflow-y-auto rounded-[12px] border border-[#d0d5dd] bg-[#f8fbff] p-3 pr-2">
          {segments.map((segment) => (
            <div
              key={segment}
              className="rounded-[10px] border border-[#dbe7f3] bg-white px-3 py-3 text-[12px] leading-6 text-[#344054] whitespace-pre-wrap break-words"
            >
              {segment}
            </div>
          ))}
        </div>
      ) : hasUsageNotes ? (
        <div className="max-h-[300px] overflow-y-auto rounded-[12px] border border-[#d0d5dd] bg-[#f8fbff] px-4 py-3 pr-3 text-[12px] leading-6 text-[#344054] whitespace-pre-wrap break-words">
          {value}
        </div>
      ) : (
        <div
          className={`rounded-[12px] border border-[#d0d5dd] px-4 py-3 text-[12px] leading-6 text-[#344054] ${
            isMultiline
              ? "min-h-[96px] whitespace-pre-wrap break-words bg-[#f8fbff]"
              : "flex min-h-12 items-center bg-white"
          }`}
        >
          {value}
        </div>
      )}
    </div>
  );
}

function formatDateOnly(value?: string | null) {
  if (!value) return "-";
  const source = value.includes("T") ? value.slice(0, 10) : value;
  const [year, month, day] = source.split("-");
  return year && month && day
    ? `${year}.${month}.${day}`
    : formatDisplayDate(value);
}

function calculateUsageDuration(
  distributedAt?: string | null,
  returnedAt?: string | null,
) {
  if (!distributedAt || !returnedAt) return "-";
  const start = new Date(distributedAt);
  const end = new Date(returnedAt);
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  )
    return "-";
  const totalDays = Math.max(
    1,
    Math.floor((end.getTime() - start.getTime()) / 86_400_000),
  );
  if (totalDays < 30) return `${totalDays} day`;
  if (totalDays < 365) return `${Math.floor(totalDays / 30)} mo`;
  return `${(totalDays / 365).toFixed(1).replace(/\.0$/, "")} yr`;
}

function ControlField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-semibold text-[#111827]">{label}</p>
      {children}
    </div>
  );
}

function ReceiveStyleQrCard({
  asset,
  role,
  mode,
  onModeChange,
  ownershipSummary,
}: {
  asset: StorageAssetDto;
  role: string;
  mode: RegisteredQrMode;
  onModeChange: (value: RegisteredQrMode) => void;
  ownershipSummary: {
    holder: string;
    previousHolder: string;
    holderRole: string;
    usageNotes: string;
    specifications: string;
    department: string;
    requestNumber: string;
    storage: string;
  };
}) {
  const [isQrZoomOpen, setIsQrZoomOpen] = useState(false);
  const qrLink = buildRegisteredAssetScanUrl({
    qrCode: asset.qrCode,
    mode,
    role: mode === "employee" ? "employee" : role,
    orderId: asset.orderId,
    requestNumber: ownershipSummary.requestNumber,
    department: ownershipSummary.department,
    storageLocation: ownershipSummary.storage,
    ownerName: ownershipSummary.holder,
    ownerRole: ownershipSummary.holderRole,
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <QrModeSwitch value={mode} onChange={onModeChange} />
      <button
        type="button"
        onClick={() => setIsQrZoomOpen(true)}
        className="inline-flex cursor-pointer items-center justify-center rounded-[16px]"
        aria-label="Open QR preview"
      >
        <BrandedQrCode
          value={qrLink}
          title={asset.assetCode}
          size={132}
          className="w-full max-w-[210px] shrink-0 p-2 shadow-none"
          showValue={false}
        />
      </button>
      <div className="w-full rounded-[12px] border border-[#e2e8f0] bg-[#f8fbff] px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8fa0ba]">
            {mode === "employee" ? "Employee QR Link" : "Audit QR Link"}
          </p>
          <Link
            href={qrLink}
            className="text-[11px] font-semibold text-[#2563eb] underline underline-offset-2"
          >
            Open
          </Link>
        </div>
        <p className="mt-2 break-all text-left text-[11px] leading-5 text-[#475569]">
          {qrLink}
        </p>
      </div>
      <p className="text-center text-[12px] font-medium text-[#64748b]">
        {mode === "employee"
          ? "Employee phone-oor scan hiij asset detail neene."
          : "Audit team scan hiigeed storage record shalgana."}
      </p>
      {isQrZoomOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <button
            type="button"
            onClick={() => setIsQrZoomOpen(false)}
            className="inline-flex cursor-pointer rounded-[24px] bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.24)]"
            aria-label="Close QR preview"
          >
            <BrandedQrCode
              value={qrLink}
              title={asset.assetCode}
              size={300}
              className="w-full max-w-[360px] p-2 shadow-none"
              showValue={false}
            />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function QrModeSwitch({
  value,
  onChange,
}: {
  value: RegisteredQrMode;
  onChange: (value: RegisteredQrMode) => void;
}) {
  return (
    <div className="mb-3 inline-grid grid-cols-2 rounded-[12px] bg-[#eef4ff] p-1">
      {[
        { value: "employee", label: "Employee QR" },
        { value: "audit", label: "Audit QR" },
      ].map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value as RegisteredQrMode)}
          className={`cursor-pointer rounded-[10px] px-3 py-2 text-[12px] font-semibold transition ${
            value === option.value
              ? "bg-white text-[#0f172a] shadow-[0_8px_18px_rgba(148,163,184,0.2)]"
              : "text-[#5b6b84]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function HistoryCard({ entry }: { entry: HistoryEntry }) {
  return (
    <div className="rounded-[16px] border border-[#dbe7f3] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[14px] font-semibold text-[#111827]">
            {entry.title}
          </p>
          <p className="mt-1 text-[12px] text-[#8b99ac]">{entry.date}</p>
        </div>
        <div className="shrink-0">
          <StorageConditionBadge value={entry.status} compact iconOnly />
        </div>
      </div>
      <div className="mt-4 space-y-2 text-[13px]">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#667085]">Owner</span>
          <span className="font-medium text-[#101828]">{entry.owner}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#667085]">Location</span>
          <span className="font-medium text-[#101828]">{entry.location}</span>
        </div>
      </div>
    </div>
  );
}

function buildInitials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  return (
    words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("") || "AS"
  );
}

function buildAssetIllustration(asset: StorageAssetDto) {
  const type =
    `${asset.assetName} ${asset.itemType} ${asset.category}`.toLowerCase();
  const accent = "#2563eb";
  const accentSoft = "#dbeafe";
  const frame = "#1e293b";

  let shape = "";

  if (type.includes("monitor") || type.includes("display")) {
    shape = `
      <rect x="120" y="50" width="180" height="110" rx="8" fill="${accentSoft}" stroke="${frame}" stroke-width="6"/>
      <rect x="138" y="68" width="144" height="74" rx="4" fill="url(#screenGradient)"/>
      <rect x="190" y="165" width="40" height="12" rx="4" fill="${frame}"/>
      <rect x="170" y="177" width="80" height="12" rx="6" fill="#94a3b8"/>
    `;
  } else if (type.includes("keyboard")) {
    shape = `
      <rect x="90" y="88" width="240" height="70" rx="14" fill="#e2e8f0" stroke="${frame}" stroke-width="5"/>
      ${Array.from({ length: 12 }, (_, index) => {
        const x = 106 + (index % 6) * 36;
        const y = 102 + Math.floor(index / 6) * 22;
        return `<rect x="${x}" y="${y}" width="24" height="14" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>`;
      }).join("")}
    `;
  } else if (type.includes("laptop") || type.includes("macbook")) {
    shape = `
      <rect x="118" y="46" width="184" height="112" rx="10" fill="${accentSoft}" stroke="${frame}" stroke-width="6"/>
      <rect x="138" y="65" width="144" height="74" rx="4" fill="url(#screenGradient)"/>
      <path d="M90 176h240l-18 18H108z" fill="#cbd5e1" stroke="${frame}" stroke-width="4"/>
    `;
  } else if (type.includes("basketball")) {
    shape = `
      <circle cx="210" cy="112" r="70" fill="#f97316" stroke="${frame}" stroke-width="6"/>
      <path d="M140 112h140" stroke="#7c2d12" stroke-width="6"/>
      <path d="M210 42c-18 18-28 42-28 70s10 52 28 70" stroke="#7c2d12" stroke-width="6" fill="none"/>
      <path d="M210 42c18 18 28 42 28 70s-10 52-28 70" stroke="#7c2d12" stroke-width="6" fill="none"/>
    `;
  } else {
    shape = `
      <rect x="120" y="46" width="180" height="132" rx="22" fill="${accentSoft}" stroke="${frame}" stroke-width="6"/>
      <path d="M160 96h100M160 124h100" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
      <circle cx="160" cy="70" r="16" fill="${accent}"/>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="420" height="260" viewBox="0 0 420 260" fill="none">
      <defs>
        <linearGradient id="screenGradient" x1="138" y1="68" x2="282" y2="142" gradientUnits="userSpaceOnUse">
          <stop stop-color="#dbeafe"/>
          <stop offset="1" stop-color="#60a5fa"/>
        </linearGradient>
      </defs>
      <rect width="420" height="260" rx="28" fill="#f8fbff"/>
      ${shape}
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildHistoryEntries(
  asset: StorageAssetDto,
  records?: DistributionRecordDto[],
): HistoryEntry[] {
  const base = [
    {
      title: "Ordered",
      status: "good",
      owner: asset.requester || "Inventory Team",
      location: "Vendor",
      date: formatDisplayDate(asset.requestDate),
    },
    {
      title: "Arrived at storage",
      status: "good",
      owner: "Storage",
      location: asset.storageName,
      date: formatDisplayDate(asset.receivedAt),
    },
    {
      title: "Held in storage",
      status: asset.conditionStatus,
      owner: "Storage",
      location: asset.storageName,
      date: formatDisplayDate(asset.updatedAt),
    },
  ];

  const distributionEntries = (records ?? []).flatMap((record) => {
    const entries: HistoryEntry[] = [
      {
        title: "Assigned by HR manager",
        status: "good",
        owner: record.employeeName || "Employee",
        location: record.currentStorageName || "Assigned out",
        date: formatDisplayDate(record.distributedAt || record.createdAt),
      },
    ];

    if (record.returnedAt) {
      entries.push({
        title: "Returned to storage",
        status: "good",
        owner: record.employeeName || "Employee",
        location: "Inventory Head",
        date: formatDisplayDate(record.returnedAt),
      });
    }

    if (record.note?.trim()) {
      entries.push({
        title: "Returned with note",
        status:
          (record.returnCondition || "").toLowerCase() === "damaged"
            ? "issue"
            : "good",
        owner: record.employeeName || "Employee",
        location: `${record.usageYears || "-"} | ${record.returnCondition || "-"} | ${record.returnPower || "-"} | ${record.note}`,
        date: formatDisplayDate(record.returnedAt || record.updatedAt),
      });
    }

    return entries;
  });

  return [...distributionEntries, ...base];

  /* const handoffEntries = (records ?? []).flatMap((record) => {
    const entries: HistoryEntry[] = [];
    if (entry.text.startsWith("Inspection:")) {
      const [usedFor = "-", condition = "-", power = "-", notes = "No notes"] = entry.text
        .replace("Inspection: ", "")
        .split(" | ");
      return [{
        title: `Returned with note`,
        status: condition.toLowerCase() === "damaged" ? "issue" : "good",
        owner: usedFor === "-" ? "HR retrieval" : `Used ${usedFor}`,
        location: `${condition} · ${power} · ${notes}`,
        date: entry.date || "-",
      }];
    }

    if (entry.text.includes("->") && !entry.text.includes("Inventory Head")) {
      const [from, to] = entry.text.split("->").map((value) => value.trim());
      return [{
        title: "Assigned by HR manager",
        status: "good",
        owner: to || "Employee",
        location: from || "Storage / Intake",
        date: entry.date || "-",
      }];
    }

    if (entry.text.includes("Inventory Head")) {
      const [from] = entry.text.split("->").map((value) => value.trim());
      return [{
        title: "Returned to storage",
        status: "good",
        owner: from || "Employee",
        location: "Inventory Head",
        date: entry.date || "-",
      }];
    }

    return [];
  });

  return [...handoffEntries.reverse(), ...base]; */
}

function buildLocationOptions(currentLocation: string) {
  const defaults = [
    currentLocation,
    "Main warehouse / Intake",
    "Warehouse A",
    "Warehouse B",
    "IT cage / Shelf 1",
    "Office storage / Cabinet 2",
  ];

  return Array.from(new Set(defaults.filter(Boolean)));
}

function historyIcon(title: string) {
  if (title.toLowerCase().includes("assigned")) return "•";
  if (title.toLowerCase().includes("audit")) return "✓";
  if (title.toLowerCase().includes("battery")) return "⌁";
  return "•";
}

function historyToneClass(title: string) {
  if (title.toLowerCase().includes("assigned")) return "bg-[#255df0]";
  if (title.toLowerCase().includes("audit")) return "bg-[#16a34a]";
  if (title.toLowerCase().includes("battery")) return "bg-[#fb923c]";
  return "bg-[#64748b]";
}

function humanizeConditionLabel(value: string) {
  if (value === "good") return "Good";
  if (value === "damaged") return "Damaged";
  if (value === "defective") return "Defective";
  if (value === "missing") return "Missing";
  if (value === "incomplete") return "Incomplete";
  return value;
}

function humanizeStatusLabel(value: string) {
  if (value === "available") return "Available";
  if (value === "assigned") return "Assigned";
  if (value === "inRepair") return "In Repair";
  if (value === "pendingDisposal") return "Pending";
  if (value === "pendingRetrieval") return "Pending";
  return value;
}

function parseCurrency(value: string) {
  if (value === "USD" || value === "EUR" || value === "MNT") {
    return value;
  }

  return "MNT";
}

function normalizeStorageStatus(value: string) {
  if (
    value === "inStorage" ||
    value === "received" ||
    value === "pendingAssignment"
  ) {
    return "available";
  }

  return value;
}
