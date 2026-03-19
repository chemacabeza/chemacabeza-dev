import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata";
import { getAllPosts } from "@/lib/mdx";
import { projects } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
    const posts = getAllPosts();

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: siteConfig.url, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
        { url: `${siteConfig.url}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
        { url: `${siteConfig.url}/projects`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
        { url: `${siteConfig.url}/writing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
        { url: `${siteConfig.url}/now`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
        { url: `${siteConfig.url}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
    ];

    const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${siteConfig.url}/writing/${post.slug}`,
        lastModified: new Date(post.frontmatter.date),
        changeFrequency: "monthly",
        priority: 0.7,
    }));

    const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
        url: `${siteConfig.url}/projects/${project.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
    }));

    return [...staticRoutes, ...postRoutes, ...projectRoutes];
}
