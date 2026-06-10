import { test } from "node:test";
import assert from "node:assert/strict";
import {
    absolutizeUrls,
    markdownToHtml,
    summarize,
    toPlainText,
    wordCount,
} from "../lib/propagation/markdown";

test("absolutizeUrls rewrites root-relative markdown links and images", () => {
    const md = "See [docs](/writing/x) and ![hero](/images/h.png) and [ext](https://a.com).";
    const out = absolutizeUrls(md, "https://chemacabeza.dev");
    assert.match(out, /\(https:\/\/chemacabeza\.dev\/writing\/x\)/);
    assert.match(out, /\(https:\/\/chemacabeza\.dev\/images\/h\.png\)/);
    assert.match(out, /\(https:\/\/a\.com\)/); // external untouched
});

test("absolutizeUrls rewrites raw HTML src/href", () => {
    const md = '<img src="/images/a.png"/> <a href="/writing/y">y</a>';
    const out = absolutizeUrls(md, "https://chemacabeza.dev");
    assert.match(out, /src="https:\/\/chemacabeza\.dev\/images\/a\.png"/);
    assert.match(out, /href="https:\/\/chemacabeza\.dev\/writing\/y"/);
});

test("markdownToHtml preserves fenced code blocks and tables (GFM)", () => {
    const md = "# H\n\n```js\nconst a = 1;\n```\n\n| a | b |\n|---|---|\n| 1 | 2 |\n";
    const html = markdownToHtml(md);
    assert.match(html, /<pre><code/);
    assert.match(html, /const a = 1;/);
    assert.match(html, /<table>/);
    assert.match(html, /<td>1<\/td>/);
});

test("toPlainText / summarize strip markup", () => {
    const md = "## Title\n\nSome **bold** and `code` and [link](/x).";
    const plain = toPlainText(md);
    assert.ok(!plain.includes("**"));
    assert.ok(!plain.includes("`"));
    assert.ok(plain.includes("link"));
    assert.ok(summarize(md, 10).length <= 11);
    assert.ok(wordCount("one two three") === 3);
});
