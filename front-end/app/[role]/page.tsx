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
    <main className="min-h-screen overflow-x-hidden bg-[#efefef] text-slate-900">
      <section className="flex min-h-screen overflow-x-hidden">
        <RoleSidebar role={role} currentSection={section} />
        <RoleWorkspace role={role} roleLabel={roleMeta.label} section={section} />
      </section>
    </main>
  );
}
