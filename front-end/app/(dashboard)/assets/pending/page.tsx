import { notFound } from "next/navigation";
import { RoleSidebar } from "@/app/_components/RoleSidebar";
import { PendingAssetPreviewPage } from "@/app/_components/role/PendingAssetPreviewPage";
import { isAppRole } from "@/app/_lib/roles";

type PendingAssetRouteProps = {
  searchParams?: Promise<{
    role?: string;
    assetName?: string;
    serialNumber?: string;
    token?: string;
  }>;
};

export default async function PendingAssetRoute({
  searchParams,
}: PendingAssetRouteProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedRole = resolvedSearchParams?.role;
  const role = requestedRole && isAppRole(requestedRole) ? requestedRole : "inventoryHead";
  const assetName = resolvedSearchParams?.assetName ?? "";
  const serialNumber = resolvedSearchParams?.serialNumber ?? "";
  const token = resolvedSearchParams?.token ?? "";

  if (!assetName || !serialNumber || !token) {
    notFound();
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#efefef] text-slate-900">
      <section className="flex min-h-screen overflow-x-hidden">
        <div className="hidden lg:block">
          <RoleSidebar role={role} currentSection="storage" />
        </div>
        <PendingAssetPreviewPage
          role={role}
          assetName={assetName}
          serialNumber={serialNumber}
          token={token}
        />
      </section>
    </main>
  );
}
