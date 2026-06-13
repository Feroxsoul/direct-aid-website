import { NextResponse } from "next/server";

import { APP_BUILD_NAME, APP_DEVELOPER, APP_VERSION_LABEL } from "@/lib/app-version";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    version: APP_VERSION_LABEL,
    build: APP_BUILD_NAME,
    developer: APP_DEVELOPER,
    commit: process.env.RAILWAY_GIT_COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
}
