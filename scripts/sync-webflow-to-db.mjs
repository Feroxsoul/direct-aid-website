/**
 * Upsert scraped Webflow catalog into Supabase projects table.
 * Run: node --env-file=.env.local scripts/sync-webflow-to-db.mjs
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CATALOG = join(ROOT, "src/data/webflow-projects.json");

const url = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ""
).replace(/\/+$/, "");

const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";

if (!url || !serviceKey) {
  console.error(
    "Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (set in .env.local or Railway).",
  );
  process.exit(1);
}

function normalizeCdnImageUrl(raw) {
  if (!raw?.trim()) return "";
  try {
    const parsed = new URL(raw.trim());
    if (!parsed.hostname.includes("website-files.com")) return raw.trim();
    const segments = parsed.pathname.split("/");
    const file = segments.pop() ?? "";
    const decoded = decodeURIComponent(file);
    const encoded = decoded
      .split("")
      .map((char) => (/[a-zA-Z0-9._~-]/.test(char) ? char : encodeURIComponent(char)))
      .join("");
    parsed.pathname = [...segments, encoded].join("/");
    return parsed.toString();
  } catch {
    return raw.trim().replace(/\(/g, "%28").replace(/\)/g, "%29");
  }
}

const webflowProjects = JSON.parse(readFileSync(CATALOG, "utf8"));
const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const payloads = webflowProjects.map((row) => ({
  slug: row.slug,
  title: row.title,
  image_url: normalizeCdnImageUrl(row.image_url),
  image_alt: row.image_alt,
  category_slug: row.category_slug,
  date_label: row.date_label,
  year_code: row.year_code,
  accent: row.accent,
  stat_value: row.stat_value,
  stat_label: row.stat_label,
  icon_url: row.icon_url,
  description: row.description,
  short_description: row.description ? row.description.slice(0, 100) : null,
  location: row.location,
  gallery_urls: (row.gallery_urls ?? []).map((item) => normalizeCdnImageUrl(item)),
  status: row.is_published ? "published" : "draft",
  is_published: row.is_published,
  goal_amount: null,
  amount_raised: 0,
  suggested_donations: [],
  sort_order: row.sort_order,
}));

const CHUNK = 40;
let synced = 0;

for (let index = 0; index < payloads.length; index += CHUNK) {
  const chunk = payloads.slice(index, index + CHUNK);
  const { error } = await supabase.from("projects").upsert(chunk, { onConflict: "slug" });
  if (error) {
    console.error("Upsert failed:", error.message);
    process.exit(1);
  }
  synced += chunk.length;
  console.log(`Synced ${synced}/${payloads.length}…`);
}

const { error: deleteError } = await supabase
  .from("projects")
  .delete()
  .like("image_url", "%images.unsplash.com%");

if (deleteError) {
  console.warn("Could not remove Unsplash placeholders:", deleteError.message);
} else {
  console.log("Removed dead Unsplash placeholder rows.");
}

console.log(`Done — ${synced} projects upserted from Webflow catalog.`);
