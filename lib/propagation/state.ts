// Local sync state: .content-propagation-state.json at the repo root.
//
// WHY COMMITTED: the file holds only non-secret mapping data (slugs, content
// hashes, public platform URLs/IDs, statuses, timestamps) — never tokens or
// cookies. Committing it makes idempotency work across machines and CI without
// an external database: a second run sees what was already propagated and skips
// it. Credentials live exclusively in environment variables / GitHub Secrets.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Platform, PublishStatus } from "./types";

export interface SyncRecord {
    slug: string;
    canonicalUrl: string;
    contentHash: string;
    platform: Platform;
    platformPostId?: string;
    platformUrl?: string;
    status: PublishStatus;
    /** Full article text was propagated to the platform itself. */
    fullTextPropagated: boolean;
    /** A full-text ready-to-paste artifact was generated locally. */
    fullTextArtifact: boolean;
    lastSyncedAt: string;
    lastError?: string;
}

export interface StateFile {
    version: number;
    records: Record<string, SyncRecord>; // key = `${slug}::${platform}`
}

// Resolved lazily (read at call-time, not import-time) so tests/alternate
// locations can set CONTENT_PROP_STATE_PATH before invoking the system.
export function statePath(): string {
    return (
        process.env.CONTENT_PROP_STATE_PATH ||
        path.join(process.cwd(), ".content-propagation-state.json")
    );
}

export function recordKey(slug: string, platform: string): string {
    return `${slug}::${platform}`;
}

export function loadState(): StateFile {
    const p = statePath();
    if (!existsSync(p)) return { version: 1, records: {} };
    try {
        const parsed = JSON.parse(readFileSync(p, "utf8"));
        if (!parsed.records) parsed.records = {};
        if (!parsed.version) parsed.version = 1;
        return parsed as StateFile;
    } catch {
        return { version: 1, records: {} };
    }
}

export function saveState(state: StateFile): void {
    writeFileSync(statePath(), JSON.stringify(state, null, 2) + "\n");
}

export function getRecord(
    state: StateFile,
    slug: string,
    platform: string,
): SyncRecord | undefined {
    return state.records[recordKey(slug, platform)];
}

export function upsertRecord(state: StateFile, rec: SyncRecord): void {
    state.records[recordKey(rec.slug, rec.platform)] = rec;
}
