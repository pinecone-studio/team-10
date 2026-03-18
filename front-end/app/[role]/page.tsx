import { notFound } from "next/navigation";
import { RoleSessionProvider } from "../_components/RoleSessionProvider";
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
<<<<<<< 101-qr-back-end
    <main className="min-h-screen bg-[#efefef] text-slate-900">
      <RoleSessionProvider role={role}>
        <section className="flex min-h-screen">
          <RoleSidebar role={role} currentSection={section} />
          <RoleWorkspace role={role} roleLabel={roleMeta.label} section={section} />
        </section>
      </RoleSessionProvider>
=======
    <main className="min-h-screen overflow-x-hidden bg-[#efefef] text-slate-900">
      <section className="flex min-h-screen overflow-x-hidden">
        <RoleSidebar role={role} currentSection={section} />
        <RoleWorkspace role={role} roleLabel={roleMeta.label} section={section} />
      </section>
>>>>>>> main
    </main>
  );
}
