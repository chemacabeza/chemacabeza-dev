import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata";
import { getAllPosts } from "@/lib/mdx";
import { projects } from "@/lib/projects";

/**
 * Canonical sitemap. Only indexable, self-canonical pages are listed — no API
 * routes, the /export duplicate-content route, or the noindex 404 page.
 *
 * `lastModified` uses real content dates (frontmatter `updated`/`date`) rather
 * than a per-request `new Date()`, so timestamps only change when content
 * actually changes. `changeFrequency`/`priority` are intentionally omitted:
 * Google ignores them and inventing values adds no signal.
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const posts = getAllPosts();

    const postDate = (iso: string | undefined) =>
        iso ? new Date(iso) : undefined;

    const postEntries = posts.map((post) => ({
        url: `${siteConfig.url}/writing/${post.slug}`,
        lastModified:
            postDate(post.frontmatter.updated) ?? new Date(post.frontmatter.date),
    }));

    // The writing hub's freshness tracks the newest article.
    const newestPost = posts[0]
        ? postDate(posts[0].frontmatter.updated) ??
          new Date(posts[0].frontmatter.date)
        : undefined;

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: siteConfig.url },
        { url: `${siteConfig.url}/about` },
        { url: `${siteConfig.url}/projects` },
        { url: `${siteConfig.url}/writing`, lastModified: newestPost },
        { url: `${siteConfig.url}/hobbies` },
        { url: `${siteConfig.url}/now` },
        { url: `${siteConfig.url}/contact` },
        { url: `${siteConfig.url}/support` },
        { url: `${siteConfig.url}/privacy-policy` },
        { url: `${siteConfig.url}/terms-of-service` },
    ];

    const projectEntries: MetadataRoute.Sitemap = projects.map((project) => ({
        url: `${siteConfig.url}/projects/${project.slug}`,
    }));

    return [...staticRoutes, ...postEntries, ...projectEntries];
}
