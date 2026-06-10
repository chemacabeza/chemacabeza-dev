// Substack adapter.
//
// Substack offers NO official public write API (per SubstackAPI.dev's technical
// overview). So this adapter never attempts a real publish: it generates a
// complete, full-text Substack-ready artifact (Markdown + HTML, with the
// "Originally published at …" footer) under out/crosspost/substack/<slug>/ and
// reports `manual_required`. findExisting matches the public Substack RSS feed
// by title so already-published posts are mapped into sync state.
//
// NOTE: a separate, isolated/experimental browser-automation path exists at
// scripts/substack-poster/ (Chrome DevTools Protocol). It is deliberately NOT
// wired in here — per the "avoid brittle browser automation" constraint, it
// stays behind its own manual entry point.
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

const SUBSTACK_FEED =
    (process.env.SUBSTACK_PUBLICATION_URL || "https://chemacabeza.substack.com").replace(/\/$/, "") +
    "/feed";

export class SubstackAdapter implements Publisher {
    platform = "substack" as const;

    async render(post: Post): Promise<RenderedPost> {
        return renderArticle(post, "substack");
    }

    async findExisting(post: Post): Promise<ExistingPublication | null> {
        return findInFeed(SUBSTACK_FEED, post, "substack");
    }

    async publish(_post: Post, _options: PublishOptions): Promise<PublicationResult> {
        return {
            platform: "substack",
            status: "manual_required",
            message:
                "Substack has no official write API — full-text artifact generated for manual " +
                "paste into the Substack editor (or use the experimental scripts/substack-poster CDP flow).",
            fullTextPropagated: false,
            fullTextArtifact: true,
        };
    }
}
