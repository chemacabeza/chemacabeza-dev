import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            // Block API endpoints and the raw article-export route (the source
            // Medium imports from) — the latter would otherwise be duplicate
            // content of the canonical /writing/[slug] pages. All CSS, JS,
            // and image assets remain crawlable.
            disallow: ["/api/", "/export/"],
        },
        sitemap: `${siteConfig.url}/sitemap.xml`,
        host: siteConfig.url,
    };
}
