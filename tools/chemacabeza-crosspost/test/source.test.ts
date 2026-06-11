import { describe, expect, it } from "vitest";
import {
  normalizeUrl,
  parseArticle,
  parseWritingIndex,
  slugFromUrl,
} from "../src/source.js";

const BASE = "https://chemacabeza.dev/writing";

const INDEX_HTML = `
<!doctype html><html><body>
  <nav><a href="/">Home</a><a href="/writing">Writing</a></nav>
  <main>
    <ul>
      <li><a href="/writing/kafka-deep-dive">Kafka deep dive</a></li>
      <li><a href="https://chemacabeza.dev/writing/feynman-guide-to-vim">Vim</a></li>
      <li><a href="/writing/kafka-deep-dive#section">dup with hash</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="https://twitter.com/chemacabeza">Twitter</a></li>
    </ul>
  </main>
</body></html>`;

const ARTICLE_HTML = `
<!doctype html><html><head>
  <meta name="description" content="A practical tour of Apache Kafka internals.">
  <meta property="article:tag" content="kafka">
  <meta property="article:tag" content="distributed-systems">
</head><body>
  <article>
    <h1>A Practical Guide to Kafka</h1>
    <time datetime="2026-06-11">June 11, 2026</time>
    <p>Kafka is a distributed log. This post explains the internals.</p>
    <p>Second paragraph with <a href="https://example.com">a link</a>.</p>
  </article>
</body></html>`;

describe("parseWritingIndex", () => {
  it("extracts unique, normalized /writing/<slug> links", () => {
    const urls = parseWritingIndex(INDEX_HTML, BASE);
    expect(urls).toContain("https://chemacabeza.dev/writing/kafka-deep-dive");
    expect(urls).toContain(
      "https://chemacabeza.dev/writing/feynman-guide-to-vim",
    );
    // hash variant collapses to the same URL (deduped)
    expect(
      urls.filter((u) => u.endsWith("/writing/kafka-deep-dive")).length,
    ).toBe(1);
    // non-article links excluded
    expect(urls.some((u) => u.includes("/about"))).toBe(false);
    expect(urls.some((u) => u.includes("twitter.com"))).toBe(false);
  });
});

describe("parseArticle", () => {
  const url = "https://chemacabeza.dev/writing/kafka-deep-dive";
  const article = parseArticle(ARTICLE_HTML, url);

  it("parses title, description, date, tags and slug", () => {
    expect(article.title).toBe("A Practical Guide to Kafka");
    expect(article.description).toBe(
      "A practical tour of Apache Kafka internals.",
    );
    expect(article.publishedDate).toBe("2026-06-11");
    expect(article.tags).toContain("kafka");
    expect(article.tags).toContain("distributed-systems");
    expect(article.slug).toBe("kafka-deep-dive");
    expect(article.sourceUrl).toBe(url);
  });

  it("captures the article body as html and markdown", () => {
    expect(article.html).toContain("distributed log");
    expect(article.markdown).toContain("distributed log");
    expect(article.markdown).toContain("[a link](https://example.com)");
  });
});

describe("url helpers", () => {
  it("normalizeUrl strips hash and trailing slash", () => {
    expect(normalizeUrl("/writing/x/#h", BASE)).toBe(
      "https://chemacabeza.dev/writing/x",
    );
  });
  it("slugFromUrl takes the last path segment", () => {
    expect(slugFromUrl("https://chemacabeza.dev/writing/my-post")).toBe(
      "my-post",
    );
  });
});
