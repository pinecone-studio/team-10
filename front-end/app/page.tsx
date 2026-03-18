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
    <main className="min-h-screen overflow-x-hidden bg-[#eef5fb] text-slate-900">
      <section className="flex min-h-screen overflow-x-hidden">
        <RoleSidebar role={role} currentSection="home" />
        {role === "employee" ? <EmployeeHomeDashboard /> : <HomeDashboard />}
      </section>
    </main>
  );
}
