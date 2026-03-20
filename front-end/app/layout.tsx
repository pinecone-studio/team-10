import type { Metadata } from "next";
import "./globals.css";
import { GlobalBusyOverlay } from "./_components/shared/GlobalBusyOverlay";
import { GraphqlProvider } from "./providers/GraphqlProvider";

export const metadata: Metadata = {
  title: "Team 10 Asset Frontend",
  description: "Temporary role-based entry for frontend development",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <GraphqlProvider>{children}</GraphqlProvider>
        <GlobalBusyOverlay />
      </body>
    </html>
  );
}
