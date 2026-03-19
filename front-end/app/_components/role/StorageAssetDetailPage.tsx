"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  downloadAssetLabelsPdfRequest,
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
  StorageStatusBadge,
} from "./storagePresentation";

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

  return (
    <WorkspaceShell
      title="Asset Detail"
      subtitle="Review storage data and update lifecycle status."
      backgroundClassName="bg-[linear-gradient(180deg,#dcebfb_0%,#eff7ff_58%,#ffffff_100%)]"
    >
      <Link
        href={`/${role}?section=storage`}
        className="mb-4 inline-flex items-center gap-2 text-[14px] font-medium text-[#334155]"
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
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_420px]">
          <section className="overflow-hidden rounded-[24px] border border-[#d7e4f2] bg-white shadow-[0_20px_48px_rgba(148,163,184,0.16)]">
            <div className="border-b border-[#e6edf5] bg-[linear-gradient(180deg,#eaf3ff_0%,#f7fbff_100%)] px-6 py-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#7c93b2]">
                {asset.assetCode}
              </p>
              <h2 className="mt-2 text-[28px] font-semibold text-[#0f172a]">
                {asset.assetName}
              </h2>
              <p className="mt-2 max-w-[620px] text-[14px] leading-6 text-[#52637a]">
                {asset.receiveNote ||
                  "This asset is now tracked in storage and can be audited, assigned, repaired, or prepared for retrieval."}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <StorageConditionBadge value={asset.conditionStatus} />
                <StorageStatusBadge value={normalizeStorageStatus(asset.assetStatus)} />
              </div>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <InfoCard label="Asset ID" value={asset.assetCode} />
              <InfoCard label="Database ID" value={asset.id} />
              <InfoCard label="Asset Name" value={asset.assetName} />
              <InfoCard label="Category" value={asset.category} />
              <InfoCard label="Location" value={asset.storageName} />
              <InfoCard label="Department" value={asset.department || "-"} />
              <InfoCard label="Request Number" value={asset.requestNumber} />
              <InfoCard label="Request Date" value={formatDisplayDate(asset.requestDate)} />
              <InfoCard label="Received At" value={formatDisplayDate(asset.receivedAt)} />
              <InfoCard label="Requester" value={asset.requester || "-"} />
              <InfoCard label="Serial Number" value={asset.serialNumber || "-"} />
              <InfoCard label="Unit Cost" value={unitCostLabel} />
              <InfoCard label="QR Code" value={asset.qrCode} className="md:col-span-2" />
            </div>
          </section>

          <section className="space-y-5">
            <div className="rounded-[24px] border border-[#d7e4f2] bg-white p-5 shadow-[0_20px_48px_rgba(148,163,184,0.16)]">
              <div className="grid gap-4">
                <StorageSelectMenu
                  label="Status"
                  value={normalizeStorageStatus(asset.assetStatus)}
                  options={STORAGE_STATUS_OPTIONS}
                  disabled={isSaving}
                  onChange={(assetStatus) => void handleAssetUpdate({ assetStatus })}
                />
                <StorageSelectMenu
                  label="Condition"
                  value={asset.conditionStatus}
                  options={STORAGE_CONDITION_OPTIONS}
                  disabled={isSaving}
                  onChange={(conditionStatus) =>
                    void handleAssetUpdate({ conditionStatus })
                  }
                />
              </div>
              <p className="mt-4 text-[13px] leading-6 text-[#64748b]">
                Dropdown options follow the Figma badges and save through the backend mutation.
              </p>
              {errorMessage ? (
                <p className="mt-3 text-[13px] font-medium text-[#dc2626]">
                  {errorMessage}
                </p>
              ) : null}
            </div>

            <div className="rounded-[24px] border border-[#d7e4f2] bg-white p-5 shadow-[0_20px_48px_rgba(148,163,184,0.16)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#7c93b2]">
                  QR Snapshot
                </p>
                <button
                  type="button"
                  onClick={() => void handleDownloadLabels()}
                  disabled={isDownloadingPdf}
                  className="fx-submit-button h-10 px-4 text-[12px] font-medium disabled:opacity-60"
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
                      <path d="M12 3v12" />
                      <path d="m7 10 5 5 5-5" />
                      <path d="M5 21h14" />
                    </svg>
                  </span>
                  <span className="fx-submit-label">
                    {isDownloadingPdf ? "Preparing..." : "Print Label PDF"}
                  </span>
                </button>
              </div>
              <div className="mt-4 rounded-[18px] border border-[#e2e8f0] bg-[#f8fbff] p-4">
                <QrCard title={asset.assetCode} value={asset.qrCode} role={role} />
              </div>
            </div>
          </section>
        </div>
      )}
    </WorkspaceShell>
  );
}

function InfoCard({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-[16px] border border-[#e2e8f0] bg-[#fbfdff] px-4 py-4 ${className}`}>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8fa0ba]">
        {label}
      </p>
      <p className="mt-2 break-words text-[15px] font-medium text-[#0f172a]">
        {value}
      </p>
    </div>
  );
}

function QrCard({
  title,
  value,
  role,
}: {
  title: string;
  value: string;
  role: string;
}) {
  const scanUrl = buildRegisteredAssetScanUrl({
    qrCode: value,
    role,
  });

  return (
    <BrandedQrCode value={scanUrl} title={title} size={176} />
  );
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
