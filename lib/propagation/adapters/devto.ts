// DEV.to adapter.
//
// DEV.to has an official public write API for articles.
// To publish: POST /api/articles with headers { "api-key": DEVTO_API_KEY } and
// body { article: { title, body_markdown, published: true, tags, canonical_url } }.
//
// If no DEVTO_API_KEY is supplied, it falls back to manual output mode:
// it generates a complete, full-text ready-to-paste article under
// out/crosspost/devto/<slug>/post.md and reports `manual_required`.
import { renderArticle } from "../render";
import { findInFeed } from "../feeds";
import type {
    ExistingPublication,
    Post,
    PublicationResult,
    Publisher,
    PublishOptions,
    RenderedPost,
} from "../types";

const DEVTO_API = "https://dev.to/api";

function cleanTags(tags: string[]): string[] {
    return tags
        .map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, ""))
        .filter((t) => t.length > 0)
        .slice(0, 4);
}

async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
    let res = await fetch(url, init);
    if (res.status === 429) {
        console.log(`\n[DEV.to] Rate limit reached. Waiting 31 seconds before retry for ${url}...`);
        await new Promise((resolve) => setTimeout(resolve, 31000));
        res = await fetch(url, init);
    }
    return res;
}

export class DevToAdapter implements Publisher {
    platform = "devto" as const;

    async render(post: Post): Promise<RenderedPost> {
        return renderArticle(post, "devto");
    }

    async findExisting(post: Post): Promise<ExistingPublication | null> {
        const token = process.env.DEVTO_API_KEY;
        if (token) {
            try {
                // If API key is available, use the authenticated DEV.to API to list all user articles.
                // This is much more reliable than the RSS feed, which is limited to the last 12 items.
                const res = await fetch(`${DEVTO_API}/articles/me?per_page=100`, {
                    headers: {
                        "api-key": token,
                    },
                    signal: AbortSignal.timeout(15000),
                });
                if (res.ok) {
                    const articles = await res.json() as Array<{ id: number; title: string; url: string; canonical_url?: string }>;
                    // Match by canonical URL first, then by title
                    const hit = articles.find((a) => {
                        if (a.canonical_url === post.canonicalUrl) return true;
                        const want = post.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
                        const got = a.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
                        return got === want || got.includes(want) || want.includes(got);
                    });
                    if (hit) {
                        return {
                            platform: "devto",
                            platformPostId: String(hit.id),
                            platformUrl: hit.url,
                            title: hit.title,
                            canonicalUrl: post.canonicalUrl,
                        };
                    }
                }
            } catch (e) {
                console.error("[DEV.to] Error querying /api/articles/me:", e);
            }
        }

        // Match existing posts via the public DEV.to RSS feed.
        return findInFeed("https://dev.to/feed/chemacabeza", post, "devto");
    }

    async publish(post: Post, options: PublishOptions): Promise<PublicationResult> {
        const token = process.env.DEVTO_API_KEY;
        const artifactNote = "Full-text article saved as out/crosspost/devto/<slug>/post.md.";

        if (!options.publish) {
            return {
                platform: "devto",
                status: "manual_required",
                message: `Dry-run: would publish to DEV.to via API${
                    token ? "" : " (api-key missing)"
                }. ${artifactNote}`,
                fullTextPropagated: false,
                fullTextArtifact: true,
            };
        }

        if (!token) {
            return {
                platform: "devto",
                status: "manual_required",
                message: `Missing DEVTO_API_KEY. ${artifactNote}`,
                fullTextPropagated: false,
                fullTextArtifact: true,
            };
        }

        const rendered = await this.render(post);
        const body = {
            article: {
                title: post.title,
                body_markdown: rendered.bodyMarkdown,
                published: true, // Automatically publish
                tags: cleanTags(post.tags),
                canonical_url: post.canonicalUrl,
            },
        };

        try {
            const res = await fetchWithRetry(`${DEVTO_API}/articles`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": token,
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(60000), // Extended timeout due to potential retry
            });

            if (!res.ok) {
                const detail = await res.text().catch(() => "");
                return {
                    platform: "devto",
                    status: "error",
                    message: `DEV.to publish failed (HTTP ${res.status}): ${detail.slice(0, 200)}. ${artifactNote}`,
                    fullTextPropagated: false,
                    fullTextArtifact: true,
                };
            }

            const data = await res.json() as { id: number; url: string };
            return {
                platform: "devto",
                status: "created",
                platformPostId: String(data.id),
                platformUrl: data.url,
                message: `Successfully published to DEV.to.`,
                fullTextPropagated: true,
                fullTextArtifact: true,
            };
        } catch (e) {
            return {
                platform: "devto",
                status: "error",
                message: `DEV.to publish error: ${(e as Error).message}. ${artifactNote}`,
                fullTextPropagated: false,
                fullTextArtifact: true,
            };
        }
    }

    async updateExisting(
        post: Post,
        existing: ExistingPublication,
        options: PublishOptions,
    ): Promise<PublicationResult> {
        const token = process.env.DEVTO_API_KEY;
        const artifactNote = "Full-text article saved as out/crosspost/devto/<slug>/post.md.";

        if (!options.publish) {
            return {
                platform: "devto",
                status: "manual_required",
                message: `Dry-run: would update DEV.to article ${existing.platformPostId} via API. ${artifactNote}`,
                fullTextPropagated: false,
                fullTextArtifact: true,
            };
        }

        if (!token) {
            return {
                platform: "devto",
                status: "manual_required",
                message: `Missing DEVTO_API_KEY for update. ${artifactNote}`,
                fullTextPropagated: false,
                fullTextArtifact: true,
            };
        }

        if (!existing.platformPostId) {
            return {
                platform: "devto",
                status: "error",
                message: `Cannot update DEV.to post: missing platformPostId. ${artifactNote}`,
                fullTextPropagated: false,
                fullTextArtifact: true,
            };
        }

        const rendered = await this.render(post);
        const body = {
            article: {
                title: post.title,
                body_markdown: rendered.bodyMarkdown,
                tags: cleanTags(post.tags),
                canonical_url: post.canonicalUrl,
            },
        };

        try {
            const res = await fetchWithRetry(`${DEVTO_API}/articles/${existing.platformPostId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": token,
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(60000), // Extended timeout due to potential retry
            });

            if (!res.ok) {
                const detail = await res.text().catch(() => "");
                return {
                    platform: "devto",
                    status: "error",
                    message: `DEV.to update failed (HTTP ${res.status}): ${detail.slice(0, 200)}. ${artifactNote}`,
                    fullTextPropagated: false,
                    fullTextArtifact: true,
                };
            }

            const data = await res.json() as { id: number; url: string };
            return {
                platform: "devto",
                status: "updated",
                platformPostId: String(data.id),
                platformUrl: data.url,
                message: `Successfully updated DEV.to article.`,
                fullTextPropagated: true,
                fullTextArtifact: true,
            };
        } catch (e) {
            return {
                platform: "devto",
                status: "error",
                message: `DEV.to update error: ${(e as Error).message}. ${artifactNote}`,
                fullTextPropagated: false,
                fullTextArtifact: true,
            };
        }
    }
}
