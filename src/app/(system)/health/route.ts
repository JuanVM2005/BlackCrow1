import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "black-crow-web",
      env: process.env.NODE_ENV ?? "unknown",
      timestamp: new Date().toISOString(),
      version:
        process.env.VERCEL_GIT_COMMIT_SHA ??
        process.env.GIT_COMMIT_SHA ??
        "local",
    },
    {
      headers: {
        // Salud nunca debe cachearse
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    },
  );
}
