import { siteConfig, sameAsProfiles } from "./metadata";

/**
 * Typed Schema.org (JSON-LD) builders.
 *
 * All entities are linked through stable `@id` fragments so search engines can
 * merge them into a single knowledge graph across pages:
 *   - PERSON_ID   the canonical José María Cabeza Rodríguez entity
 *   - WEBSITE_ID  the site itself
 *
 * Only fields backed by content actually visible on the page are emitted — no
 * fake ratings, employer counts, or usage statistics. Values are serialized by
 * the <JsonLd> component, which escapes `<` to prevent script injection.
 */

export const PERSON_ID = `${siteConfig.url}/#person`;
export const WEBSITE_ID = `${siteConfig.url}/#website`;

type Json = Record<string, unknown>;

/**
 * Serialize JSON-LD for embedding in a <script> tag. `<` is escaped to its
 * unicode form so no string value (title, tag, etc.) can terminate the script
 * element — the standard defense against JSON-LD script injection.
 */
export function serializeJsonLd(data: Json | Json[]): string {
    return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** The canonical Person entity. Referenced (by @id) everywhere else. */
export function personSchema(): Json {
    return {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": PERSON_ID,
        name: siteConfig.author.name,
        alternateName: "Chema Cabeza",
        url: siteConfig.url,
        image: siteConfig.ogImage,
        jobTitle: siteConfig.jobTitle,
        description: siteConfig.description,
        email: `mailto:${siteConfig.author.email}`,
        address: {
            "@type": "PostalAddress",
            addressLocality: siteConfig.location.city,
            addressCountry: siteConfig.location.country,
        },
        knowsAbout: [
            "Software Engineering Management",
            "Backend Engineering",
            "Distributed Systems",
            "System Design",
            "Software Architecture",
            "Microservices",
            "Java",
            "Spring Boot",
            "Reliability Engineering",
        ],
        sameAs: sameAsProfiles,
    };
}

/** The WebSite entity for the homepage / global graph. */
export function webSiteSchema(): Json {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        inLanguage: siteConfig.language,
        publisher: { "@id": PERSON_ID },
        author: { "@id": PERSON_ID },
    };
}

/** ProfilePage wrapping the Person — used on /about. */
export function profilePageSchema(path = "/about"): Json {
    return {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "@id": `${siteConfig.url}${path}#profilepage`,
        url: `${siteConfig.url}${path}`,
        name: `About ${siteConfig.author.name}`,
        inLanguage: siteConfig.language,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": PERSON_ID },
        about: { "@id": PERSON_ID },
    };
}

interface BlogItem {
    slug: string;
    title: string;
    description: string;
    date: string;
}

/** Blog collection for the /writing index, referencing its listed posts. */
export function blogSchema(path: string, posts: BlogItem[]): Json {
    const url = `${siteConfig.url}${path}`;
    return {
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": `${url}#blog`,
        url,
        name: `Writing — ${siteConfig.name}`,
        description:
            "Technical writing on system design, distributed systems, Java, backend engineering, software architecture, AI, and engineering leadership.",
        inLanguage: siteConfig.language,
        isPartOf: { "@id": WEBSITE_ID },
        author: { "@id": PERSON_ID },
        publisher: { "@id": PERSON_ID },
        blogPost: posts.map((p) => ({
            "@type": "BlogPosting",
            "@id": `${siteConfig.url}/writing/${p.slug}#article`,
            headline: p.title,
            url: `${siteConfig.url}/writing/${p.slug}`,
            datePublished: p.date,
        })),
    };
}

interface ArticleArgs {
    title: string;
    description: string;
    url: string;
    datePublished: string;
    dateModified?: string;
    image?: string;
    tags?: string[];
    section?: string;
}

/** BlogPosting for an individual article, linked to the canonical Person. */
export function blogPostingSchema({
    title,
    description,
    url,
    datePublished,
    dateModified,
    image,
    tags,
    section,
}: ArticleArgs): Json {
    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: title,
        description,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        datePublished,
        dateModified: dateModified ?? datePublished,
        inLanguage: siteConfig.language,
        author: { "@id": PERSON_ID },
        publisher: { "@id": PERSON_ID },
        image: image ?? siteConfig.ogImage,
        isPartOf: { "@id": WEBSITE_ID },
        ...(section && { articleSection: section }),
        ...(tags && tags.length > 0 && { keywords: tags.join(", ") }),
    };
}

interface ProjectArgs {
    title: string;
    description: string;
    url: string;
    keywords?: string[];
    category?: string;
}

/**
 * CreativeWork for a project case study. Deliberately NOT SoftwareApplication:
 * these pages describe engineering work, not downloadable/commercial products,
 * so no offers, prices, or ratings are asserted.
 */
export function creativeWorkSchema({
    title,
    description,
    url,
    keywords,
    category,
}: ProjectArgs): Json {
    return {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "@id": `${url}#project`,
        name: title,
        headline: title,
        description,
        url,
        inLanguage: siteConfig.language,
        author: { "@id": PERSON_ID },
        creator: { "@id": PERSON_ID },
        isPartOf: { "@id": WEBSITE_ID },
        ...(category && { genre: category }),
        ...(keywords && keywords.length > 0 && { keywords: keywords.join(", ") }),
    };
}

/** Generic CollectionPage — e.g. the /projects index. */
export function collectionPageSchema(
    path: string,
    name: string,
    description: string
): Json {
    const url = `${siteConfig.url}${path}`;
    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${url}#collection`,
        url,
        name,
        description,
        inLanguage: siteConfig.language,
        isPartOf: { "@id": WEBSITE_ID },
        author: { "@id": PERSON_ID },
    };
}

/** BreadcrumbList — keep in sync with the visible breadcrumb trail. */
export function breadcrumbSchema(
    items: { name: string; path: string }[]
): Json {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: `${siteConfig.url}${item.path}`,
        })),
    };
}
