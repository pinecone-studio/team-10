import { NextResponse } from "next/server";
import { getDatabaseResolutionInfo } from "@/lib/context";

export async function GET() {
  const database = await getDatabaseResolutionInfo();

  return NextResponse.json({
    ok: true,
    service: "team10-backend",
    timestamp: new Date().toISOString(),
    database,
  });
}
