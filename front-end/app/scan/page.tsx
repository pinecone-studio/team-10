import { notFound, redirect } from "next/navigation";
import { QrScanResolverPage } from "@/app/_components/role/QrScanResolverPage";
import { isAppRole } from "@/app/_lib/roles";

type ScanRouteProps = {
  searchParams?: Promise<{
    state?: string;
    qr?: string;
    assetName?: string;
    serialNumber?: string;
    mode?: string;
    role?: string;
    orderId?: string;
    requestNumber?: string;
    department?: string;
    storageLocation?: string;
    ownerName?: string;
    ownerRole?: string;
  }>;
};

export default async function ScanRoute({ searchParams }: ScanRouteProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedRole = resolvedSearchParams?.role;
  const mode = resolvedSearchParams?.mode?.trim() ?? "";
  const role =
    requestedRole && isAppRole(requestedRole)
      ? requestedRole
      : mode === "employee"
        ? "employee"
        : "inventoryHead";
  const qr = resolvedSearchParams?.qr?.trim() ?? "";
  const state = resolvedSearchParams?.state?.trim() ?? "";
  const assetName = resolvedSearchParams?.assetName?.trim() ?? "";
  const serialNumber = resolvedSearchParams?.serialNumber?.trim() ?? "";
  const orderId = resolvedSearchParams?.orderId?.trim() ?? "";
  const requestNumber = resolvedSearchParams?.requestNumber?.trim() ?? "";
  const department = resolvedSearchParams?.department?.trim() ?? "";
  const storageLocation = resolvedSearchParams?.storageLocation?.trim() ?? "";
  const ownerName = resolvedSearchParams?.ownerName?.trim() ?? "";
  const ownerRole = resolvedSearchParams?.ownerRole?.trim() ?? "";

  if (!qr) {
    notFound();
  }

  if (state === "pending") {
    if (!assetName || !serialNumber) {
      notFound();
    }

    redirect(
      `/assets/pending?role=${encodeURIComponent(role)}&assetName=${encodeURIComponent(assetName)}&serialNumber=${encodeURIComponent(serialNumber)}&token=${encodeURIComponent(qr)}`,
    );
  }

  return (
    <QrScanResolverPage
      qrCode={qr}
      role={role}
      mode={mode}
      orderId={orderId}
      requestNumber={requestNumber}
      department={department}
      storageLocation={storageLocation}
      ownerName={ownerName}
      ownerRole={ownerRole}
    />
  );
}
