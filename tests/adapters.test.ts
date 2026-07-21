import { test } from "node:test";
import assert from "node:assert/strict";
import { getPost } from "../lib/propagation/posts";
import { MediumAdapter, SubstackAdapter, LinkedInAdapter, DevToAdapter } from "../lib/propagation/adapters";
import type { Post, PublishOptions } from "../lib/propagation/types";

const DRY: PublishOptions = { dryRun: true, publish: false, updateExisting: false };

function samplePost(): Post {
    const p = getPost("the-feynman-guide-to-vim");
    assert.ok(p);
    return p!;
}

test("Medium/Substack/DevTo render the COMPLETE body + attribution footer", async () => {
    const post = samplePost();
    for (const adapter of [new MediumAdapter(), new SubstackAdapter(), new DevToAdapter()]) {
        const r = await adapter.render(post);
        assert.ok(r.fullTextIncluded);
        // body must contain (most of) the source body
        assert.ok(r.bodyMarkdown.length >= post.contentMarkdown.length);
        assert.match(r.bodyMarkdown, /Originally published at/);
        assert.ok(r.wordCount > 100, "should count full-article words");
    }
});

test("LinkedIn render produces BOTH a full-text article and a feed teaser", async () => {
    const post = samplePost();
    const r = await new LinkedInAdapter().render(post);
    assert.ok(r.bodyMarkdown.length >= post.contentMarkdown.length, "article = full text");
    assert.ok(r.feedPostMarkdown, "feed teaser must exist");
    assert.ok(r.feedPostMarkdown!.includes(post.canonicalUrl), "teaser links to canonical");
    assert.ok(r.feedPostMarkdown!.length < r.bodyMarkdown.length, "teaser is shorter than article");
});

test("dry-run publish never performs real actions; reports manual_required + full-text artifact", async () => {
    const post = samplePost();
    for (const adapter of [new MediumAdapter(), new SubstackAdapter(), new LinkedInAdapter(), new DevToAdapter()]) {
        const res = await adapter.publish(post, DRY);
        assert.equal(res.status, "manual_required");
        assert.equal(res.fullTextArtifact, true);
    }
});
