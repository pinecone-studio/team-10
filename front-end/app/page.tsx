import { RoleSwitcher } from "./_components/RoleSwitcher";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#e7edf4] text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(125,211,252,0.55),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.18),_transparent_30%)]" />
      <section className="relative flex min-h-screen items-end px-6 py-6 md:px-10 md:py-10">
        <div className="w-full max-w-sm rounded-[2rem] border border-white/60 bg-white/75 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div>
            <RoleSwitcher />
          </div>
        </div>
      </section>
    </main>
  );
}
