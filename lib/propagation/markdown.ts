// Markdown helpers shared by the propagation system.
//
// - absolutizeUrls: rewrite root-relative links/images (/foo, /images/x.png) and
//   raw-HTML src/href attributes to absolute https://chemacabeza.dev/... URLs so
//   the content renders correctly off-site.
// - markdownToHtml: full-fidelity Markdown -> HTML via `marked` (GFM on, so
//   fenced code blocks and tables survive). Posts are plain Markdown + raw HTML
//   (no MDX/JSX), so this faithfully reproduces the article body.
// - toPlainText / summarize: derive a clean plain-text summary.
import { marked } from "marked";
import { siteConfig } from "../metadata";

marked.setOptions({ gfm: true, breaks: false });

export function absolutizeUrls(markdown: string, base: string = siteConfig.url): string {
    const b = base.replace(/\/$/, "");
    let out = markdown;
    // Markdown links and images with a root-relative target: [txt](/path) / ![alt](/path)
    out = out.replace(
        /(!?\[[^\]]*\]\()(\/[^)\s]+)(\))/g,
        (_m, pre, p, post) => `${pre}${b}${p}${post}`,
    );
    // Raw HTML src="/..." and href="/..."
    out = out.replace(
        /(\b(?:src|href)=")(\/[^"]+)(")/g,
        (_m, pre, p, post) => `${pre}${b}${p}${post}`,
    );
    return out;
}

export function markdownToHtml(markdown: string): string {
    return marked.parse(markdown, { async: false }) as string;
}

export function toPlainText(markdown: string): string {
    return markdown
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/`[^`]*`/g, " ")
        .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/<[^>]+>/g, " ")
        .replace(/^[#>\-*\s|]+/gm, " ")
        .replace(/[*_~`>#|]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function summarize(markdown: string, max = 300): string {
    const text = toPlainText(markdown);
    if (text.length <= max) return text;
    return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

/** Word count over the plain-text form of the body. */
export function wordCount(text: string): number {
    const t = text.trim();
    return t ? t.split(/\s+/).length : 0;
}
