"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchStorageAssetDetailRequest } from "@/app/(dashboard)/_graphql/storage/storage-api";

export function QrScanResolverPage({
  qrCode,
  role,
}: {
  qrCode: string;
  role: string;
}) {
  const [status, setStatus] = useState<"loading" | "missing" | "error">("loading");

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const asset = await fetchStorageAssetDetailRequest({ qrCode });
        if (!isMounted) {
          return;
        }

        if (!asset) {
          setStatus("missing");
          return;
        }

        window.location.replace(`/assets/${asset.id}?role=${encodeURIComponent(role)}`);
      } catch {
        if (isMounted) {
          setStatus("error");
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [qrCode, role]);

  const message =
    status === "missing"
      ? "This QR link does not match a registered asset."
      : status === "error"
        ? "We could not resolve this QR link right now."
        : "Opening asset detail...";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#dcebfb_0%,#eff7ff_58%,#ffffff_100%)] px-6 py-10 text-slate-900">
      <section className="w-full max-w-[420px] rounded-[24px] border border-[#d7e4f2] bg-white p-6 shadow-[0_20px_48px_rgba(148,163,184,0.16)]">
        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#7c93b2]">
          QR Scan
        </p>
        <h1 className="mt-3 text-[28px] font-semibold text-[#0f172a]">
          {status === "loading" ? "Opening Asset" : "QR Link Result"}
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-[#52637a]">{message}</p>
        {status !== "loading" ? (
          <Link
            href={`/${role}?section=storage`}
            className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium text-[#2563eb]"
          >
            <span aria-hidden="true">{"<-"}</span>
            <span>Back to Storage Assets</span>
          </Link>
        ) : null}
      </section>
    </main>
  );
}
