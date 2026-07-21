// Orchestrator: for each (post × platform) render + write full-text artifacts,
// decide the action idempotently (skip unchanged, map already-published, or
// publish/update), call the adapter, and persist sync state.
//
// Artifacts are ALWAYS (re)written — even on an idempotent skip — so the
// out/crosspost previews always reflect the current source. Publishing is gated
// entirely inside each adapter via PublishOptions (dry-run never performs real
// network actions).
import { getAdapter } from "./adapters";
import { writeArtifacts } from "./artifacts";
import {
    getRecord,
    loadState,
    saveState,
    upsertRecord,
    type StateFile,
    type SyncRecord,
} from "./state";
import type {
    ExistingPublication,
    Platform,
    Post,
    PublicationResult,
    PublishOptions,
} from "./types";

export interface RunConfig {
    posts: Post[];
    platforms: Platform[];
    options: PublishOptions;
}

export interface RunItemResult {
    slug: string;
    platform: Platform;
    result: PublicationResult;
}

async function propagateOne(
    post: Post,
    platform: Platform,
    options: PublishOptions,
    state: StateFile,
    generatedAt: string,
): Promise<PublicationResult> {
    const adapter = getAdapter(platform);
    const rendered = await adapter.render(post);
    // Always refresh the full-text artifacts.
    const artifactPaths = writeArtifacts(platform, post, rendered, generatedAt);

    const record = getRecord(state, post.slug, platform);
    // If the record is missing or has status "error", we check the public feed.
    let existing: ExistingPublication | null = null;
    if (!record || record.status === "error") {
        existing = await adapter.findExisting(post);
    }

    const unchanged =
        !!record &&
        record.contentHash === post.contentHash &&
        record.status !== "error";

    let result: PublicationResult;
    if (unchanged && !options.updateExisting) {
        result = {
            platform,
            status: "skipped",
            platformPostId: record?.platformPostId,
            platformUrl: record?.platformUrl,
            message: "Unchanged since last propagation — idempotent skip (artifact refreshed).",
            fullTextPropagated: record?.fullTextPropagated,
            fullTextArtifact: true,
        };
    } else if (existing && !options.updateExisting) {
        result = {
            platform,
            status: "skipped",
            platformUrl: existing.platformUrl,
            platformPostId: existing.platformPostId,
            message:
                "Already published on platform (matched via public feed) — mapped into state, " +
                "skipping to avoid a duplicate. Use --update-existing to push changes.",
            fullTextPropagated: true,
            fullTextArtifact: true,
        };
    } else {
        const existingPub: ExistingPublication | null = record
            ? {
                  platform,
                  platformPostId: record.platformPostId,
                  platformUrl: record.platformUrl,
                  canonicalUrl: record.canonicalUrl,
              }
            : existing;
        if (options.updateExisting && existingPub?.platformUrl && adapter.updateExisting) {
            result = await adapter.updateExisting(post, existingPub, options);
        } else {
            result = await adapter.publish(post, options);
        }
    }
    result.artifactPaths = artifactPaths;

    // Persist. On an idempotent skip we preserve the prior meaningful status
    // rather than overwriting it with "skipped", unless we matched an existing post.
    const persistedStatus =
        result.status === "skipped" && record
            ? (existing ? "created" : record.status)
            : result.status;
    const next: SyncRecord = {
        slug: post.slug,
        canonicalUrl: post.canonicalUrl,
        contentHash: post.contentHash,
        platform,
        platformPostId: result.platformPostId ?? record?.platformPostId,
        platformUrl: result.platformUrl ?? record?.platformUrl,
        status: (existing && !record) || (existing && record?.status === "error") ? "created" : persistedStatus,
        fullTextPropagated:
            result.fullTextPropagated ?? record?.fullTextPropagated ?? false,
        fullTextArtifact: result.fullTextArtifact ?? true,
        lastSyncedAt: generatedAt,
        lastError: result.status === "error" ? result.message : undefined,
    };
    upsertRecord(state, next);
    return result;
}

export async function runPropagation(cfg: RunConfig): Promise<RunItemResult[]> {
    const state = loadState();
    const generatedAt = new Date().toISOString();
    const results: RunItemResult[] = [];

    for (const post of cfg.posts) {
        for (const platform of cfg.platforms) {
            console.log(`Processing: [${platform}] ${post.slug}...`);
            const result = await propagateOne(post, platform, cfg.options, state, generatedAt);
            results.push({ slug: post.slug, platform, result });
            saveState(state); // Save progress incrementally
        }
    }

    return results;
}

/** Filter helper shared by the CLI: by slug and/or `--since` date. */
export function selectPosts(all: Post[], opts: { slug?: string; since?: string }): Post[] {
    let posts = all;
    if (opts.slug) posts = posts.filter((p) => p.slug === opts.slug);
    if (opts.since) {
        const since = new Date(opts.since).getTime();
        posts = posts.filter((p) => (p.date ? new Date(p.date).getTime() >= since : true));
    }
    return posts;
}
