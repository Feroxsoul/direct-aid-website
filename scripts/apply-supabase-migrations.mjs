#!/usr/bin/env node
/**
 * Applies supabase/apply-existing-db.sql to the remote Supabase database.
 *
 * Set ONE of these in .env.local:
 *   DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
 *   SUPABASE_DB_PASSWORD=your-database-password
 *
 * Or set SUPABASE_ACCESS_TOKEN (from `npx supabase login`) to use the Management API.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(envPath);

const sqlPath = resolve(root, "supabase", "apply-existing-db.sql");
const sql = readFileSync(sqlPath, "utf8");

function getProjectRef() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
  return match?.[1] ?? "";
}

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = getProjectRef();
  if (password && ref) {
    const encoded = encodeURIComponent(password);
    return `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`;
  }

  return null;
}

async function runViaManagementApi() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const ref = getProjectRef();
  if (!token || !ref) return false;

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    },
  );

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Management API failed (${response.status}): ${body}`);
  }

  console.log("✓ Migration applied via Supabase Management API");
  if (body && body !== "[]") console.log(body);
  return true;
}

async function runViaPostgres() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return false;

  const { default: pg } = await import("pg");
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await client.query(sql);
    console.log("✓ Migration applied via direct Postgres connection");
  } finally {
    await client.end();
  }
  return true;
}

async function main() {
  console.log("Applying enterprise admin migration to Supabase…");
  console.log(`Project: ${getProjectRef() || "(unknown)"}`);

  if (await runViaManagementApi()) return;
  if (await runViaPostgres()) return;

  console.error(`
Could not connect to Supabase. Add ONE of these to .env.local:

  SUPABASE_DB_PASSWORD=your-password-from-supabase-dashboard
  DATABASE_URL=postgresql://postgres:PASSWORD@db.${getProjectRef() || "PROJECT_REF"}.supabase.co:5432/postgres
  SUPABASE_ACCESS_TOKEN=from-npx-supabase-login

Then run: npm run db:migrate
`);
  process.exit(1);
}

main().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
