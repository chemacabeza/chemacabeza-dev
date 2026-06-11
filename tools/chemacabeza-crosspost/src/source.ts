import * as cheerio from "cheerio";
import type { SourceArticle } from "./types.js";
import { htmlToMarkdown } from "./render.js";

/** Normalize a URL: resolve against base, drop hash + trailing slash. */
export function normalizeUrl(href: string, base: string): string {
  const u = new URL(href, base);
  u.hash = "";
  if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
    u.pathname = u.pathname.replace(/\/+$/, "");
  }
  return u.toString();
}

/** A stable slug from the URL path, e.g. /writing/my-post -> my-post. */
export function slugFromUrl(url: string): string {
  const { pathname } = new URL(url);
  const parts = pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? pathname.replace(/\W+/g, "-");
}

/**
 * Parse the /writing index page into a de-duplicated, normalized list of
 * article URLs (anything under /writing/<slug>, excluding the index itself).
 */
export function parseWritingIndex(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const found = new Set<string>();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    let abs: string;
    try {
      abs = normalizeUrl(href, baseUrl);
    } catch {
      return;
    }
    const path = new URL(abs).pathname;
    // Match /writing/<slug> but not the bare /writing index.
    if (/^\/writing\/[^/]+/.test(path)) {
      found.add(abs);
    }
  });

  return [...found];
}

/** Parse a single article page into a SourceArticle (sans slug-from-url). */
export function parseArticle(html: string, sourceUrl: string): SourceArticle {
  const $ = cheerio.load(html);

  const title =
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content")?.trim() ||
    $("title").first().text().trim() ||
    "Untitled";

  // Description: meta description first, else first paragraph after the title.
  let description =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "";
  if (!description) {
    description = $("h1").first().nextAll("p").first().text().trim();
  }
  if (!description) {
    description = $("article p, main p, p").first().text().trim();
  }

  const publishedDate =
    $("time[datetime]").first().attr("datetime")?.trim() ||
    $('meta[property="article:published_time"]').attr("content")?.trim() ||
    $("time").first().text().trim() ||
    undefined;

  const tags = new Set<string>();
  $('meta[property="article:tag"]').each((_, el) => {
    const v = $(el).attr("content")?.trim();
    if (v) tags.add(v);
  });
  $('[rel="tag"], .tag, .tags a, [data-tag]').each((_, el) => {
    const v = $(el).text().trim();
    if (v) tags.add(v);
  });

  // Body: prefer <article>, then <main>, then <body>.
  const bodyEl = $("article").first().length
    ? $("article").first()
    : $("main").first().length
      ? $("main").first()
      : $("body").first();
  const bodyHtml = (bodyEl.html() ?? "").trim();

  return {
    sourceUrl,
    slug: slugFromUrl(sourceUrl),
    title,
    description,
    publishedDate,
    tags: [...tags],
    html: bodyHtml,
    markdown: htmlToMarkdown(bodyHtml),
  };
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "user-agent": "chemacabeza-crosspost/1.0 (+https://chemacabeza.dev)" },
  });
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} ${res.statusText} for ${url}`);
  }
  return res.text();
}

/** Discover and fully parse every article linked from the writing index. */
export async function scanArticles(sourceUrl: string): Promise<SourceArticle[]> {
  const indexHtml = await fetchText(sourceUrl);
  const urls = parseWritingIndex(indexHtml, sourceUrl);

  const articles: SourceArticle[] = [];
  for (const url of urls) {
    try {
      const html = await fetchText(url);
      articles.push(parseArticle(html, url));
    } catch (err) {
      // Skip unreachable articles but keep scanning the rest.
      process.stderr.write(
        `warn: could not fetch/parse ${url}: ${(err as Error).message}\n`,
      );
    }
  }

  // Newest-first when a date is available; otherwise keep discovery order.
  articles.sort((a, b) => (b.publishedDate ?? "").localeCompare(a.publishedDate ?? ""));
  return articles;
}
