import { RoleSidebar } from "./_components/RoleSidebar";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#eef3f8] p-4 text-slate-900">
      <section className="flex min-h-[calc(100vh-32px)] gap-4">
        <RoleSidebar />
        <div className="flex-1 rounded-[28px] border border-slate-200/70 bg-white/65" />
      </section>
    </main>
  );
}
