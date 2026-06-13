import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEPLOY_VERSION = "impact-admin-v2";

export async function GET() {
  return NextResponse.json({
    version: DEPLOY_VERSION,
    layout: "impact-admin",
    commit: process.env.RAILWAY_GIT_COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
}
