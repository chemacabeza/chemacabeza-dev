#!/usr/bin/env tsx
// Validate propagation status:
//   npm run validate:post-propagation
//
// Lists every post powering /writing, compares against the sync state, and
// reports per platform: propagated / missing / changed-locally / manual / and
// whether the FULL article text is present (on-platform or as an artifact). It
// also opens the generated artifacts and verifies they actually contain the
// full body (not just a summary or link).
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { discoverPosts } from "../../lib/propagation/posts";
import { getRecord, loadState } from "../../lib/propagation/state";
import { outRoot } from "../../lib/propagation/artifacts";
import { toPlainText } from "../../lib/propagation/markdown";
import { PLATFORMS } from "../../lib/propagation/adapters";
import type { Platform, Post } from "../../lib/propagation/types";

function artifactPath(platform: Platform, slug: string): string {
    return platform === "linkedin"
        ? path.join(outRoot(), "linkedin", `${slug}.article.md`)
        : path.join(outRoot(), platform, slug, "post.md");
}

/** True iff the artifact exists and contains (most of) the article body. */
export function artifactHasFullText(platform: Platform, post: Post): boolean {
    const p = artifactPath(platform, post.slug);
    if (!existsSync(p)) return false;
    const content = readFileSync(p, "utf8");
    if (content.length < Math.floor(post.contentMarkdown.length * 0.8)) return false;
    const bodyPlain = toPlainText(post.contentMarkdown);
    const probe = bodyPlain.slice(0, 80);
    return probe.length === 0 || toPlainText(content).includes(probe);
}

function pad(s: string, n: number): string {
    return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}

function main() {
    const posts = discoverPosts();
    const state = loadState();

    const missing: Record<Platform, string[]> = { substack: [], medium: [], linkedin: [], devto: [] };
    const changed: string[] = [];
    const manual: string[] = [];
    const missingFullText: string[] = [];
    const fullyPropagated: string[] = []; // live on every platform (created/updated)
    const artifactsReady: string[] = []; // full-text available everywhere (platform or artifact)

    // Header
    console.log(`\nPost propagation status — ${posts.length} post(s)\n`);
    console.log(pad("slug", 46) + PLATFORMS.map((p) => pad(p, 22)).join(""));
    console.log("-".repeat(46 + 22 * PLATFORMS.length));

    for (const post of posts) {
        const cells: string[] = [];
        let liveEverywhere = true;
        let artifactsEverywhere = true;
        for (const platform of PLATFORMS) {
            const rec = getRecord(state, post.slug, platform);
            const hasArtifact = artifactHasFullText(platform, post);
            const fullText = !!rec?.fullTextPropagated || hasArtifact;
            const isChanged = !!rec && rec.contentHash !== post.contentHash;
            const onPlatform = rec?.status === "created" || rec?.status === "updated";

            if (!rec) missing[platform].push(post.slug);
            if (rec?.status === "manual_required" && !manual.includes(post.slug)) manual.push(post.slug);
            if (isChanged && !changed.includes(post.slug)) changed.push(post.slug);
            if (!fullText && !missingFullText.includes(post.slug)) missingFullText.push(post.slug);
            if (!onPlatform || isChanged) liveEverywhere = false;
            if (!rec || !fullText || isChanged) artifactsEverywhere = false;

            const status = rec ? rec.status : "none";
            const ft = fullText ? "FT" : "no-FT";
            const ch = isChanged ? " *changed" : "";
            cells.push(pad(`${status}/${ft}${ch}`, 22));
        }
        if (liveEverywhere) fullyPropagated.push(post.slug);
        if (artifactsEverywhere) artifactsReady.push(post.slug);
        console.log(pad(post.slug, 46) + cells.join(""));
    }

    const list = (label: string, arr: string[]) =>
        console.log(`\n${label} (${arr.length})${arr.length ? ":\n  " + arr.join("\n  ") : ""}`);

    console.log("\n" + "=".repeat(60));
    list("Fully propagated LIVE on every platform (status created/updated)", fullyPropagated);
    list("Full-text ready on every platform (on-platform OR paste-ready artifact)", artifactsReady);
    list("Missing on Substack", missing.substack);
    list("Missing on Medium", missing.medium);
    list("Missing on LinkedIn", missing.linkedin);
    list("Missing on DEV.to", missing.devto);
    list("Changed locally since last propagation", changed);
    list("Requiring manual publishing action", manual);
    list("Missing FULL-TEXT propagation/artifact", missingFullText);
    console.log(
        `\nLegend: <status>/<FT|no-FT>  — FT = complete article body present ` +
            `(on platform or as artifact). Run \`npm run propagate:posts -- --all --dry-run\` ` +
            `to (re)generate full-text artifacts.\n`,
    );
}

main();
