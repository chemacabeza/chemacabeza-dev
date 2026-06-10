// Best-effort "is this already published?" detection via public RSS feeds.
//
// Compliant read-only: we fetch a platform's public RSS and match an item by
// title. Never throws — any network/parse failure (or PROPAGATE_OFFLINE=1)
// returns null, so idempotency falls back to local sync state + content hash.
import dns from "node:dns";
import type { ExistingPublication, Post } from "./types";

dns.setDefaultResultOrder?.("ipv4first");

function normTitle(s: string): string {
    return s
        .toLowerCase()
        .replace(/<!\[cdata\[|\]\]>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

interface FeedItem {
    title: string;
    link: string;
    pubDate?: string;
}

function parseRss(xml: string): FeedItem[] {
    const items: FeedItem[] = [];
    for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
        const block = m[1];
        const title = block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
        const link = block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] ?? "";
        const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1];
        items.push({
            title: title.replace(/<!\[CDATA\[|\]\]>/g, "").trim(),
            link: link.replace(/<!\[CDATA\[|\]\]>/g, "").trim(),
            pubDate: pubDate?.trim(),
        });
    }
    return items;
}

export async function findInFeed(
    feedUrl: string,
    post: Post,
    platform: string,
): Promise<ExistingPublication | null> {
    if (process.env.PROPAGATE_OFFLINE === "1") return null;
    try {
        const res = await fetch(feedUrl, { signal: AbortSignal.timeout(12000) });
        if (!res.ok) return null;
        const items = parseRss(await res.text());
        const want = normTitle(post.title);
        const hit = items.find((it) => {
            const t = normTitle(it.title);
            return t === want || t.includes(want) || want.includes(t);
        });
        if (!hit) return null;
        return {
            platform,
            platformUrl: hit.link || undefined,
            title: hit.title,
            canonicalUrl: post.canonicalUrl,
            publishedAt: hit.pubDate,
        };
    } catch {
        return null;
    }
}
