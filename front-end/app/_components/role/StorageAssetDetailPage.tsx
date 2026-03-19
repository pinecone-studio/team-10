"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  downloadAssetLabelsPdfRequest,
  fetchStorageAssetsRequest,
  fetchStorageAssetDetailRequest,
  type StorageAssetDto,
  updateStorageAssetRequest,
} from "@/app/(dashboard)/_graphql/storage/storage-api";
import { downloadBase64File } from "@/app/_lib/download-base64";
import { formatCurrency, formatDisplayDate } from "@/app/_lib/order-store";
import { buildRegisteredAssetScanUrl } from "@/app/_lib/qr-links";
import { FrontendLoading } from "../shared/FrontendLoading";
import { EmptyState, WorkspaceShell } from "../shared/WorkspacePrimitives";
import { BrandedQrCode } from "../shared/BrandedQrCode";
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

type MobileTab = "details" | "history" | "assets";
type RegisteredQrMode = "employee" | "audit";

export function StorageAssetDetailPage({
  assetId,
  role,
}: {
  assetId: string;
  role: string;
}) {
  const [asset, setAsset] = useState<StorageAssetDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState("");
  const [confirmedLocation, setConfirmedLocation] = useState("");
  const [allAssets, setAllAssets] = useState<StorageAssetDto[]>([]);
  const [mobileTab, setMobileTab] = useState<MobileTab>("details");
  const [registeredQrMode, setRegisteredQrMode] =
    useState<RegisteredQrMode>("employee");

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const detail = await fetchStorageAssetDetailRequest({ id: assetId });
        if (!isMounted) return;

        if (!detail) {
          setErrorMessage("That asset could not be found.");
          return;
        }

        setAsset(detail);
        setAuditResult(detail.receiveNote ?? "");
        setConfirmedLocation(detail.storageName);
        const nextAssets = await fetchStorageAssetsRequest();
        if (!isMounted) return;
        setAllAssets(nextAssets);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load asset detail.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
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
        error instanceof Error ? error.message : "Failed to download label PDF.",
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  const unitCostLabel = useMemo(() => {
    if (!asset) return "-";
    return formatCurrency(asset.unitCost ?? 0, parseCurrency(asset.currencyCode));
  }, [asset]);

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

    return buildHistoryEntries(asset);
  }, [asset]);

  const relatedAssets = useMemo(() => {
    if (!asset) return [];

    const matches = allAssets.filter(
      (entry) => entry.id !== asset.id && entry.category === asset.category,
    );

    if (matches.length > 0) {
      return matches.slice(0, 3);
    }

    return buildFallbackAssignedAssets(asset);
  }, [allAssets, asset]);
  const showEmployeeView = role === "employee";

  return (
    <WorkspaceShell
      title="Storage"
      subtitle=""
      backgroundClassName="bg-[linear-gradient(180deg,#dcebfb_0%,#eff7ff_58%,#ffffff_100%)]"
      contentWidthClassName="max-w-[1280px]"
    >
      <Link
        href={`/${role}?section=storage`}
        className="inline-flex items-center gap-2 text-[14px] font-medium text-[#334155]"
      >
        <span aria-hidden="true">{"<-"}</span>
        <span>Back to Storage Assets</span>
      </Link>

      {errorMessage && !asset ? (
        <EmptyState title="Asset detail unavailable" description={errorMessage} />
      ) : isLoading || !asset ? (
        <FrontendLoading
          compact
          title="Loading asset detail"
          description="Fetching the latest storage snapshot for this asset."
        />
      ) : (
        <>
          <div className={showEmployeeView ? "" : "lg:hidden"}>
            <MobileAssetDetailView
              asset={asset}
              activeTab={mobileTab}
              onTabChange={setMobileTab}
              historyItems={historyItems}
              relatedAssets={relatedAssets}
              qrMode={registeredQrMode}
              onQrModeChange={setRegisteredQrMode}
            />
          </div>
          <div
            className={`gap-5 xl:grid-cols-[310px_minmax(0,1fr)] ${
              showEmployeeView ? "hidden" : "hidden lg:grid"
            }`}
          >
          <section className="overflow-hidden rounded-[20px] border border-[#d6e4f2] bg-white shadow-[0_20px_50px_rgba(148,163,184,0.16)]">
            <div className="border-b border-[#dbe7f3] px-5 py-4">
              <h2 className="text-[28px] font-semibold leading-tight text-[#101828]">
                Strorage
              </h2>
            </div>

            <div className="px-5 py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dfeeff] text-[12px] font-semibold text-[#1d4ed8]">
                  {buildInitials(asset.assetName)}
                </div>
                <div className="min-w-0">
                  <p className="text-[16px] font-semibold text-[#111827]">
                    Storage Team
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-[13px] text-[#64748b]">
                      Storage Coordinator
                    </span>
                    <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[11px] font-medium text-[#35589c]">
                      Storage
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[16px] border border-[#e5edf6] bg-[#f8fbff] p-4">
                <div className="flex min-h-[170px] items-center justify-center overflow-hidden rounded-[14px] bg-white p-3 shadow-[inset_0_0_0_1px_rgba(219,231,243,0.8)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={buildAssetIllustration(asset)}
                    alt={asset.assetName}
                    className="h-full max-h-[160px] w-full object-contain"
                  />
                </div>
                <p className="mt-4 text-[13px] leading-5 text-[#475467]">
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
                    <span className="text-[15px] text-[#667085]">{item.label}</span>
                    <span className="text-right text-[15px] font-medium text-[#101828]">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[20px] border border-[#d6e4f2] bg-white shadow-[0_20px_50px_rgba(148,163,184,0.16)]">
            <div className="border-b border-[#dbe7f3] px-5 py-4">
              <h3 className="text-[28px] font-semibold leading-tight text-[#101828]">
                Audit Item
              </h3>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <DisplayField label="Request ID" value={asset.requestNumber} />
                <DisplayField
                  label="Request Date"
                  value={formatDisplayDate(asset.requestDate)}
                />
                <ControlField label="Confirmed Location">
                  <select
                    value={confirmedLocation}
                    onChange={(event) => setConfirmedLocation(event.target.value)}
                    className="h-12 w-full rounded-[12px] border border-[#d0d5dd] bg-white px-4 text-[14px] text-[#344054] outline-none shadow-[0_12px_30px_rgba(148,163,184,0.12)]"
                  >
                    {buildLocationOptions(asset.storageName).map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
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
                    onChange={(assetStatus) => void handleAssetUpdate({ assetStatus })}
                    compact
                  />
                </ControlField>
              </div>

              <div className="rounded-[16px] border border-[#dbe7f3] bg-[#f8fbff] p-5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-[18px] font-semibold text-[#101828]">Value</h4>
                  <span className="rounded-full bg-[#e8f0ff] px-3 py-1 text-[11px] font-semibold text-[#35589c]">
                    1 item
                  </span>
                </div>
                <div className="mt-4 space-y-3 text-[15px]">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#667085]">Subtotal</span>
                    <span className="font-medium text-[#101828]">{unitCostLabel}</span>
                  </div>
                  <div className="border-t border-[#dbe7f3] pt-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[18px] font-semibold text-[#101828]">Total</span>
                      <span className="text-[28px] font-semibold leading-none text-[#101828]">
                        {unitCostLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold text-[#111827]">
                  Audit Result
                </span>
                <textarea
                  value={auditResult}
                  onChange={(event) => setAuditResult(event.target.value)}
                  rows={4}
                  placeholder="Add notes for approvers..."
                  className="w-full rounded-[12px] border border-[#d0d5dd] bg-white px-4 py-3 text-[14px] text-[#101828] outline-none"
                />
              </label>

              <div className="rounded-[16px] border border-[#dbe7f3] bg-[#f8fbff] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] font-semibold text-[#0f172a]">
                    Scan QR
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleDownloadLabels()}
                    disabled={isDownloadingPdf}
                    className="rounded-[10px] border border-[#d7e2ef] bg-white px-3 py-2 text-[12px] font-medium text-[#334155] transition hover:bg-[#f8fbff] disabled:opacity-60"
                  >
                    {isDownloadingPdf ? "Preparing..." : "Print Label PDF"}
                  </button>
                </div>
                <div className="mt-3 rounded-[10px] border border-[#dbeafe] bg-white p-3">
                  <ReceiveStyleQrCard
                    asset={asset}
                    mode={registeredQrMode}
                    onModeChange={setRegisteredQrMode}
                  />
                </div>
              </div>

              {errorMessage ? (
                <p className="text-[13px] font-medium text-[#dc2626]">{errorMessage}</p>
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
                  className="fx-submit-button h-11 px-5 text-[13px] font-medium disabled:opacity-60"
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
                <h4 className="text-[18px] font-semibold text-[#101828]">History</h4>
                <div className="mt-4 grid gap-3 xl:grid-cols-3">
                  {historyItems.map((entry) => (
                    <HistoryCard key={entry.title} entry={entry} />
                  ))}
                </div>
              </div>
            </div>
          </section>
          </div>
        </>
      )}
    </WorkspaceShell>
  );
}

function MobileAssetDetailView({
  asset,
  activeTab,
  onTabChange,
  historyItems,
  relatedAssets,
  qrMode,
  onQrModeChange,
}: {
  asset: StorageAssetDto;
  activeTab: MobileTab;
  onTabChange: (value: MobileTab) => void;
  historyItems: HistoryEntry[];
  relatedAssets: StorageAssetDto[];
  qrMode: RegisteredQrMode;
  onQrModeChange: (value: RegisteredQrMode) => void;
}) {
  const heroImage = buildAssetIllustration(asset);
  const [verifyState, setVerifyState] = useState<"idle" | "verifying" | "verified">(
    "idle",
  );
  const qrLink = buildRegisteredAssetScanUrl({
    qrCode: asset.qrCode,
    mode: qrMode,
  });
  const displayedHistoryItems = useMemo(() => {
    if (verifyState !== "verified") {
      return historyItems;
    }

    return [
      {
        title: "Self-verified by employee",
        status: "good",
        owner: "Employee Portal",
        location: asset.storageName,
        date: new Date().toISOString(),
      },
      ...historyItems,
    ];
  }, [asset.storageName, historyItems, verifyState]);

  async function handleVerify() {
    if (verifyState !== "idle") return;

    setVerifyState("verifying");
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    setVerifyState("verified");
  }

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
        <h2 className="text-[18px] font-semibold text-[#101828]">{asset.assetName}</h2>
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

        <div className="mt-4 grid grid-cols-3 rounded-[12px] bg-[#f8fafc] p-1">
          {[
            { value: "details", label: "Details" },
            { value: "history", label: "History" },
            { value: "assets", label: "Your assets" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange(tab.value as MobileTab)}
              className={`rounded-[10px] px-3 py-2 text-[13px] font-medium transition ${
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
              <MobileInfoRow label="Holder" value="Sarantsetseg Baatar" />
              <MobileInfoRow label="Department" value={asset.department || "Engineering"} />
              <MobileInfoRow label="Contact" value="sarah.baatar@company.com" />
            </MobileSection>

            <MobileSection
              eyebrow="Location"
              subtitle="Most recently recorded place"
            >
              <div className="rounded-[14px] border border-[#e4e7ec] bg-white px-4 py-3">
                <p className="text-[14px] font-medium text-[#101828]">{asset.storageName}</p>
              </div>
            </MobileSection>

            <MobileSection
              eyebrow="Scan QR"
              subtitle="Switch between employee and audit scan flows"
            >
              <div className="rounded-[16px] border border-[#dbeafe] bg-[#f8fbff] p-4">
                <QrModeSwitch value={qrMode} onChange={onQrModeChange} />
                <div className="flex flex-col items-center gap-3">
                  <BrandedQrCode
                    value={qrLink}
                    title={asset.assetCode}
                    size={132}
                    className="w-full max-w-[210px] shrink-0 p-2 shadow-none"
                    showValue={false}
                  />
                  {qrMode === "employee" ? (
                    <div className="w-full rounded-[12px] border border-[#e2e8f0] bg-white px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8fa0ba]">
                          Employee QR Link
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
                  ) : (
                    <p className="text-center text-[12px] font-medium text-[#64748b]">
                      Scan to audit and verify this asset.
                    </p>
                  )}
                </div>
              </div>
            </MobileSection>
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
                className="text-[12px] font-medium text-[#667085]"
              >
                See all
              </button>
            </div>
            <div className="space-y-4">
              {displayedHistoryItems.map((entry, index) => (
                <div key={`${entry.title}-${index}`} className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${historyToneClass(entry.title)}`}>
                    <span className="text-[15px] text-white">{historyIcon(entry.title)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-medium text-[#101828]">{entry.title}</p>
                        <p className="text-[13px] text-[#667085]">
                          {entry.owner} · {entry.location}
                        </p>
                      </div>
                      <span className="shrink-0 text-[12px] text-[#667085]">{entry.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "assets" ? (
          <div className="mt-5 space-y-5">
            <MobileSection
              eyebrow="Your Assets"
              subtitle="Open this list to see all assets currently assigned under your name."
            >
              <div className="grid grid-cols-3 gap-3">
                {relatedAssets.slice(0, 3).map((relatedAsset) => (
                  <div
                    key={relatedAsset.id}
                    className="overflow-hidden rounded-[16px] border border-[#dbe7f3] bg-white"
                  >
                    <div className="flex h-[88px] items-center justify-center bg-[#f8fbff] p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={buildAssetIllustration(relatedAsset)}
                        alt={relatedAsset.assetName}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="px-3 py-3">
                      <p className="truncate text-[12px] font-medium text-[#101828]">
                        {relatedAsset.assetName}
                      </p>
                      <p className="mt-1 text-[10px] text-[#98a2b3]">
                        {relatedAsset.assetCode}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </MobileSection>

            <MobileSection
              eyebrow="Higher-up Access"
              subtitle="Asset remains visible to management, IT, and audit roles."
            >
              <div className="rounded-[14px] border border-[#e4e7ec] bg-white px-4 py-3">
                <p className="text-[14px] text-[#344054]">
                  This registered asset is shared with storage operations, IT Admin, and audit workflows.
                </p>
              </div>
            </MobileSection>
          </div>
        ) : null}

        <div className="mt-6 border-t border-[#eef2f6] pt-4">
          <button
            type="button"
            onClick={() => void handleVerify()}
            disabled={verifyState !== "idle"}
            className={`flex h-12 w-full items-center justify-center rounded-[14px] text-[14px] font-semibold transition ${
              verifyState === "verified"
                ? "bg-[#ecfff4] text-[#12a150]"
                : "bg-[#255df0] text-white"
            } disabled:cursor-default disabled:opacity-100`}
          >
            {verifyState === "verifying"
              ? "Verifying possession..."
              : verifyState === "verified"
                ? "Possession Verified"
                : "Verify Possession"}
          </button>
          <p className="mt-2 text-center text-[12px] text-[#667085]">
            {verifyState === "verified"
              ? "Your possession confirmation has been recorded in the asset history."
              : "Confirm that this asset is currently in your possession. Assignment acknowledgment is handled separately from the emailed sign link."}
          </p>
        </div>
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
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#eef2f6] py-3 last:border-b-0">
      <span className="text-[13px] text-[#667085]">{label}</span>
      <span className="max-w-[62%] text-right text-[14px] font-medium leading-5 text-[#101828]">
        {value}
      </span>
    </div>
  );
}

function DisplayField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-semibold text-[#111827]">{label}</p>
      <div className="flex h-12 items-center rounded-[12px] border border-[#d0d5dd] bg-white px-4 text-[14px] text-[#344054]">
        {value}
      </div>
    </div>
  );
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
  mode,
  onModeChange,
}: {
  asset: StorageAssetDto;
  mode: RegisteredQrMode;
  onModeChange: (value: RegisteredQrMode) => void;
}) {
  const qrLink = buildRegisteredAssetScanUrl({
    qrCode: asset.qrCode,
    mode,
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <QrModeSwitch value={mode} onChange={onModeChange} />
      <BrandedQrCode
        value={qrLink}
        title={asset.assetCode}
        size={132}
        className="w-full max-w-[210px] shrink-0 p-2 shadow-none"
        showValue={false}
      />
      {mode === "employee" ? (
        <div className="w-full rounded-[12px] border border-[#e2e8f0] bg-[#f8fbff] px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8fa0ba]">
              Employee QR Link
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
          className={`rounded-[10px] px-3 py-2 text-[12px] font-semibold transition ${
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
          <p className="text-[16px] font-semibold text-[#111827]">{entry.title}</p>
          <p className="mt-1 text-[12px] text-[#8b99ac]">{entry.date}</p>
        </div>
        <StorageConditionBadge value={entry.status} />
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
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "AS";
}

function buildAssetIllustration(asset: StorageAssetDto) {
  const type = `${asset.assetName} ${asset.itemType} ${asset.category}`.toLowerCase();
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

function buildHistoryEntries(asset: StorageAssetDto): HistoryEntry[] {
  return [
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

function buildFallbackAssignedAssets(asset: StorageAssetDto) {
  return [
    {
      ...asset,
      id: `${asset.id}-assigned-1`,
      assetCode: "MSE-2026-012",
      assetName: "Magic Mouse",
      itemType: "Mouse",
    },
    {
      ...asset,
      id: `${asset.id}-assigned-2`,
      assetCode: "MON-2026-008",
      assetName: "Dell Monitor 27\"",
      itemType: "Monitor",
    },
    {
      ...asset,
      id: `${asset.id}-assigned-3`,
      assetCode: "KYB-2026-045",
      assetName: "Magic Keyboard",
      itemType: "Keyboard",
    },
  ];
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
  return value;
}

function humanizeStatusLabel(value: string) {
  if (value === "available") return "Available";
  if (value === "assigned") return "Assigned";
  if (value === "inRepair") return "In Repair";
  if (value === "pendingDisposal") return "Pending Disposal";
  if (value === "pendingRetrieval") return "Pending Retrieval";
  return value;
}

function parseCurrency(value: string) {
  if (value === "USD" || value === "EUR" || value === "MNT") {
    return value;
  }

  return "MNT";
}

function normalizeStorageStatus(value: string) {
  if (value === "inStorage" || value === "received" || value === "pendingAssignment") {
    return "available";
  }

  return value;
}
