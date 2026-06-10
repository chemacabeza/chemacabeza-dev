// Medium adapter.
//
// Medium RETIRED its Publishing API (the official developer page still links to
// it, but the GitHub docs are archived and warn it is no longer supported, and
// the create-post endpoints reject requests). So we do not attempt a real
// publish by default: we generate a complete, full-text Medium-ready artifact
// (Markdown + HTML, canonical preserved) for manual import via
// medium.com/p/import, and report `manual_required`.
//
// Escape hatch: if you have a working endpoint, set MEDIUM_API_BASE (+
// MEDIUM_INTEGRATION_TOKEN) to opt back in — wiring is intentionally left as a
// documented TODO rather than calling a known-dead endpoint.
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

export class MediumAdapter implements Publisher {
    platform = "medium" as const;

    async render(post: Post): Promise<RenderedPost> {
        return renderArticle(post, "medium");
    }

    async findExisting(post: Post): Promise<ExistingPublication | null> {
        return findInFeed("https://medium.com/feed/@chemacabeza", post, "medium");
    }

    async publish(post: Post, options: PublishOptions): Promise<PublicationResult> {
        const importUrl = `https://medium.com/p/import?url=${encodeURIComponent(post.canonicalUrl)}`;
        const hasOptIn = !!(process.env.MEDIUM_API_BASE && process.env.MEDIUM_INTEGRATION_TOKEN);
        const base = {
            platform: "medium",
            status: "manual_required" as const,
            fullTextPropagated: false,
            fullTextArtifact: true,
        };
        if (options.publish && hasOptIn) {
            return {
                ...base,
                message:
                    "MEDIUM_API_BASE opt-in is set but live API publishing is not implemented " +
                    `(Medium's API is retired). Full-text artifact generated; import via ${importUrl}`,
            };
        }
        return {
            ...base,
            message:
                "Medium Publishing API is retired — full-text artifact generated for manual import " +
                `(canonical preserved). Import via ${importUrl}`,
        };
    }
}
