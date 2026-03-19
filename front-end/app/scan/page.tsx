import { notFound, redirect } from "next/navigation";
import { QrScanResolverPage } from "@/app/_components/role/QrScanResolverPage";
import { isAppRole } from "@/app/_lib/roles";

type ScanRouteProps = {
  searchParams?: Promise<{
    state?: string;
    qr?: string;
    assetName?: string;
    serialNumber?: string;
    role?: string;
  }>;
};

export default async function ScanRoute({ searchParams }: ScanRouteProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedRole = resolvedSearchParams?.role;
  const role = requestedRole && isAppRole(requestedRole) ? requestedRole : "inventoryHead";
  const qr = resolvedSearchParams?.qr?.trim() ?? "";
  const state = resolvedSearchParams?.state?.trim() ?? "";
  const assetName = resolvedSearchParams?.assetName?.trim() ?? "";
  const serialNumber = resolvedSearchParams?.serialNumber?.trim() ?? "";

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

  return <QrScanResolverPage qrCode={qr} role={role} />;
}
