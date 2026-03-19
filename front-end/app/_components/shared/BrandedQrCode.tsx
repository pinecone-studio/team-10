"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function BrandedQrCode({
  value,
  title,
  size = 168,
  className = "",
  showValue = true,
}: {
  value: string;
  title?: string;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const badgeWidth = Math.max(30, Math.round(size * 0.24));
  const badgeHeight = Math.max(14, Math.round(size * 0.1));
  const badgeFontSize = Math.max(7, Math.round(size * 0.052));

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const nextDataUrl = await QRCode.toDataURL(value, {
          errorCorrectionLevel: "H",
          margin: 1,
          width: size,
          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
        });

        if (isMounted) {
          setDataUrl(nextDataUrl);
        }
      } catch {
        if (isMounted) {
          setDataUrl(null);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [size, value]);

  return (
    <div className={`rounded-[16px] bg-white p-3 shadow-[0_12px_24px_rgba(148,163,184,0.12)] ${className}`}>
      <div
        className="relative mx-auto overflow-hidden rounded-[12px] bg-[#eef4ff]"
        style={{ width: size, height: size }}
      >
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt={title ? `${title} QR code` : "QR code"}
            width={size}
            height={size}
            className="block h-full w-full"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] text-[#64748b]">
            QR unavailable
          </div>
        )}
        <div
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#d7e4f2] bg-white/98 shadow-[0_4px_12px_rgba(15,23,42,0.08)]"
          style={{ width: badgeWidth, height: badgeHeight }}
        >
          <span
            className="font-black leading-none text-[#1d4ed8]"
            style={{ fontSize: badgeFontSize, letterSpacing: "0.02em" }}
          >
            AMS
          </span>
        </div>
      </div>
      {title ? (
        <p className="mt-2 truncate text-center text-[12px] font-semibold text-[#111827]">
          {title}
        </p>
      ) : null}
      {showValue ? (
        <p className="mt-1 truncate text-center text-[11px] text-[#64748b]">{value}</p>
      ) : null}
    </div>
  );
}
