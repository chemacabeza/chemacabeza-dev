import { siteConfig } from "./metadata";

/** First image in MDX/markdown body, absolutized. Falls back to the site OG image. */
export function deriveCoverImage(content: string): string {
    const md = content.match(/!\[[^\]]*\]\(([^)\s]+)\)/);
    const html = content.match(/<img[^>]+src="([^"]+)"/i);
    let src = md?.[1] ?? html?.[1];
    if (!src) return siteConfig.ogImage;
    if (src.startsWith("/")) src = `${siteConfig.url}${src}`;
    return src.startsWith("http") ? src : siteConfig.ogImage;
}
