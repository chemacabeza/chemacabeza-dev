import { test } from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtempSync, readFileSync } from "node:fs";

import { runPropagation } from "../lib/propagation/run";
import { discoverPosts } from "../lib/propagation/posts";
import { loadState } from "../lib/propagation/state";
import type { Platform, PublishOptions } from "../lib/propagation/types";

// Isolate state + artifacts to a temp dir and stay offline. Paths are read
// lazily at call-time, so setting these now (before any run) is sufficient.
const tmp = mkdtempSync(path.join(os.tmpdir(), "prop-run-"));
process.env.CONTENT_PROP_STATE_PATH = path.join(tmp, "state.json");
process.env.CONTENT_PROP_OUT_DIR = path.join(tmp, "out");
process.env.PROPAGATE_OFFLINE = "1";

const DRY: PublishOptions = { dryRun: true, publish: false, updateExisting: false };
const PLATFORMS: Platform[] = ["substack", "medium", "linkedin"];
const posts = discoverPosts().slice(0, 1);
const slug = posts[0].slug;
const OUT = process.env.CONTENT_PROP_OUT_DIR!;

test("first run produces results + writes full-text artifacts", async () => {
    const r1 = await runPropagation({ posts, platforms: PLATFORMS, options: DRY });
    assert.equal(r1.length, PLATFORMS.length);
    assert.ok(r1.every((x) => x.result.status !== "skipped"), "nothing skipped on first run");

    const state = loadState();
    assert.equal(Object.keys(state.records).length, PLATFORMS.length);

    // Medium/Substack post.md and LinkedIn article.md must contain the full body.
    for (const p of ["medium", "substack"]) {
        const body = readFileSync(path.join(OUT, p, slug, "post.md"), "utf8");
        assert.ok(body.length >= posts[0].contentMarkdown.length, `${p} artifact full text`);
        assert.match(body, /Originally published at/);
    }
    const article = readFileSync(path.join(OUT, "linkedin", `${slug}.article.md`), "utf8");
    assert.ok(article.length >= posts[0].contentMarkdown.length, "linkedin article full text");
    const feed = readFileSync(path.join(OUT, "linkedin", `${slug}.post.md`), "utf8");
    assert.ok(feed.length < article.length, "linkedin feed teaser shorter than article");

    const meta = JSON.parse(readFileSync(path.join(OUT, "medium", slug, "metadata.json"), "utf8"));
    assert.equal(meta.fullTextIncluded, true);
    assert.ok(meta.wordCount > 100 && meta.charCount > 500);
});

test("second run is idempotent — unchanged posts are skipped", async () => {
    const r2 = await runPropagation({ posts, platforms: PLATFORMS, options: DRY });
    const med = r2.find((x) => x.platform === "medium")!;
    const sub = r2.find((x) => x.platform === "substack")!;
    assert.equal(med.result.status, "skipped");
    assert.equal(sub.result.status, "skipped");
    // state must not have grown (no duplicate records).
    assert.equal(Object.keys(loadState().records).length, PLATFORMS.length);
});
