import { siteConfig } from "@/lib/metadata";

interface ArticleJsonLdProps {
    title: string;
    description: string;
    url: string;
    datePublished: string;
    image?: string;
    tags?: string[];
}

export default function ArticleJsonLd({
    title,
    description,
    url,
    datePublished,
    image,
    tags,
}: ArticleJsonLdProps) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description,
        url,
        datePublished,
        author: {
            "@type": "Person",
            name: siteConfig.author.name,
            url: siteConfig.url,
        },
        publisher: {
            "@type": "Person",
            name: siteConfig.author.name,
            url: siteConfig.url,
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        image: image ?? siteConfig.ogImage,
        keywords: tags?.join(", "),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
