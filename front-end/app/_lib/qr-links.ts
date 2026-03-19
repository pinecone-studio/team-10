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
  mode?: "employee" | "audit";
  role?: string;
  orderId?: string;
  requestNumber?: string;
  department?: string;
  storageLocation?: string;
  ownerName?: string;
  ownerRole?: string;
}) {
  const baseOrigin = getQrAppBaseUrl(input.origin);
  const searchParams = new URLSearchParams({
    qr: input.qrCode,
  });

  if (input.mode) {
    searchParams.set("mode", input.mode);
  }

  if (input.role) {
    searchParams.set("role", input.role);
  }

  if (input.orderId) {
    searchParams.set("orderId", input.orderId);
  }

  if (input.requestNumber) {
    searchParams.set("requestNumber", input.requestNumber);
  }

  if (input.department) {
    searchParams.set("department", input.department);
  }

  if (input.storageLocation) {
    searchParams.set("storageLocation", input.storageLocation);
  }

  if (input.ownerName) {
    searchParams.set("ownerName", input.ownerName);
  }

  if (input.ownerRole) {
    searchParams.set("ownerRole", input.ownerRole);
  }

  return `${baseOrigin}/scan?${searchParams.toString()}`;
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
