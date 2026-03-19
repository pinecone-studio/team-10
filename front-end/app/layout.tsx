import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { GraphqlProvider } from "./providers/GraphqlProvider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

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
      <body className={`${geist.variable} antialiased`}>
        <GraphqlProvider>{children}</GraphqlProvider>
      </body>
    </html>
  );
}
