import { notFound } from "next/navigation";
import { RoleSidebar } from "@/app/_components/RoleSidebar";
import { StorageAssetDetailPage } from "@/app/_components/role/StorageAssetDetailPage";
import { isAppRole } from "@/app/_lib/roles";

type AssetDetailRouteProps = {
  params: Promise<{ assetId: string }>;
  searchParams?: Promise<{
    role?: string;
    orderId?: string;
    requestNumber?: string;
    department?: string;
    storageLocation?: string;
    ownerName?: string;
    ownerRole?: string;
  }>;
};

export default async function AssetDetailRoute({
  params,
  searchParams,
}: AssetDetailRouteProps) {
  const { assetId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedRole = resolvedSearchParams?.role;
  const role = requestedRole && isAppRole(requestedRole) ? requestedRole : "inventoryHead";

  if (!assetId) {
    notFound();
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#efefef] text-slate-900">
      <section className="flex min-h-screen overflow-x-hidden">
        <div className="hidden lg:block">
          <RoleSidebar role={role} currentSection="storage" />
        </div>
        <StorageAssetDetailPage
          assetId={assetId}
          role={role}
          qrContext={{
            orderId: resolvedSearchParams?.orderId,
            requestNumber: resolvedSearchParams?.requestNumber,
            department: resolvedSearchParams?.department,
            storageLocation: resolvedSearchParams?.storageLocation,
            ownerName: resolvedSearchParams?.ownerName,
            ownerRole: resolvedSearchParams?.ownerRole,
          }}
        />
      </section>
    </main>
  );
}
