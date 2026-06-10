import { createHash } from "node:crypto";

/**
 * Stable content hash for a post. Changes whenever the title, description,
 * tags, full body, canonical URL, or cover image change — and ONLY then
 * (tags are sorted so reordering doesn't churn the hash). Drives idempotency
 * and "changed since last propagation" detection.
 */
export function contentHash(parts: {
    title: string;
    description?: string;
    tags: string[];
    body: string;
    canonicalUrl: string;
    coverImageUrl?: string;
}): string {
    const payload = JSON.stringify({
        title: parts.title,
        description: parts.description ?? "",
        tags: [...parts.tags].sort(),
        body: parts.body,
        canonicalUrl: parts.canonicalUrl,
        coverImageUrl: parts.coverImageUrl ?? "",
    });
    return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}
