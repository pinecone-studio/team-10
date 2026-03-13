import { RoleSidebar } from "./_components/RoleSidebar";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#efefef] text-slate-900">
      <section className="flex min-h-screen">
        <RoleSidebar /> hello
        <div className="flex-1 bg-[#efefef]" />
      </section>
    </main>
  );
}
