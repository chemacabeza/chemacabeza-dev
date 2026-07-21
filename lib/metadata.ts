import type { Metadata } from "next";

/**
 * Single source of truth for site identity, SEO defaults, and social profiles.
 * Consumed by createMetadata(), the JSON-LD helpers (lib/jsonld.ts), the
 * sitemap, robots and RSS routes. Keep values here — do not hard-code them
 * elsewhere.
 */
export const siteConfig = {
    /** Used as the site/brand name and the OpenGraph `siteName`. */
    name: "José María Cabeza Rodríguez",
    /** Homepage / default document title (used verbatim, no template). */
    title: "José María Cabeza Rodríguez — Engineering Manager & System Architect",
    description:
        "Engineering Manager and System Architect in Berlin with 15+ years building high-performance backend systems, distributed architectures, and the teams that ship them.",
    /** Canonical production origin — HTTPS, no trailing slash, lowercase. */
    url: "https://chemacabeza.dev",
    /** Absolute URL of the default 1200×630 social-sharing image. */
    ogImage: "https://chemacabeza.dev/opengraph-image",
    locale: "en_US",
    /** BCP-47 language of the site content (used for JSON-LD `inLanguage`). */
    language: "en",
    /** Professional positioning reused across metadata and structured data. */
    jobTitle: "Engineering Manager & System Architect",
    location: { city: "Berlin", region: "Berlin", country: "Germany" },
    author: {
        name: "José María Cabeza Rodríguez",
        email: "chema@chemacabeza.dev",
        github: "https://github.com/chemacabeza",
        linkedin: "https://www.linkedin.com/in/jcabeza/",
        twitter: "https://twitter.com/chemacabeza",
        twitterHandle: "@chemacabeza",
        medium: "https://medium.com/@chemacabeza",
        substack: "https://chemacabeza.substack.com",
    },
} as const;

/** Verified public profiles for the Person `sameAs` array (structured data). */
export const sameAsProfiles: string[] = [
    siteConfig.author.github,
    siteConfig.author.linkedin,
    siteConfig.author.medium,
    siteConfig.author.substack,
];

interface CreateMetadataArgs {
    /** Page-specific title *without* the site name suffix. */
    title?: string;
    description?: string;
    /** Path relative to the origin, e.g. "/about". Empty string = homepage. */
    path?: string;
    ogImage?: string;
    /** Descriptive alt text for the social image. */
    ogImageAlt?: string;
    type?: "website" | "article" | "profile";
    publishedTime?: string;
    modifiedTime?: string;
    tags?: string[];
    section?: string;
    /** Exclude the page from search indexes (still followed). */
    noindex?: boolean;
}

/**
 * Builds a fully-resolved, self-canonical Metadata object for a route.
 *
 * The returned title uses `title.absolute` so it is *never* re-wrapped by the
 * root layout's `title.template`. This is what prevents duplicated titles such
 * as "About — José María … — José María …".
 */
export function createMetadata({
    title,
    description,
    path = "",
    ogImage,
    ogImageAlt,
    type = "website",
    publishedTime,
    modifiedTime,
    tags,
    section,
    noindex = false,
}: CreateMetadataArgs): Metadata {
    const fullTitle = title ? `${title} — ${siteConfig.name}` : siteConfig.title;
    const fullDescription = description ?? siteConfig.description;
    const fullUrl = `${siteConfig.url}${path}`;
    const image = ogImage ?? siteConfig.ogImage;
    const imageAlt = ogImageAlt ?? fullTitle;

    return {
        title: { absolute: fullTitle },
        description: fullDescription,
        metadataBase: new URL(siteConfig.url),
        alternates: {
            canonical: fullUrl,
            types: { "application/rss+xml": `${siteConfig.url}/rss.xml` },
        },
        openGraph: {
            title: fullTitle,
            description: fullDescription,
            url: fullUrl,
            siteName: siteConfig.name,
            images: [{ url: image, width: 1200, height: 630, alt: imageAlt }],
            type: type === "profile" ? "profile" : type,
            locale: siteConfig.locale,
            ...(type === "article"
                ? {
                      publishedTime,
                      modifiedTime: modifiedTime ?? publishedTime,
                      authors: [siteConfig.author.name],
                      section,
                      tags,
                  }
                : {}),
        },
        twitter: {
            card: "summary_large_image",
            title: fullTitle,
            description: fullDescription,
            images: [{ url: image, alt: imageAlt }],
            creator: siteConfig.author.twitterHandle,
            site: siteConfig.author.twitterHandle,
        },
        robots: noindex
            ? { index: false, follow: true }
            : {
                  index: true,
                  follow: true,
                  googleBot: {
                      index: true,
                      follow: true,
                      "max-video-preview": -1,
                      "max-image-preview": "large",
                      "max-snippet": -1,
                  },
              },
    };
}
