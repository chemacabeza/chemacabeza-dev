import { getAllPosts, getPostBySlug } from "@/lib/mdx";
import { siteConfig } from "@/lib/metadata";
import { NextRequest } from "next/server";

export const dynamic = "force-static";

export function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
}

/**
 * Convert basic markdown to HTML without external dependencies.
 * Handles: headings, bold, italic, links, images, blockquotes,
 * unordered/ordered lists, horizontal rules, inline code, and paragraphs.
 * Also passes through raw HTML (like <div>, <img>, etc.).
 */
function markdownToHtml(md: string): string {
    const lines = md.split("\n");
    const htmlLines: string[] = [];
    let inList = false;
    let listType: "ul" | "ol" | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Horizontal rule
        if (/^---+\s*$/.test(line)) {
            if (inList) {
                htmlLines.push(listType === "ul" ? "</ul>" : "</ol>");
                inList = false;
                listType = null;
            }
            htmlLines.push("<hr/>");
            continue;
        }

        // Raw HTML pass-through (lines starting with <)
        if (/^\s*</.test(line)) {
            if (inList) {
                htmlLines.push(listType === "ul" ? "</ul>" : "</ol>");
                inList = false;
                listType = null;
            }
            htmlLines.push(line);
            continue;
        }

        // Headings
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            if (inList) {
                htmlLines.push(listType === "ul" ? "</ul>" : "</ol>");
                inList = false;
                listType = null;
            }
            const level = headingMatch[1].length;
            const text = inlineMarkdown(headingMatch[2]);
            htmlLines.push(`<h${level}>${text}</h${level}>`);
            continue;
        }

        // Unordered list items
        const ulMatch = line.match(/^[\*\-]\s+(.+)$/);
        if (ulMatch) {
            if (!inList || listType !== "ul") {
                if (inList) htmlLines.push(listType === "ul" ? "</ul>" : "</ol>");
                htmlLines.push("<ul>");
                inList = true;
                listType = "ul";
            }
            htmlLines.push(`<li>${inlineMarkdown(ulMatch[1])}</li>`);
            continue;
        }

        // Ordered list items
        const olMatch = line.match(/^\d+\.\s+(.+)$/);
        if (olMatch) {
            if (!inList || listType !== "ol") {
                if (inList) htmlLines.push(listType === "ul" ? "</ul>" : "</ol>");
                htmlLines.push("<ol>");
                inList = true;
                listType = "ol";
            }
            htmlLines.push(`<li>${inlineMarkdown(olMatch[1])}</li>`);
            continue;
        }

        // Close list if we're no longer in list items
        if (inList) {
            htmlLines.push(listType === "ul" ? "</ul>" : "</ol>");
            inList = false;
            listType = null;
        }

        // Blockquote
        if (line.startsWith("> ")) {
            htmlLines.push(
                `<blockquote><p>${inlineMarkdown(line.slice(2))}</p></blockquote>`
            );
            continue;
        }

        // Empty line
        if (line.trim() === "") {
            continue;
        }

        // Paragraph (default)
        htmlLines.push(`<p>${inlineMarkdown(line)}</p>`);
    }

    if (inList) {
        htmlLines.push(listType === "ul" ? "</ul>" : "</ol>");
    }

    return htmlLines.join("\n");
}

/** Convert inline markdown: bold, italic, code, links, images */
function inlineMarkdown(text: string): string {
    // Images: ![alt](src)
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
        const fullSrc = src.startsWith("http") ? src : `${siteConfig.url}${src}`;
        return `<img src="${fullSrc}" alt="${alt}"/>`;
    });
    // Links: [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    // Bold + italic: ***text***
    text = text.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    // Bold: **text**
    text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // Italic: *text*
    text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
    // Inline code: `text`
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
    return text;
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        return new Response("Not found", { status: 404 });
    }

    const { frontmatter, content } = post;
    const articleHtml = markdownToHtml(content);
    const canonicalUrl = `${siteConfig.url}/writing/${slug}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <title>${frontmatter.title}</title>
    <meta name="description" content="${frontmatter.description}"/>
    <meta name="author" content="${siteConfig.name}"/>
    <link rel="canonical" href="${canonicalUrl}"/>
    <meta property="og:title" content="${frontmatter.title}"/>
    <meta property="og:description" content="${frontmatter.description}"/>
    <meta property="og:url" content="${canonicalUrl}"/>
    <meta property="og:type" content="article"/>
</head>
<body>
    <article>
        <h1>${frontmatter.title}</h1>
        <p><em>${frontmatter.description}</em></p>
        <p>Originally published on <a href="${canonicalUrl}">${siteConfig.url}</a> by ${siteConfig.name}</p>
        <hr/>
        ${articleHtml}
    </article>
</body>
</html>`;

    return new Response(html, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
        },
    });
}
