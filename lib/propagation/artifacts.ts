// Preview / ready-to-paste artifact writer.
//
// Layout (under out/crosspost/, gitignored):
//   medium/<slug>/post.md  post.html  metadata.json
//   substack/<slug>/post.md  post.html  metadata.json
//   linkedin/<slug>.post.md      (feed teaser)
//   linkedin/<slug>.article.md   (COMPLETE article text)
//   linkedin/<slug>.json         (metadata)
//
// Every *.md / *.html / *.article.md contains the FULL article body so the
// generated drafts are paste-ready with no manual re-typing.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Platform, Post, RenderedPost } from "./types";

// Resolved lazily (read at call-time) so tests/alternate locations can set
// CONTENT_PROP_OUT_DIR before invoking the system.
export function outRoot(): string {
    return process.env.CONTENT_PROP_OUT_DIR || path.join(process.cwd(), "out", "crosspost");
}

function buildMetadata(post: Post, rendered: RenderedPost, generatedAt: string) {
    return {
        sourceUrl: post.canonicalUrl,
        title: post.title,
        description: post.description ?? "",
        tags: post.tags,
        contentHash: post.contentHash,
        platform: rendered.platform,
        generatedAt,
        fullTextIncluded: rendered.fullTextIncluded,
        charCount: rendered.charCount,
        wordCount: rendered.wordCount,
    };
}

function writeFile(p: string, contents: string): string {
    mkdirSync(path.dirname(p), { recursive: true });
    writeFileSync(p, contents);
    return p;
}

/** Write artifacts for a platform. Returns the absolute paths written. */
export function writeArtifacts(
    platform: Platform,
    post: Post,
    rendered: RenderedPost,
    generatedAt: string,
): string[] {
    const meta = JSON.stringify(buildMetadata(post, rendered, generatedAt), null, 2) + "\n";

    if (platform === "linkedin") {
        const base = path.join(outRoot(), "linkedin", post.slug);
        return [
            writeFile(`${base}.post.md`, rendered.feedPostMarkdown ?? rendered.bodyMarkdown),
            writeFile(`${base}.article.md`, rendered.bodyMarkdown),
            writeFile(`${base}.json`, meta),
        ];
    }

    // medium / substack share the directory-per-slug shape.
    const dir = path.join(outRoot(), platform, post.slug);
    return [
        writeFile(path.join(dir, "post.md"), rendered.bodyMarkdown),
        writeFile(path.join(dir, "post.html"), rendered.bodyHtml),
        writeFile(path.join(dir, "metadata.json"), meta),
    ];
}
