import { test } from "node:test";
import assert from "node:assert/strict";
import { discoverPosts, getPost } from "../lib/propagation/posts";

test("discoverPosts finds the site's posts with COMPLETE bodies", () => {
    const posts = discoverPosts();
    assert.ok(posts.length >= 10, `expected many posts, got ${posts.length}`);
    for (const p of posts) {
        assert.ok(p.slug && p.title, `post missing slug/title`);
        assert.equal(p.canonicalUrl, `https://chemacabeza.dev/writing/${p.slug}`);
        // Full body, not an excerpt: real articles are well over 500 chars.
        assert.ok(p.contentMarkdown.length > 500, `${p.slug} body too short`);
        assert.ok(p.contentHtml.length > 500, `${p.slug} html too short`);
        assert.ok(p.contentHash.length === 16);
        assert.ok(Array.isArray(p.tags));
    }
});

test("getPost returns a normalized post and absolutizes URLs", () => {
    const p = getPost("the-feynman-guide-to-vim");
    assert.ok(p, "vim post should exist");
    assert.ok(!/\]\(\/(?!\/)/.test(p!.contentMarkdown), "no root-relative md links should remain");
    assert.ok(p!.coverImageUrl?.startsWith("https://"), "cover should be absolute");
});

test("getPost returns null for unknown slug", () => {
    assert.equal(getPost("does-not-exist-xyz"), null);
});
