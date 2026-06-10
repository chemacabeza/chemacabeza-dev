// Post discovery + normalization.
//
// Reuses the site's existing content-access layer (lib/mdx.ts) for parsing —
// the SAME source that powers /writing — then normalizes each into the
// propagation `Post` model with the COMPLETE body (markdown + html), an
// absolutized canonical view, a derived cover image, and a content hash.
import { getAllPosts, getPostBySlug, type Post as SourcePost } from "../mdx";
import { siteConfig } from "../metadata";
import { absolutizeUrls, markdownToHtml, summarize } from "./markdown";
import { contentHash } from "./hash";
import type { Post } from "./types";

const SITE = (process.env.SITE_BASE_URL || siteConfig.url).replace(/\/$/, "");

/** Best-effort cover image: first image in the body, else the site OG image. */
function deriveCover(markdown: string): string | undefined {
    const md = markdown.match(/!\[[^\]]*\]\(([^)\s]+)\)/);
    const html = markdown.match(/<img[^>]+src="([^"]+)"/i);
    let src = md?.[1] ?? html?.[1];
    if (!src) return siteConfig.ogImage;
    if (src.startsWith("/")) src = SITE + src;
    return src.startsWith("http") ? src : siteConfig.ogImage;
}

function normalize(raw: SourcePost): Post {
    const fm = raw.frontmatter as SourcePost["frontmatter"] & {
        updated?: string;
        updatedAt?: string;
    };
    const canonicalUrl = `${SITE}/writing/${raw.slug}`;
    // The FULL body — absolutized, never truncated.
    const contentMarkdown = absolutizeUrls(raw.content, SITE);
    const contentHtml = markdownToHtml(contentMarkdown);
    const coverImageUrl = deriveCover(contentMarkdown);
    const tags = fm.tags ?? [];

    return {
        slug: raw.slug,
        title: fm.title,
        description: fm.description,
        date: fm.date,
        updatedAt: fm.updatedAt ?? fm.updated,
        tags,
        canonicalUrl,
        contentMarkdown,
        contentHtml,
        plainTextSummary: fm.description?.trim() || summarize(contentMarkdown),
        coverImageUrl,
        contentHash: contentHash({
            title: fm.title,
            description: fm.description,
            tags,
            body: contentMarkdown,
            canonicalUrl,
            coverImageUrl,
        }),
    };
}

/** Every post powering /writing, normalized, newest-first (same order as the site). */
export function discoverPosts(): Post[] {
    return getAllPosts().map(normalize);
}

export function getPost(slug: string): Post | null {
    const raw = getPostBySlug(slug);
    return raw ? normalize(raw) : null;
}
