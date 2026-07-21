// Shared types for the content-propagation system.
//
// A `Post` is the normalized, source-of-truth representation of a website
// article (everything under content/posts powering /writing). It always carries
// the COMPLETE article body in both `contentMarkdown` and `contentHtml` — never
// an excerpt. Adapters render a `Post` into a platform-specific `RenderedPost`
// and either publish it (where a compliant API exists) or emit a ready-to-paste
// full-text artifact.

export type Platform = "substack" | "medium" | "linkedin" | "devto";

export interface Post {
    slug: string;
    title: string;
    description?: string;
    date?: string;
    updatedAt?: string;
    tags: string[];
    canonicalUrl: string;
    /** COMPLETE article body as Markdown (URLs absolutized). Not an excerpt. */
    contentMarkdown: string;
    /** COMPLETE article body rendered to HTML. Not an excerpt. */
    contentHtml: string;
    /** Short human summary (description, or derived from the body). */
    plainTextSummary: string;
    coverImageUrl?: string;
    /** Stable hash over title/description/tags/body/canonicalUrl/coverImage. */
    contentHash: string;
}

export interface RenderedPost {
    platform: Platform;
    title: string;
    subtitle?: string;
    /** Full-text body (with attribution footer) as Markdown. */
    bodyMarkdown: string;
    /** Full-text body (with attribution footer) as HTML. */
    bodyHtml: string;
    tags: string[];
    canonicalUrl: string;
    coverImageUrl?: string;
    /** Whether the rendered body contains the complete article text. */
    fullTextIncluded: boolean;
    charCount: number;
    wordCount: number;
    /** LinkedIn (and similar): a short feed-post teaser, separate from the article. */
    feedPostMarkdown?: string;
}

export type PublishStatus =
    | "skipped"
    | "created"
    | "updated"
    | "drafted"
    | "manual_required"
    | "error";

export interface PublishOptions {
    dryRun: boolean;
    publish: boolean;
    updateExisting: boolean;
}

export interface ExistingPublication {
    platform: string;
    platformPostId?: string;
    platformUrl?: string;
    title?: string;
    canonicalUrl?: string;
    publishedAt?: string;
}

export interface PublicationResult {
    platform: string;
    status: PublishStatus;
    platformPostId?: string;
    platformUrl?: string;
    message: string;
    /** True when the full article text was propagated to the platform itself. */
    fullTextPropagated?: boolean;
    /** True when a full-text artifact (ready-to-paste) was generated locally. */
    fullTextArtifact?: boolean;
    artifactPaths?: string[];
}

export interface Publisher {
    platform: Platform;
    render(post: Post): Promise<RenderedPost>;
    findExisting(post: Post): Promise<ExistingPublication | null>;
    publish(post: Post, options: PublishOptions): Promise<PublicationResult>;
    updateExisting?(
        post: Post,
        existing: ExistingPublication,
        options: PublishOptions,
    ): Promise<PublicationResult>;
}
