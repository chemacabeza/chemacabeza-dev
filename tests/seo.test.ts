import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { siteConfig, createMetadata } from "../lib/metadata";
import {
    personSchema,
    webSiteSchema,
    profilePageSchema,
    blogSchema,
    blogPostingSchema,
    creativeWorkSchema,
    breadcrumbSchema,
    serializeJsonLd,
    PERSON_ID,
} from "../lib/jsonld";
import { getAllPosts, getRelatedPosts, getAdjacentPosts } from "../lib/mdx";
import { projects } from "../lib/projects";
import sitemapFn from "../app/sitemap";
import robotsFn from "../app/robots";

const ORIGIN = siteConfig.url;

/** Resolve the `title` of a Metadata object to a plain string. */
function titleString(t: unknown): string {
    if (typeof t === "string") return t;
    if (t && typeof t === "object" && "absolute" in t) {
        return String((t as { absolute: string }).absolute);
    }
    return "";
}

// ── Metadata ─────────────────────────────────────────────────────────────

test("createMetadata does not double the site name in the title", () => {
    const md = createMetadata({ title: "About", path: "/about" });
    const title = titleString(md.title);
    const occurrences = title.split(siteConfig.name).length - 1;
    assert.equal(occurrences, 1, `title should contain the name exactly once: "${title}"`);
});

test("createMetadata uses title.absolute so the layout template can't re-wrap it", () => {
    const md = createMetadata({ title: "Writing", path: "/writing" });
    assert.ok(
        md.title && typeof md.title === "object" && "absolute" in md.title,
        "title must be an absolute object"
    );
});

test("homepage metadata (no title) falls back to the configured site title", () => {
    const md = createMetadata({});
    assert.equal(titleString(md.title), siteConfig.title);
});

test("canonical URLs are absolute and on the canonical host", () => {
    for (const p of ["", "/about", "/writing", "/projects"]) {
        const md = createMetadata({ path: p });
        const canonical = md.alternates?.canonical;
        assert.equal(canonical, `${ORIGIN}${p}`);
        assert.ok(String(canonical).startsWith("https://chemacabeza.dev"));
    }
});

test("every metadata object is indexable by default and article type sets og article fields", () => {
    const web = createMetadata({ path: "/about" });
    assert.notEqual((web.robots as { index?: boolean }).index, false);

    const art = createMetadata({
        title: "T",
        path: "/writing/x",
        type: "article",
        publishedTime: "2025-01-01",
        section: "System Design",
        tags: ["a"],
    });
    const og = art.openGraph as Record<string, unknown>;
    assert.equal(og.type, "article");
    assert.equal(og.publishedTime, "2025-01-01");
});

test("noindex option produces a non-indexable robots directive", () => {
    const md = createMetadata({ path: "/x", noindex: true });
    assert.equal((md.robots as { index?: boolean }).index, false);
});

// ── Structured data ──────────────────────────────────────────────────────

test("Person schema has a stable @id, correct type, and sameAs profiles", () => {
    const p = personSchema();
    assert.equal(p["@type"], "Person");
    assert.equal(p["@id"], PERSON_ID);
    assert.ok(Array.isArray(p.sameAs) && (p.sameAs as unknown[]).length > 0);
});

test("WebSite and ProfilePage reference the canonical Person @id", () => {
    assert.equal((webSiteSchema().author as { "@id": string })["@id"], PERSON_ID);
    assert.equal(
        (profilePageSchema("/about").mainEntity as { "@id": string })["@id"],
        PERSON_ID
    );
});

test("BlogPosting includes all required fields linked to the Person", () => {
    const a = blogPostingSchema({
        title: "Headline",
        description: "Desc",
        url: `${ORIGIN}/writing/slug`,
        datePublished: "2025-01-01",
        tags: ["System Design"],
        section: "System Design",
    });
    assert.equal(a["@type"], "BlogPosting");
    assert.equal(a.headline, "Headline");
    assert.ok(a.datePublished);
    assert.ok(a.dateModified, "dateModified defaults to datePublished");
    assert.equal((a.author as { "@id": string })["@id"], PERSON_ID);
    assert.ok((a.mainEntityOfPage as { "@id": string })["@id"]);
});

test("Blog schema references its listed posts", () => {
    const posts = getAllPosts().slice(0, 3).map((p) => ({
        slug: p.slug,
        title: p.frontmatter.title,
        description: p.frontmatter.description,
        date: p.frontmatter.date,
    }));
    const b = blogSchema("/writing", posts);
    assert.equal(b["@type"], "Blog");
    assert.equal((b.blogPost as unknown[]).length, 3);
});

test("project schema is CreativeWork, not a commercial SoftwareApplication", () => {
    const c = creativeWorkSchema({
        title: "P",
        description: "D",
        url: `${ORIGIN}/projects/p`,
        keywords: ["Java"],
        category: "Platform Engineering",
    });
    assert.equal(c["@type"], "CreativeWork");
    assert.ok(!("offers" in c) && !("aggregateRating" in c));
});

test("BreadcrumbList positions are sequential and items absolute", () => {
    const b = breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Writing", path: "/writing" },
    ]);
    const items = b.itemListElement as { position: number; item: string }[];
    assert.deepEqual(items.map((i) => i.position), [1, 2]);
    assert.ok(items.every((i) => i.item.startsWith(ORIGIN)));
});

test("serializeJsonLd escapes < to prevent script injection", () => {
    const out = serializeJsonLd(
        blogPostingSchema({
            title: "</script><script>alert(1)</script>",
            description: "x",
            url: `${ORIGIN}/writing/x`,
            datePublished: "2025-01-01",
        })
    );
    assert.ok(!out.includes("</script>"), "must not contain a raw closing script tag");
    assert.ok(out.includes("\\u003c"));
});

// ── Sitemap ──────────────────────────────────────────────────────────────

test("sitemap contains every post and project and no excluded routes", () => {
    const entries = sitemapFn();
    const urls = entries.map((e) => e.url);
    for (const p of getAllPosts()) {
        assert.ok(urls.includes(`${ORIGIN}/writing/${p.slug}`), `missing post ${p.slug}`);
    }
    for (const pr of projects) {
        assert.ok(urls.includes(`${ORIGIN}/projects/${pr.slug}`), `missing project ${pr.slug}`);
    }
    assert.ok(!urls.some((u) => u.includes("/api/")), "no API routes");
    assert.ok(!urls.some((u) => u.includes("/export/")), "no export routes");
});

test("all sitemap URLs use the canonical host and consistent (no) trailing slash", () => {
    for (const { url } of sitemapFn()) {
        assert.ok(url.startsWith("https://chemacabeza.dev"), `bad host: ${url}`);
        assert.ok(url === ORIGIN || !url.endsWith("/"), `trailing slash: ${url}`);
    }
});

test("sitemap has no duplicate URLs", () => {
    const urls = sitemapFn().map((e) => e.url);
    assert.equal(new Set(urls).size, urls.length);
});

test("sitemap lastModified values (when present) are valid dates", () => {
    for (const e of sitemapFn()) {
        if (e.lastModified) {
            assert.ok(!Number.isNaN(new Date(e.lastModified).getTime()));
        }
    }
});

// ── Robots ───────────────────────────────────────────────────────────────

test("robots references the canonical sitemap and blocks private paths", () => {
    const r = robotsFn();
    assert.equal(r.sitemap, `${ORIGIN}/sitemap.xml`);
    const rules = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    const disallow = ([] as string[]).concat(rules?.disallow ?? []);
    assert.ok(disallow.includes("/api/"));
    assert.ok(disallow.includes("/export/"));
    // Must NOT block the public content routes.
    assert.ok(!disallow.some((d) => d.startsWith("/writing")));
    assert.ok(!disallow.some((d) => d.startsWith("/projects")));
});

// ── Content integrity ──────────────────────────────────────────────────────

test("every post has valid, complete frontmatter", () => {
    for (const p of getAllPosts()) {
        assert.ok(p.frontmatter.title, `${p.slug}: missing title`);
        assert.ok(p.frontmatter.description, `${p.slug}: missing description`);
        assert.ok(
            !Number.isNaN(new Date(p.frontmatter.date).getTime()),
            `${p.slug}: invalid date`
        );
        assert.ok(Array.isArray(p.frontmatter.tags), `${p.slug}: tags must be an array`);
    }
});

test("post descriptions are unique (no shared default description)", () => {
    const descriptions = getAllPosts().map((p) => p.frontmatter.description);
    assert.equal(new Set(descriptions).size, descriptions.length);
});

test("no post body repeats the title as a Markdown H1 (outside code fences)", () => {
    const dir = path.join(process.cwd(), "content/posts");
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"))) {
        const raw = fs.readFileSync(path.join(dir, file), "utf8");
        const body = raw.replace(/^---[\s\S]*?---/, ""); // strip frontmatter
        let inFence = false;
        for (const line of body.split("\n")) {
            if (/^\s*```/.test(line)) inFence = !inFence;
            if (!inFence) {
                assert.ok(
                    !/^# \S/.test(line),
                    `${file}: body contains a level-1 heading "${line.trim()}" (duplicates the rendered <h1>)`
                );
            }
        }
    }
});

// ── Internal linking helpers ───────────────────────────────────────────────

test("related posts share at least one tag and exclude the current post", () => {
    const posts = getAllPosts();
    const withTags = posts.find((p) => (p.frontmatter.tags ?? []).length > 0)!;
    const related = getRelatedPosts(withTags.slug, 3);
    for (const r of related) {
        assert.notEqual(r.slug, withTags.slug);
        const shared = r.frontmatter.tags.filter((t) =>
            withTags.frontmatter.tags.includes(t)
        );
        assert.ok(shared.length > 0);
    }
});

test("adjacent-post navigation is consistent with chronological order", () => {
    const posts = getAllPosts(); // newest-first
    if (posts.length >= 2) {
        const { previous, next } = getAdjacentPosts(posts[1].slug);
        assert.equal(next?.slug, posts[0].slug);
        assert.equal(previous?.slug, posts[2]?.slug ?? undefined);
    }
});
