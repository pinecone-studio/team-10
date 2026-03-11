import { notFound } from "next/navigation";
import { RoleSidebar } from "../_components/RoleSidebar";
import { isAppRole } from "../_lib/roles";

type RolePageProps = {
  params: Promise<{ role: string }>;
};

export default async function RolePage({ params }: RolePageProps) {
  const { role } = await params;

  if (!isAppRole(role)) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#eef3f8] p-4 text-slate-900">
      <section className="flex min-h-[calc(100vh-32px)] gap-4">
        <RoleSidebar role={role} />
        <div className="flex-1 rounded-[28px] border border-slate-200/70 bg-white/65" />
      </section>
    </main>
  );
}
