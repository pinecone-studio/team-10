function getConfiguredAppOrigin() {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    null;

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

export function getQrAppBaseUrl(origin?: string) {
  return (origin?.replace(/\/$/, "") || getConfiguredAppOrigin());
}

export function buildRegisteredAssetScanUrl(input: {
  origin?: string;
  qrCode: string;
  role: string;
}) {
  const baseOrigin = getQrAppBaseUrl(input.origin);
  return `${baseOrigin}/scan?qr=${encodeURIComponent(input.qrCode)}&role=${encodeURIComponent(input.role)}`;
}

export function buildPendingAssetScanUrl(input: {
  origin?: string;
  token: string;
  assetName: string;
  serialNumber: string;
  role: string;
}) {
  const baseOrigin = getQrAppBaseUrl(input.origin);
  return `${baseOrigin}/scan?state=pending&qr=${encodeURIComponent(input.token)}&assetName=${encodeURIComponent(input.assetName)}&serialNumber=${encodeURIComponent(input.serialNumber)}&role=${encodeURIComponent(input.role)}`;
}
