import { describe, expect, it } from "vitest";
import { Db } from "../src/db.js";
import { writeManualOutbox } from "../src/publishers/substack.js";
import { ALL_TARGETS } from "../src/types.js";
import type { SourceArticle } from "../src/types.js";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const article: SourceArticle = {
  sourceUrl: "https://chemacabeza.dev/writing/kafka-deep-dive",
  slug: "kafka-deep-dive",
  title: "A Practical Guide to Kafka",
  description: "A practical tour of Apache Kafka internals.",
  publishedDate: "2026-06-11",
  tags: ["kafka"],
  html: "<p>Kafka is a distributed log.</p>",
  markdown: "Kafka is a distributed log.",
};

function simulatePublishRun(db: Db): void {
  const now = "2026-06-11T00:00:00.000Z";
  db.upsertSourceArticle(article, now);
  for (const target of ALL_TARGETS) {
    db.upsertPublication(
      {
        sourceUrl: article.sourceUrl,
        target,
        status: "published",
        targetUrl: `https://example.com/${target}`,
      },
      now,
    );
  }
}

describe("idempotency", () => {
  it("re-running publish does not duplicate publication records", () => {
    const db = new Db(":memory:");
    simulatePublishRun(db);
    simulatePublishRun(db);
    simulatePublishRun(db);

    const recs = db.listPublications(article.sourceUrl);
    expect(recs).toHaveLength(ALL_TARGETS.length); // exactly one per target
    expect(new Set(recs.map((r) => r.target)).size).toBe(ALL_TARGETS.length);
    db.close();
  });

  it("upsertSourceArticle reports content change only when content differs", () => {
    const db = new Db(":memory:");
    const now = "2026-06-11T00:00:00.000Z";
    expect(db.upsertSourceArticle(article, now)).toBe(true); // first insert
    expect(db.upsertSourceArticle(article, now)).toBe(false); // unchanged
    expect(
      db.upsertSourceArticle({ ...article, html: "<p>changed</p>" }, now),
    ).toBe(true); // changed
    db.close();
  });
});

describe("substack manual outbox", () => {
  it("writes html/md/json files and a confirm command", () => {
    const dir = mkdtempSync(join(tmpdir(), "crosspost-outbox-"));
    const result = writeManualOutbox(article, dir);

    expect(result.status).toBe("needs_manual_publish");
    const md = readFileSync(result.files.md, "utf8");
    const json = JSON.parse(readFileSync(result.files.json, "utf8"));
    expect(md).toContain(article.title);
    expect(json.canonicalUrl).toBe(article.sourceUrl);
    expect(result.nextCommand).toContain("confirm-substack");
  });
});
