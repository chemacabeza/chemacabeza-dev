import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Config } from "../config.js";
import {
  buildSubstackHtml,
  buildSubstackJson,
  buildSubstackMarkdown,
} from "../render.js";
import type { PublishOutcome, SourceArticle, VerifyOutcome } from "../types.js";

export const OUTBOX_DIR = join("outbox", "substack");

export type SubstackOutboxResult = PublishOutcome & {
  files: { html: string; md: string; json: string };
  nextCommand: string;
};

/**
 * Manual mode: write ready-to-paste outbox files and mark the target as
 * needs_manual_publish. Never claims success — Substack has no official
 * publishing API, so a human (or webhook) must finish the job.
 */
export function writeManualOutbox(
  article: SourceArticle,
  dir: string = OUTBOX_DIR,
): SubstackOutboxResult {
  mkdirSync(dir, { recursive: true });
  const htmlPath = join(dir, `${article.slug}.html`);
  const mdPath = join(dir, `${article.slug}.md`);
  const jsonPath = join(dir, `${article.slug}.json`);

  writeFileSync(htmlPath, buildSubstackHtml(article), "utf8");
  writeFileSync(mdPath, buildSubstackMarkdown(article), "utf8");
  writeFileSync(
    jsonPath,
    JSON.stringify(buildSubstackJson(article), null, 2),
    "utf8",
  );

  const nextCommand = `pnpm dev confirm-substack --source "${article.sourceUrl}" --url "<PUBLIC_SUBSTACK_POST_URL>"`;

  return {
    status: "needs_manual_publish",
    files: { html: htmlPath, md: mdPath, json: jsonPath },
    nextCommand,
  };
}

/** Webhook mode: POST normalized JSON, expect `{ url }` back. */
export async function publishViaWebhook(
  article: SourceArticle,
  cfg: Config,
): Promise<PublishOutcome> {
  if (!cfg.SUBSTACK_WEBHOOK_URL) {
    return { status: "failed", error: "SUBSTACK_WEBHOOK_URL is not set." };
  }
  let res: Response;
  try {
    res = await fetch(cfg.SUBSTACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildSubstackJson(article)),
    });
  } catch (err) {
    return { status: "failed", error: (err as Error).message };
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      status: "failed",
      error: `Substack webhook returned ${res.status}: ${text.slice(0, 300)}`,
    };
  }
  const body = (await res.json().catch(() => ({}))) as { url?: string };
  if (!body.url) {
    return {
      status: "failed",
      error: "Substack webhook response did not include a public url.",
    };
  }
  // Published per the webhook, but not yet verified — caller runs verify().
  return { status: "published", targetUrl: body.url };
}

export async function publish(
  article: SourceArticle,
  cfg: Config,
): Promise<PublishOutcome> {
  if (cfg.SUBSTACK_MODE === "webhook") {
    return publishViaWebhook(article, cfg);
  }
  return writeManualOutbox(article);
}

/**
 * Verify a supplied public Substack URL: it must fetch and contain the source
 * article title (and ideally the canonical source URL). A JS-only page that we
 * cannot read counts as unverified — strict mode then fails.
 */
export async function verify(
  targetUrl: string | undefined,
  article: { title: string; sourceUrl: string },
): Promise<VerifyOutcome> {
  if (!targetUrl) {
    return {
      verified: false,
      error: "No public Substack URL supplied. Run confirm-substack first.",
    };
  }
  let res: Response;
  try {
    res = await fetch(targetUrl, {
      headers: { "user-agent": "chemacabeza-crosspost/1.0" },
    });
  } catch (err) {
    return { verified: false, error: (err as Error).message, targetUrl };
  }
  if (!res.ok) {
    return {
      verified: false,
      error: `Substack URL fetch returned ${res.status}.`,
      targetUrl,
    };
  }
  const html = await res.text();
  const hasTitle = html.includes(article.title);
  const hasCanonical = html.includes(article.sourceUrl);
  if (hasTitle && hasCanonical) {
    return { verified: true, targetUrl };
  }
  if (hasTitle) {
    // Title present but canonical missing — accept with a softer guarantee.
    return { verified: true, targetUrl };
  }
  return {
    verified: false,
    error:
      "Substack page did not contain the article title (page may require JavaScript).",
    targetUrl,
  };
}
