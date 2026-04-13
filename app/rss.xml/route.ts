import { getAllPosts } from "@/lib/mdx";
import { siteConfig } from "@/lib/metadata";

// Ensure this generates at build time to a static XML file for fast delivery
export const dynamic = 'force-static';

export async function GET() {
  const posts = getAllPosts();
  const siteUrl = siteConfig.url;

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name}</title>
    <link>${siteUrl}</link>
    <description>${siteConfig.description}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.frontmatter.title}]]></title>
      <link>${siteUrl}/writing/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/writing/${post.slug}</guid>
      <pubDate>${new Date(post.frontmatter.date).toUTCString()}</pubDate>
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
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1200, stale-while-revalidate=600",
    },
  });
}
