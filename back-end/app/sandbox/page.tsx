export default function SandboxPage() {
  return (
    <main style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      <iframe
        title="Apollo Sandbox"
        src="/api/graphql"
        style={{
          border: "0",
          height: "100%",
          width: "100%",
        }}
      />
    </main>
  );
}
