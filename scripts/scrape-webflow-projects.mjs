/**
 * Scrape all projects from da10.webflow.io into src/data/webflow-projects.json
 * Run: node scripts/scrape-webflow-projects.mjs
 */

import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "src/data/webflow-projects.json");
const BASE = "https://da10.webflow.io";

const CATEGORY_MAP = {
  "المشاريع التعليمية": "educational.10x10",
  "المشاريع الصحية": "health-10x10",
  "المشاريع الدعوية": "lmshryaa-ldaawy",
  "المشاريع التنموية": "developments",
  "المشاريع الإغاثية": "lmshryaa-lgthy",
  "مشاريع الأيتام": "orphans",
  "مشاريع المياه": "waters-10x10",
  "مشاريع المساجد": "mosque",
  مياه: "waters-10x10",
  صحة: "health-10x10",
  تعليم: "educational.10x10",
  تنموية: "developments",
  إغاثة: "lmshryaa-lgthy",
  أيتام: "orphans",
  مساجد: "mosque",
  دعوية: "lmshryaa-ldaawy",
};

const ACCENT_BY_SLUG = {
  "educational.10x10": "red",
  "health-10x10": "green",
  "lmshryaa-ldaawy": "olive",
  developments: "blue",
  "lmshryaa-lgthy": "yellow",
  orphans: "orange",
  "waters-10x10": "water",
  mosque: "default",
};

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

function parseHomeCard(html, slug) {
  const linkIdx = html.indexOf(`href="/project/${slug}"`);
  if (linkIdx === -1) return null;

  const chunk = html.slice(Math.max(0, linkIdx - 2000), linkIdx + 4000);

  const imgMatch = chunk.match(/src="(https:\/\/cdn\.prod\.website-files\.com\/[^"]+)"/);
  const titleMatch = chunk.match(/class="text-block-14[^"]*"[^>]*>([^<]+)</);
  const dateMatch = chunk.match(/class="text-block-6[^"]*"[^>]*>([^<]+)</);
  const yearMatch = chunk.match(/class="text-block-4[^"]*"[^>]*>([^<]+)</);
  const statValueMatch = chunk.match(/class="bold-text-3[^"]*"[^>]*>([^<]+)</);
  const statLabelMatch = chunk.match(/class="text-block-10[^"]*"[^>]*>([^<]+)</);

  return {
    imageUrl: imgMatch?.[1] ?? "",
    title: decodeHtml(titleMatch?.[1] ?? slug),
    dateLabel: decodeHtml(dateMatch?.[1] ?? ""),
    yearCode: yearMatch ? decodeHtml(yearMatch[1]) : null,
    statValue: statValueMatch ? decodeHtml(statValueMatch[1]) : null,
    statLabel: statLabelMatch ? decodeHtml(statLabelMatch[1]) : null,
  };
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

  for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const part of match[1].split(",")) {
      const url = part.trim().split(/\s+/)[0];
      if (url.includes("cdn.prod.website-files.com")) {
        urls.add(pickFullSizeUrl(url));
      }
    }
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
    categoryTag: tags[0] ?? "",
    location: tags[1] && tags[1] !== tags[0] ? tags[1] : null,
    dateLabel: tags.find((t) => /20\d{2}|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|اكتوبر|أكتوبر|نوفمبر|ديسمبر|كورونا/i.test(t)) ?? tags[2] ?? "",
    title: decodeHtml(titleMatch?.[1] ?? ""),
    description: decodeHtml(descMatch?.[1]?.replace(/\s+/g, " ") ?? ""),
    galleryUrls: uniqueGallery,
  };
}

function resolveCategorySlug(categoryTag, fallbackSlug) {
  if (CATEGORY_MAP[categoryTag]) return CATEGORY_MAP[categoryTag];
  for (const [key, slug] of Object.entries(CATEGORY_MAP)) {
    if (categoryTag.includes(key) || key.includes(categoryTag)) return slug;
  }
  return fallbackSlug ?? "developments";
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "DirectAid10x10-scraper/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function main() {
  console.log("Fetching homepage…");
  const homeHtml = await fetchText(`${BASE}/`);
  const slugs = extractSlugs(homeHtml);
  console.log(`Found ${slugs.length} projects`);

  const existing = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : [];
  const existingMap = new Map(existing.map((p) => [p.slug, p]));

  const projects = [];

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    process.stdout.write(`[${i + 1}/${slugs.length}] ${slug}… `);

    try {
      const card = parseHomeCard(homeHtml, slug) ?? {};
      const detailHtml = await fetchText(`${BASE}/project/${slug}`);
      const detail = parseDetailPage(detailHtml);

      const categorySlug = resolveCategorySlug(detail.categoryTag, card.categorySlug);
      const dateLabel = detail.dateLabel || card.dateLabel || "";
      const location =
        detail.location && detail.location !== detail.categoryTag ? detail.location : null;

      const project = {
        slug,
        title: detail.title || card.title || slug,
        image_url: detail.imageUrl || card.imageUrl || "",
        image_alt: null,
        category_slug: categorySlug,
        date_label: dateLabel,
        year_code: card.yearCode || null,
        accent: ACCENT_BY_SLUG[categorySlug] ?? "default",
        stat_value: card.statValue || null,
        stat_label: card.statLabel || null,
        icon_url: null,
        description: detail.description || existingMap.get(slug)?.description || null,
        location,
        gallery_urls: detail.galleryUrls,
        is_published: true,
        sort_order: i + 1,
      };

      projects.push(project);
      console.log("ok");
    } catch (err) {
      console.log(`fail: ${err.message}`);
      if (existingMap.has(slug)) {
        projects.push(existingMap.get(slug));
      }
    }

    await new Promise((r) => setTimeout(r, 120));
  }

  writeFileSync(OUT, JSON.stringify(projects, null, 2), "utf8");
  console.log(`\nWrote ${projects.length} projects → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
