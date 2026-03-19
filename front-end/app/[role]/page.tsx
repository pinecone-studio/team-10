import { notFound } from "next/navigation";
import { RoleSidebar } from "../_components/RoleSidebar";
import { RoleWorkspace } from "../_components/RoleWorkspace";
import { roleNavSections, type SectionKey } from "../_lib/navigation";
import { getRoleMeta, isAppRole } from "../_lib/roles";

type RolePageProps = {
  params: Promise<{ role: string }>;
  searchParams?: Promise<{ section?: string }>;
};

export default async function RolePage({ params, searchParams }: RolePageProps) {
  const { role } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  if (!isAppRole(role)) {
    notFound();
  }

  const roleMeta = getRoleMeta(role);
  const defaultSection = roleNavSections[role][0] ?? "order";
  const requestedSection = resolvedSearchParams?.section;
  const section =
    requestedSection && roleNavSections[role].includes(requestedSection as SectionKey)
      ? (requestedSection as SectionKey)
      : defaultSection;

  return (
    <main className="h-screen overflow-hidden bg-[#eef5fb] text-slate-900">
      <section className="flex h-full items-stretch overflow-hidden">
        <RoleSidebar role={role} currentSection={section} />
        <div className="min-w-0 flex-1 overflow-y-auto bg-[#eef5fb]">
          <RoleWorkspace role={role} roleLabel={roleMeta.label} section={section} />
        </div>
      </section>
    </main>
  );
}
