import { HomeDashboard } from "./_components/home/HomeDashboard";
import { RoleSidebar } from "./_components/RoleSidebar";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#eef5fb] text-slate-900">
      <section className="flex min-h-screen">
        <RoleSidebar />
        <HomeDashboard />
      </section>
    </main>
  );
}
