import { getAllPosts } from "@/lib/mdx";
import { siteConfig } from "@/lib/metadata";
import { projects } from "@/lib/projects";

export const dynamic = "force-static";

/**
 * Experimental /llms.txt content-discovery aid (llmstxt.org). A concise,
 * auto-maintained map of the site's important public pages — NOT a full-text
 * mirror, and not a ranking signal. Regenerated from the same content sources
 * as the rest of the site, so it never drifts.
 */
export async function GET() {
    const posts = getAllPosts();
    const url = siteConfig.url;

    const body = `# ${siteConfig.name}

> ${siteConfig.description}

## Site
- [Home](${url}/): Engineering Manager & System Architect in Berlin.
- [About](${url}/about): Career, engineering leadership, and technical background.
- [Projects](${url}/projects): Engineering case studies and open-source work.
- [Writing](${url}/writing): Technical articles on system design and backend engineering.
- [Now](${url}/now): Current focus.
- [Contact](${url}/contact): Get in touch.

## Writing
${posts
    .map((p) => `- [${p.frontmatter.title}](${url}/writing/${p.slug}): ${p.frontmatter.description}`)
    .join("\n")}

## Projects
${projects
    .map((p) => `- [${p.title}](${url}/projects/${p.slug}): ${p.tagline}`)
    .join("\n")}

## Feeds
- [RSS](${url}/rss.xml)
`;

    return new Response(body, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
        },
    });
}
