import { test } from "node:test";
import assert from "node:assert/strict";
import { contentHash } from "../lib/propagation/hash";

const base = {
    title: "T",
    description: "D",
    tags: ["a", "b"],
    body: "Hello world",
    canonicalUrl: "https://chemacabeza.dev/writing/t",
    coverImageUrl: "https://chemacabeza.dev/c.png",
};

test("hash is stable for identical input and tag reorder", () => {
    assert.equal(contentHash(base), contentHash({ ...base }));
    assert.equal(contentHash(base), contentHash({ ...base, tags: ["b", "a"] }));
});

test("hash changes when any tracked field changes", () => {
    const h = contentHash(base);
    assert.notEqual(h, contentHash({ ...base, title: "T2" }));
    assert.notEqual(h, contentHash({ ...base, description: "D2" }));
    assert.notEqual(h, contentHash({ ...base, tags: ["a", "b", "c"] }));
    assert.notEqual(h, contentHash({ ...base, body: "Hello world!" }));
    assert.notEqual(h, contentHash({ ...base, canonicalUrl: "https://x" }));
    assert.notEqual(h, contentHash({ ...base, coverImageUrl: "https://y" }));
});
