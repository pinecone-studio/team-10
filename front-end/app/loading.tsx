import { FrontendLoading } from "./_components/shared/FrontendLoading";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#dcebfb_0%,#eff7ff_58%,#ffffff_100%)] px-6 py-10">
      <div className="mx-auto max-w-[1320px]">
        <FrontendLoading
          variant="workspace"
          title="Loading workspace"
          description="Preparing the latest frontend state while backend data reconnects."
        />
      </div>
    </main>
  );
}
