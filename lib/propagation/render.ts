// Shared rendering: turn a normalized Post into full-text platform bodies.
import { toPlainText, wordCount } from "./markdown";
import type { Platform, Post, RenderedPost } from "./types";

/** Visible canonical attribution footer (Markdown + HTML). */
export function attribution(post: Post): { md: string; html: string } {
    return {
        md: `\n\n---\n\n*Originally published at [${post.canonicalUrl}](${post.canonicalUrl}).*\n`,
        html: `\n<hr/>\n<p><em>Originally published at <a href="${post.canonicalUrl}">${post.canonicalUrl}</a>.</em></p>\n`,
    };
}

/** Full-article render (complete body + attribution). Used by every adapter. */
export function renderArticle(post: Post, platform: Platform): RenderedPost {
    const foot = attribution(post);
    const bodyMarkdown = post.contentMarkdown + foot.md;
    const bodyHtml = post.contentHtml + foot.html;
    const plain = toPlainText(bodyMarkdown);
    return {
        platform,
        title: post.title,
        subtitle: post.description,
        bodyMarkdown,
        bodyHtml,
        tags: post.tags,
        canonicalUrl: post.canonicalUrl,
        coverImageUrl: post.coverImageUrl,
        fullTextIncluded: true,
        charCount: bodyMarkdown.length,
        wordCount: wordCount(plain),
    };
}

export function hashtagsFromTags(tags: string[], max = 5): string[] {
    return tags
        .slice(0, max)
        .map((t) => "#" + t.replace(/[^A-Za-z0-9]+/g, ""))
        .filter((h) => h.length > 1);
}

/** Up to 5 "key takeaway" lines, derived from the article's H2 headings. */
export function takeaways(post: Post, max = 5): string[] {
    return [...post.contentMarkdown.matchAll(/^##\s+(.+?)\s*$/gm)]
        .map((m) => m[1].replace(/[#*`]/g, "").trim())
        .filter(Boolean)
        .slice(0, max);
}

/** A professional LinkedIn FEED teaser (title + summary + takeaways + link + tags). */
export function linkedInFeedPost(post: Post): string {
    const lines: string[] = [post.title, "", post.plainTextSummary, ""];
    const tw = takeaways(post);
    if (tw.length) {
        lines.push("Key takeaways:");
        for (const t of tw) lines.push(`• ${t}`);
        lines.push("");
    }
    lines.push(`Read the full article: ${post.canonicalUrl}`);
    const tags = hashtagsFromTags(post.tags);
    if (tags.length) lines.push("", tags.join(" "));
    return lines.join("\n").trim() + "\n";
}
