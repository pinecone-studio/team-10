import { HomeDashboard } from "./_components/home/HomeDashboard";
import { EmployeeHomeDashboard } from "./_components/home/EmployeeHomeDashboard";
import { RoleSidebar } from "./_components/RoleSidebar";
import { isAppRole } from "./_lib/roles";

type HomePageProps = {
  searchParams?: Promise<{ role?: string }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedRole = resolvedSearchParams?.role;
  const role = requestedRole && isAppRole(requestedRole) ? requestedRole : undefined;

  return (
    <main className="h-screen overflow-hidden bg-[#eef5fb] text-slate-900">
      <section className="flex h-full items-stretch overflow-hidden">
        <RoleSidebar role={role} currentSection="home" />
        <div className="min-w-0 flex-1 overflow-y-auto">
          {role === "employee" ? <EmployeeHomeDashboard /> : <HomeDashboard />}
        </div>
      </section>
    </main>
  );
}
