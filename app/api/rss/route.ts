import { getAllPosts } from "@/lib/mdx";
import { siteConfig } from "@/lib/metadata";

// Ensure this generates at build time to a static XML file for fast delivery
export const dynamic = "force-static";

/** Escape XML-significant characters for values placed outside CDATA. */
function xmlEscape(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

export async function GET() {
    const posts = getAllPosts();
    const siteUrl = siteConfig.url;
    const author = `${siteConfig.author.email} (${siteConfig.author.name})`;
    // Newest post drives the channel's lastBuildDate — no per-request clock.
    const lastBuild = posts[0]
        ? new Date(posts[0].frontmatter.date).toUTCString()
        : new Date(0).toUTCString();

    const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xmlEscape(siteConfig.name)}</title>
    <link>${siteUrl}</link>
    <description>${xmlEscape(siteConfig.description)}</description>
    <language>${siteConfig.language}</language>
    <managingEditor>${xmlEscape(author)}</managingEditor>
    <webMaster>${xmlEscape(author)}</webMaster>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts
        .map(
            (post) => `
    <item>
      <title><![CDATA[${post.frontmatter.title}]]></title>
      <link>${siteUrl}/writing/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/writing/${post.slug}</guid>
      <pubDate>${new Date(post.frontmatter.date).toUTCString()}</pubDate>
      <dc:creator><![CDATA[${siteConfig.author.name}]]></dc:creator>
      <description><![CDATA[${post.excerpt}]]></description>
      ${
          post.frontmatter.tags
              ? post.frontmatter.tags
                    .map((tag: string) => `<category><![CDATA[${tag}]]></category>`)
                    .join("")
              : ""
      }
    </item>`
        )
        .join("")}
  </channel>
</rss>`;

    return new Response(rssFeed, {
        headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, s-maxage=1200, stale-while-revalidate=600",
        },
    });
}
