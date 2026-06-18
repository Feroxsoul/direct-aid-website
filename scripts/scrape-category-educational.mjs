/**
 * Scrape all educational projects from Webflow category page into webflow-projects.json
 * Run: node scripts/scrape-category-educational.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "src/data/webflow-projects.json");
const BASE = "https://da10.webflow.io";
const CATEGORY_SLUG = "educational.10x10";
const CATEGORY_URL = `${BASE}/lmshryaa/${CATEGORY_SLUG}`;

const ACCENT = "red";

function decodeHtml(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function extractSlugs(html) {
  return [...new Set([...html.matchAll(/href="\/project\/([^"]+)"/g)].map((m) => m[1]))];
}

function pickFullSizeUrl(url) {
  return url.replace(/-p-\d+\.(jpg|jpeg|png|webp)/i, ".$1");
}

function collectGalleryUrls(html) {
  const urls = new Set();
  for (const match of html.matchAll(
    /src="(https:\/\/cdn\.prod\.website-files\.com\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi,
  )) {
    urls.add(pickFullSizeUrl(match[1]));
  }
  return [...urls];
}

function parseDetailPage(html) {
  const heroMatch = html.match(/background-image:url\(&quot;([^&]+)&quot;\)/);
  const tags = [...html.matchAll(/class="text-block-13">([^<]+)</g)].map((m) =>
    decodeHtml(m[1]),
  );
  const titleMatch = html.match(/class="project-title">([^<]+)</);
  const descMatch = html.match(/class="paragraph-4">([\s\S]*?)<\/p>/);
  const heroUrl = heroMatch ? decodeHtml(heroMatch[1]) : "";

  const uniqueGallery = collectGalleryUrls(html).filter((url) => url !== heroUrl);

  return {
    imageUrl: heroUrl,
    location: tags[1] && tags[1] !== tags[0] ? tags[1] : null,
    dateLabel:
      tags.find((t) =>
        /20\d{2}|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|اغسطس|سبتمبر|ستمبر|اكتوبر|أكتوبر|نوفمبر|ديسمبر|SEP|Sep|Dec|Apr/i.test(
          t,
        ),
      ) ??
      tags[2] ??
      "",
    title: decodeHtml(titleMatch?.[1] ?? ""),
    description: decodeHtml(descMatch?.[1]?.replace(/\s+/g, " ") ?? ""),
    galleryUrls: uniqueGallery,
  };
}

function parseCategoryCard(html, slug) {
  const linkIdx = html.indexOf(`href="/project/${slug}"`);
  if (linkIdx === -1) return {};
  const chunk = html.slice(Math.max(0, linkIdx - 1500), linkIdx + 3000);
  const imgMatch = chunk.match(/src="(https:\/\/cdn\.prod\.website-files\.com\/[^"]+)"/);
  const dateMatch = chunk.match(/class="text-block-6[^"]*"[^>]*>([^<]+)</);
  return {
    imageUrl: imgMatch?.[1] ?? "",
    dateLabel: dateMatch ? decodeHtml(dateMatch[1]) : "",
  };
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "DirectAid10x10-scraper/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function main() {
  console.log(`Fetching ${CATEGORY_URL}…`);
  const categoryHtml = await fetchText(CATEGORY_URL);
  const slugs = extractSlugs(categoryHtml);
  console.log(`Found ${slugs.length} educational project slugs on Webflow`);

  const existing = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : [];
  const existingMap = new Map(existing.map((p) => [p.slug, p]));
  const existingEducational = existing.filter((p) => p.category_slug === CATEGORY_SLUG);
  console.log(`Already in catalog: ${existingEducational.length} educational, ${existing.length} total`);

  let added = 0;
  let updated = 0;

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    const prev = existingMap.get(slug);
    process.stdout.write(`[${i + 1}/${slugs.length}] ${slug}… `);

    try {
      const card = parseCategoryCard(categoryHtml, slug);
      const detailHtml = await fetchText(`${BASE}/project/${slug}`);
      const detail = parseDetailPage(detailHtml);

      const project = {
        slug,
        title: detail.title || prev?.title || slug,
        image_url: detail.imageUrl || card.imageUrl || prev?.image_url || "",
        image_alt: prev?.image_alt ?? null,
        category_slug: CATEGORY_SLUG,
        date_label: detail.dateLabel || card.dateLabel || prev?.date_label || "",
        year_code: prev?.year_code ?? null,
        accent: ACCENT,
        stat_value: prev?.stat_value ?? null,
        stat_label: prev?.stat_label ?? null,
        icon_url: prev?.icon_url ?? null,
        description: detail.description || prev?.description || null,
        location: detail.location ?? prev?.location ?? null,
        gallery_urls: detail.galleryUrls.length ? detail.galleryUrls : (prev?.gallery_urls ?? []),
        is_published: true,
        sort_order: prev?.sort_order ?? existing.length + i + 1,
      };

      if (prev) {
        updated++;
      } else {
        added++;
      }
      existingMap.set(slug, project);
      console.log(prev ? "updated" : "added");
    } catch (err) {
      console.log(`fail: ${err.message}`);
      if (prev) existingMap.set(slug, { ...prev, category_slug: CATEGORY_SLUG });
    }

    await new Promise((r) => setTimeout(r, 120));
  }

  const merged = [...existingMap.values()].sort((a, b) => a.sort_order - b.sort_order);
  writeFileSync(OUT, JSON.stringify(merged, null, 2), "utf8");

  const educationalCount = merged.filter((p) => p.category_slug === CATEGORY_SLUG).length;
  console.log(`\nDone: +${added} new, ${updated} updated`);
  console.log(`Educational projects in catalog: ${educationalCount}`);
  console.log(`Total projects: ${merged.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
