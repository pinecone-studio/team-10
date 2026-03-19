"use client";

import Link from "next/link";
import { WorkspaceShell } from "../shared/WorkspacePrimitives";
import { BrandedQrCode } from "../shared/BrandedQrCode";
import { buildPendingAssetScanUrl } from "@/app/_lib/qr-links";

export function PendingAssetPreviewPage({
  role,
  assetName,
  serialNumber,
  token,
}: {
  role: string;
  assetName: string;
  serialNumber: string;
  token: string;
}) {
  const scanUrl = buildPendingAssetScanUrl({
    token,
    assetName,
    serialNumber,
    role,
  });

  return (
    <WorkspaceShell
      title="Pending Asset Preview"
      subtitle="This QR was recognized, but the asset has not been fully registered into storage yet."
      backgroundClassName="bg-[linear-gradient(180deg,#dcebfb_0%,#eff7ff_58%,#ffffff_100%)]"
      contentWidthClassName="max-w-[440px]"
    >
      <Link
        href={`/${role}?section=storage`}
        className="inline-flex w-fit items-center gap-2 text-[14px] font-medium text-[#334155]"
      >
        <span aria-hidden="true">{"<-"}</span>
        <span>Back to Storage Assets</span>
      </Link>

      <div className="space-y-5">
        <section className="rounded-[24px] border border-[#d7e4f2] bg-white p-5 shadow-[0_20px_48px_rgba(148,163,184,0.16)]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#7c93b2]">
            Intake QR
          </p>
          <div className="mt-4 flex justify-center">
            <BrandedQrCode value={scanUrl} title={serialNumber} size={220} showValue={false} />
          </div>
          <div className="mt-4 rounded-[16px] border border-[#dbe7f3] bg-[#f8fbff] px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8fa0ba]">
              QR Link
            </p>
            <p className="mt-2 break-all text-[12px] leading-6 text-[#475569]">
              {scanUrl}
            </p>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#d7e4f2] bg-white p-6 shadow-[0_20px_48px_rgba(148,163,184,0.16)]">
          <span className="inline-flex rounded-full border border-[#bfdbfe] bg-[#eef4ff] px-3 py-1 text-[12px] font-semibold text-[#2563eb]">
            Not Registered Yet
          </span>
          <h2 className="mt-4 text-[28px] font-semibold text-[#0f172a]">
            {assetName}
          </h2>
          <p className="mt-3 max-w-[640px] text-[15px] leading-7 text-[#52637a]">
            This QR belongs to an item currently in the receive flow. The token is valid, but the physical asset has not been finalized into the storage registry yet.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <InfoCard label="Asset Name" value={assetName} />
            <InfoCard label="Serial Number" value={serialNumber} />
            <InfoCard label="Current State" value="Pending registration" />
            <InfoCard label="Next Step" value="Complete receive intake" />
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[#e2e8f0] bg-[#fbfdff] px-4 py-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8fa0ba]">
        {label}
      </p>
      <p className="mt-2 break-words text-[15px] font-medium text-[#0f172a]">
        {value}
      </p>
    </div>
  );
}
