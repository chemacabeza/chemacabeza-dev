// LinkedIn adapter.
//
// LinkedIn's public Posts REST API supports FEED posts with explicit article
// link content (title/description/source supplied directly — never URL
// scraping). It does NOT expose public long-form "Articles" publishing. So:
//   • Feed teaser  -> posted via API on --publish when creds exist (status created)
//   • Full article -> ALWAYS emitted as a full-text artifact (<slug>.article.md),
//                     marked manual_required for the long-form version.
// Both artifacts (teaser + full article) are generated every run.
//
// Auth (env only): LINKEDIN_ACCESS_TOKEN + LINKEDIN_AUTHOR_URN
// (LINKEDIN_PERSON_URN accepted as a fallback for parity with the existing
// scripts/linkedin-poster publisher).
import dns from "node:dns";
import { linkedInFeedPost, renderArticle } from "../render";
import type {
    ExistingPublication,
    Post,
    PublicationResult,
    Publisher,
    PublishOptions,
    RenderedPost,
} from "../types";

dns.setDefaultResultOrder?.("ipv4first");

const API = "https://api.linkedin.com";
const FALLBACK_VERSION = "202605";

function escapeLittleText(text: string): string {
    // LinkedIn "Little Text" reserves these; leave '#' so hashtags stay clickable.
    return text.replace(/[\\()[\]{}<>@|~*_]/g, "\\$&");
}

async function resolveApiVersion(token: string): Promise<string> {
    if (process.env.LINKEDIN_API_VERSION) return process.env.LINKEDIN_API_VERSION;
    const now = new Date();
    for (let i = 0; i < 18; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const v = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
        try {
            const res = await fetch(`${API}/rest/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "LinkedIn-Version": v,
                    "X-Restli-Protocol-Version": "2.0.0",
                },
                signal: AbortSignal.timeout(10000),
            });
            if (res.status !== 426) return v; // 426 = retired version
        } catch {
            /* transient — try next */
        }
    }
    return FALLBACK_VERSION;
}

export class LinkedInAdapter implements Publisher {
    platform = "linkedin" as const;

    private get author(): string | undefined {
        return process.env.LINKEDIN_AUTHOR_URN || process.env.LINKEDIN_PERSON_URN;
    }

    async render(post: Post): Promise<RenderedPost> {
        const rendered = renderArticle(post, "linkedin");
        rendered.feedPostMarkdown = linkedInFeedPost(post);
        return rendered;
    }

    async findExisting(): Promise<ExistingPublication | null> {
        // LinkedIn has no compliant read API for a member's posts here — rely on
        // local sync state for idempotency.
        return null;
    }

    async publish(post: Post, options: PublishOptions): Promise<PublicationResult> {
        const token = process.env.LINKEDIN_ACCESS_TOKEN;
        const author = this.author;
        const artifactNote =
            "Full-text article saved as <slug>.article.md (LinkedIn has no public long-form API — publish the article manually).";

        if (!options.publish) {
            return {
                platform: "linkedin",
                status: "manual_required",
                message: `Dry-run: would post a feed teaser via API${
                    token && author ? "" : " (creds missing)"
                }. ${artifactNote}`,
                fullTextPropagated: false,
                fullTextArtifact: true,
            };
        }
        if (!token || !author) {
            return {
                platform: "linkedin",
                status: "manual_required",
                message: `Missing LINKEDIN_ACCESS_TOKEN / LINKEDIN_AUTHOR_URN. ${artifactNote}`,
                fullTextPropagated: false,
                fullTextArtifact: true,
            };
        }

        const teaser = linkedInFeedPost(post);
        const body = {
            author,
            commentary: escapeLittleText(teaser),
            visibility: "PUBLIC",
            distribution: {
                feedDistribution: "MAIN_FEED",
                targetEntities: [],
                thirdPartyDistributionChannels: [],
            },
            // Explicit article metadata — NOT URL scraping.
            content: {
                article: {
                    source: post.canonicalUrl,
                    title: post.title,
                    description: post.plainTextSummary.slice(0, 250),
                },
            },
            lifecycleState: "PUBLISHED",
            isReshareDisabledByAuthor: false,
        };

        try {
            const version = await resolveApiVersion(token);
            const res = await fetch(`${API}/rest/posts`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "LinkedIn-Version": version,
                    "X-Restli-Protocol-Version": "2.0.0",
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(20000),
            });
            if (!res.ok) {
                const detail = await res.text().catch(() => "");
                return {
                    platform: "linkedin",
                    status: "error",
                    message: `LinkedIn feed post failed (HTTP ${res.status}): ${detail.slice(0, 200)}. ${artifactNote}`,
                    fullTextPropagated: false,
                    fullTextArtifact: true,
                };
            }
            const id = res.headers.get("x-restli-id") || res.headers.get("x-linkedin-id") || undefined;
            const url = id ? `https://www.linkedin.com/feed/update/${id}` : undefined;
            return {
                platform: "linkedin",
                status: "created",
                platformPostId: id,
                platformUrl: url,
                message: `Feed teaser posted (with article link). ${artifactNote}`,
                fullTextPropagated: false, // feed is a teaser; full text lives in the artifact
                fullTextArtifact: true,
            };
        } catch (e) {
            return {
                platform: "linkedin",
                status: "error",
                message: `LinkedIn publish error: ${(e as Error).message}. ${artifactNote}`,
                fullTextPropagated: false,
                fullTextArtifact: true,
            };
        }
    }
}
