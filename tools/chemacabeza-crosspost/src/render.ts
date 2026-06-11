import * as cheerio from "cheerio";
import type { SourceArticle } from "./types.js";

/**
 * Minimal, dependency-light HTML → Markdown conversion. Good enough to seed
 * Substack/Medium drafts; not a full CommonMark renderer.
 */
export function htmlToMarkdown(html: string): string {
  if (!html.trim()) return "";
  const $ = cheerio.load(html);

  const render = (el: cheerio.Cheerio<any>): string =>
    el
      .contents()
      .toArray()
      .map((node) => nodeToMd($, node))
      .join("");

  const nodeToMd = (
    $: cheerio.CheerioAPI,
    node: any,
  ): string => {
    if (node.type === "text") return node.data ?? "";
    if (node.type !== "tag") return "";
    const $el = $(node);
    const inner = render($el);
    switch (node.name) {
      case "h1":
        return `\n# ${inner.trim()}\n\n`;
      case "h2":
        return `\n## ${inner.trim()}\n\n`;
      case "h3":
        return `\n### ${inner.trim()}\n\n`;
      case "h4":
        return `\n#### ${inner.trim()}\n\n`;
      case "p":
        return `\n${inner.trim()}\n\n`;
      case "br":
        return "\n";
      case "strong":
      case "b":
        return `**${inner.trim()}**`;
      case "em":
      case "i":
        return `*${inner.trim()}*`;
      case "code":
        return `\`${inner.trim()}\``;
      case "pre":
        return `\n\`\`\`\n${$el.text().replace(/\n$/, "")}\n\`\`\`\n\n`;
      case "a": {
        const href = $el.attr("href") ?? "";
        return `[${inner.trim()}](${href})`;
      }
      case "ul":
        return `\n${$el
          .children("li")
          .toArray()
          .map((li) => `- ${render($(li)).trim()}`)
          .join("\n")}\n\n`;
      case "ol":
        return `\n${$el
          .children("li")
          .toArray()
          .map((li, i) => `${i + 1}. ${render($(li)).trim()}`)
          .join("\n")}\n\n`;
      case "blockquote":
        return `\n> ${inner.trim().replace(/\n/g, "\n> ")}\n\n`;
      case "img": {
        const src = $el.attr("src") ?? "";
        const alt = $el.attr("alt") ?? "";
        return `![${alt}](${src})`;
      }
      default:
        return inner;
    }
  };

  return render($.root())
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** The commentary text body for a LinkedIn post. */
export function linkedinCommentary(article: SourceArticle): string {
  return `New article: ${article.title}\n\n${article.description}\n\nRead it here: ${article.sourceUrl}`;
}

/**
 * The LinkedIn Posts API payload (article/link post pointing at the canonical
 * source). Exported pure so tests can assert its contents without a network call.
 */
export function buildLinkedinPayload(
  article: SourceArticle,
  personUrn: string,
): Record<string, unknown> {
  return {
    author: personUrn,
    commentary: linkedinCommentary(article),
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    content: {
      article: {
        source: article.sourceUrl,
        title: article.title,
        description: article.description,
      },
    },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
  };
}

/** HTML body for Medium: title heading, article body, canonical footer. */
export function buildMediumHtml(article: SourceArticle): string {
  const footer = `<hr><p><em>Originally published at <a href="${article.sourceUrl}">${article.sourceUrl}</a>.</em></p>`;
  return `<h1>${article.title}</h1>\n${article.html}\n${footer}`;
}

/** The Medium create-post payload. Exported pure for testing. */
export function buildMediumPayload(
  article: SourceArticle,
): Record<string, unknown> {
  return {
    title: article.title,
    contentFormat: "html",
    content: buildMediumHtml(article),
    canonicalUrl: article.sourceUrl,
    tags: article.tags.slice(0, 3),
    publishStatus: "public",
    notifyFollowers: false,
  };
}

/** Self-contained HTML document for the Substack manual outbox. */
export function buildSubstackHtml(article: SourceArticle): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${article.title}</title>
<link rel="canonical" href="${article.sourceUrl}">
</head>
<body>
<h1>${article.title}</h1>
<p>${article.description}</p>
${article.html}
<hr>
<p><em>Originally published at <a href="${article.sourceUrl}">${article.sourceUrl}</a>.</em></p>
</body>
</html>`;
}

/** Markdown body for the Substack manual outbox, including a canonical link. */
export function buildSubstackMarkdown(article: SourceArticle): string {
  return `# ${article.title}

${article.description}

${article.markdown}

---

*Originally published at [${article.sourceUrl}](${article.sourceUrl}).*
`;
}

/** Normalized JSON used for both the manual outbox and the webhook body. */
export function buildSubstackJson(
  article: SourceArticle,
): Record<string, unknown> {
  return {
    title: article.title,
    description: article.description,
    canonicalUrl: article.sourceUrl,
    slug: article.slug,
    publishedDate: article.publishedDate ?? null,
    suggestedTags: article.tags,
    contentHtml: buildSubstackHtml(article),
    contentMarkdown: article.markdown,
  };
}
