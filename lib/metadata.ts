import type { Metadata } from "next";

export const siteConfig = {
    name: "José María Cabeza Rodríguez",
    title: "José María Cabeza Rodríguez — Engineering Manager & System Architect",
    description:
        "Engineering Manager with 15+ years building high-performance backend systems, distributed architectures, and the teams that deliver them. Based in Berlin.",
    url: "https://chemacabeza.dev",
    ogImage: "https://chemacabeza.dev/og-image.png",
    author: {
        name: "José María Cabeza Rodríguez",
        email: "chemacabeza@gmail.com",
        github: "https://github.com/chemacabeza",
        linkedin: "https://www.linkedin.com/in/jcabeza/",
        twitter: "https://twitter.com/chemacabeza",
    },
};

export function createMetadata({
    title,
    description,
    path = "",
    ogImage,
}: {
    title?: string;
    description?: string;
    path?: string;
    ogImage?: string;
}): Metadata {
    const fullTitle = title
        ? `${title} — ${siteConfig.name}`
        : siteConfig.title;
    const fullDescription = description ?? siteConfig.description;
    const fullUrl = `${siteConfig.url}${path}`;
    const image = ogImage ?? siteConfig.ogImage;

    return {
        title: fullTitle,
        description: fullDescription,
        metadataBase: new URL(siteConfig.url),
        openGraph: {
            title: fullTitle,
            description: fullDescription,
            url: fullUrl,
            siteName: siteConfig.name,
            images: [{ url: image, width: 1200, height: 630, alt: fullTitle }],
            type: "website",
            locale: "en_US",
        },
        twitter: {
            card: "summary_large_image",
            title: fullTitle,
            description: fullDescription,
            images: [image],
            creator: "@chemacabeza",
        },
        alternates: { canonical: fullUrl },
        robots: {
            index: true,
            follow: true,
            googleBot: { index: true, follow: true },
        },
    };
}
