import { siteConfig } from "./metadata";
import type { Post } from "./mdx";

/**
 * Generates JSON-LD structured data for the Organization schema.
 * Used in the root layout to help search engines understand the site owner.
 *
 * @returns Organization schema object
 */
export function generateOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/logo.png`,
        description: siteConfig.description,
        sameAs: [
            "https://github.com/chemacabeza",
            "https://linkedin.com/in/jm-cabeza",
        ],
    };
}

/**
 * Generates JSON-LD structured data for a Person/ProfilePage schema.
 * Used on the homepage to establish personal brand identity.
 *
 * @returns Person schema object with ProfilePage type
 */
export function generatePersonSchema() {
    return {
        "@context": "https://schema.org",
        "@type": ["Person", "ProfilePage"],
        name: siteConfig.name,
        url: siteConfig.url,
        image: `${siteConfig.url}/avatar.jpg`,
        description: siteConfig.description,
        jobTitle: "Engineering Manager & Systems Architect",
        worksFor: {
            "@type": "Organization",
            name: "Berlin-based Tech Company",
        },
        sameAs: [
            "https://github.com/chemacabeza",
            "https://linkedin.com/in/jm-cabeza",
        ],
        knowsAbout: [
            "Software Architecture",
            "Systems Design",
            "Engineering Leadership",
            "Domain-Driven Design",
            "Microservices",
            "Large Language Models",
            "Serverless Architecture",
        ],
    };
}

/**
 * Generates JSON-LD structured data for a blog post using BlogPosting schema.
 * Helps search engines display rich snippets with author, publish date, and content info.
 *
 * @param post - The blog post object with frontmatter and content
 * @param slug - The URL slug for the post
 * @returns BlogPosting schema object
 */
export function generateBlogPostingSchema(post: Post, slug: string) {
    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.frontmatter.title,
        description: post.frontmatter.description,
        image: `${siteConfig.url}/og-image.png`,
        datePublished: post.frontmatter.date,
        dateModified: post.frontmatter.date,
        author: {
            "@type": "Person",
            name: siteConfig.name,
            url: siteConfig.url,
        },
        publisher: {
            "@type": "Organization",
            name: siteConfig.name,
            logo: {
                "@type": "ImageObject",
                url: `${siteConfig.url}/logo.png`,
            },
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${siteConfig.url}/writing/${slug}`,
        },
        keywords: post.frontmatter.tags?.join(", "),
        articleSection: "Technology",
        inLanguage: "en-US",
        wordCount: post.content.split(/\s+/).length,
        timeRequired: post.readingTime,
    };
}

/**
 * Generates JSON-LD structured data for a BreadcrumbList.
 * Helps search engines understand site navigation hierarchy.
 *
 * @param items - Array of breadcrumb items with name and url
 * @returns BreadcrumbList schema object
 */
export function generateBreadcrumbSchema(
    items: Array<{ name: string; url: string }>
) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}
