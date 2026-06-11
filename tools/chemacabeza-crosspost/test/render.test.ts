import { describe, expect, it } from "vitest";
import {
  buildLinkedinPayload,
  buildMediumHtml,
  buildMediumPayload,
  buildSubstackHtml,
  buildSubstackMarkdown,
  linkedinCommentary,
} from "../src/render.js";
import type { SourceArticle } from "../src/types.js";

const article: SourceArticle = {
  sourceUrl: "https://chemacabeza.dev/writing/kafka-deep-dive",
  slug: "kafka-deep-dive",
  title: "A Practical Guide to Kafka",
  description: "A practical tour of Apache Kafka internals.",
  publishedDate: "2026-06-11",
  tags: ["kafka", "distributed-systems", "streaming", "extra"],
  html: "<p>Kafka is a distributed log.</p>",
  markdown: "Kafka is a distributed log.",
};

describe("LinkedIn payload", () => {
  const payload = buildLinkedinPayload(article, "urn:li:person:ABC");

  it("includes source URL, title and description", () => {
    const content = payload.content as {
      article: { source: string; title: string; description: string };
    };
    expect(content.article.source).toBe(article.sourceUrl);
    expect(content.article.title).toBe(article.title);
    expect(content.article.description).toBe(article.description);
    expect(payload.author).toBe("urn:li:person:ABC");
    expect(payload.lifecycleState).toBe("PUBLISHED");
  });

  it("commentary references the source URL", () => {
    expect(linkedinCommentary(article)).toContain(article.sourceUrl);
    expect(payload.commentary as string).toContain(article.title);
  });
});

describe("Medium payload", () => {
  const payload = buildMediumPayload(article);

  it("sets canonicalUrl to the source URL", () => {
    expect(payload.canonicalUrl).toBe(article.sourceUrl);
    expect(payload.publishStatus).toBe("public");
  });

  it("limits tags to the first three", () => {
    expect(payload.tags).toEqual(["kafka", "distributed-systems", "streaming"]);
  });

  it("html body contains a canonical footer link", () => {
    expect(buildMediumHtml(article)).toContain(article.sourceUrl);
  });
});

describe("Substack render", () => {
  it("markdown includes the canonical source link", () => {
    const md = buildSubstackMarkdown(article);
    expect(md).toContain(article.title);
    expect(md).toContain(`(${article.sourceUrl})`);
  });

  it("html includes a canonical link tag", () => {
    const html = buildSubstackHtml(article);
    expect(html).toContain(`rel="canonical" href="${article.sourceUrl}"`);
  });
});
