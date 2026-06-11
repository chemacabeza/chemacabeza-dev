import { loadConfig, type Config } from "./config.js";
import { Db } from "./db.js";
import { scanArticles } from "./source.js";
import * as linkedin from "./publishers/linkedin.js";
import * as medium from "./publishers/medium.js";
import * as substack from "./publishers/substack.js";
import { isArticleComplete, verifyAndPersist, verifyAllPending } from "./verify.js";
import { ALL_TARGETS } from "./types.js";
import type { PublishOutcome, SourceArticle, TargetName } from "./types.js";

function nowIso(): string {
  return new Date().toISOString();
}

function getFlag(argv: string[], name: string): boolean {
  return argv.includes(`--${name}`);
}

function getOption(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(`--${name}`);
  if (i >= 0 && i + 1 < argv.length) return argv[i + 1];
  return undefined;
}

function log(msg: string): void {
  process.stdout.write(`${msg}\n`);
}

async function cmdScan(cfg: Config): Promise<void> {
  const articles = await scanArticles(cfg.SOURCE_URL);
  log(`Discovered ${articles.length} article(s) from ${cfg.SOURCE_URL}:\n`);
  for (const a of articles) {
    log(`• ${a.title}`);
    log(`  ${a.sourceUrl}`);
    log(`  slug=${a.slug}  date=${a.publishedDate ?? "—"}  tags=[${a.tags.join(", ")}]`);
    log("");
  }
}

async function publishOne(
  target: TargetName,
  article: SourceArticle,
  cfg: Config,
): Promise<PublishOutcome> {
  switch (target) {
    case "linkedin":
      return linkedin.publish(article, cfg);
    case "medium":
      return medium.publish(article, cfg);
    case "substack":
      return substack.publish(article, cfg);
  }
}

async function cmdPublish(cfg: Config, argv: string[]): Promise<number> {
  const dryRun = getFlag(argv, "dry-run") || cfg.DRY_RUN;
  const strict = getFlag(argv, "strict");
  const db = new Db(cfg.SQLITE_PATH);

  try {
    const articles = await scanArticles(cfg.SOURCE_URL);
    log(`Scanned ${articles.length} article(s). dryRun=${dryRun} strict=${strict}\n`);

    let unverifiedTargets = 0;

    for (const article of articles) {
      const now = nowIso();
      db.upsertSourceArticle(article, now);
      log(`# ${article.title}`);

      for (const target of ALL_TARGETS) {
        const existing = db.getPublication(article.sourceUrl, target);
        if (existing?.status === "verified") {
          log(`  [${target}] already verified → skip`);
          continue;
        }

        if (dryRun) {
          log(`  [${target}] would publish (dry-run)`);
          unverifiedTargets++;
          continue;
        }

        // Publish (or re-attempt). Webhook/manual outbox handled per-publisher.
        const outcome = await publishOne(target, article, cfg);
        db.upsertPublication(
          {
            sourceUrl: article.sourceUrl,
            target,
            status: outcome.status,
            targetUrl: outcome.targetUrl,
            externalId: outcome.externalId,
            error: outcome.error,
          },
          nowIso(),
        );
        log(
          `  [${target}] ${outcome.status}` +
            (outcome.targetUrl ? ` → ${outcome.targetUrl}` : "") +
            (outcome.error ? ` (${outcome.error})` : ""),
        );

        if (target === "substack" && outcome.status === "needs_manual_publish") {
          const r = outcome as substack.SubstackOutboxResult;
          log(`      outbox: ${r.files.md}`);
          log(`      next:   ${r.nextCommand}`);
        }

        // If the publish step reports "published", attempt verification now.
        if (outcome.status === "published") {
          const rec = db.getPublication(article.sourceUrl, target)!;
          const v = await verifyAndPersist(db, rec, cfg, nowIso());
          log(
            `  [${target}] verify → ${v.verified ? "verified" : "UNVERIFIED"}` +
              (v.error ? ` (${v.error})` : ""),
          );
          if (!v.verified) unverifiedTargets++;
        } else {
          unverifiedTargets++;
        }
      }

      log(
        isArticleComplete(db, article.sourceUrl)
          ? `  ✓ complete (all targets verified)\n`
          : `  … incomplete\n`,
      );
    }

    if (strict && unverifiedTargets > 0) {
      log(
        `\nstrict mode: ${unverifiedTargets} target(s) not verified → exit 1`,
      );
      return 1;
    }
    return 0;
  } finally {
    db.close();
  }
}

async function cmdVerify(cfg: Config, strict: boolean): Promise<number> {
  const db = new Db(cfg.SQLITE_PATH);
  try {
    const recs = await verifyAllPending(db, cfg, nowIso());
    let unverified = 0;
    for (const r of recs) {
      const ok = r.status === "verified";
      if (!ok) unverified++;
      log(
        `[${r.target}] ${r.sourceUrl} → ${r.status}` +
          (r.error ? ` (${r.error})` : ""),
      );
    }
    if (strict && unverified > 0) {
      log(`\nstrict mode: ${unverified} target(s) not verified → exit 1`);
      return 1;
    }
    return 0;
  } finally {
    db.close();
  }
}

async function cmdConfirmSubstack(
  cfg: Config,
  argv: string[],
): Promise<number> {
  const source = getOption(argv, "source");
  const url = getOption(argv, "url");
  if (!source || !url) {
    log(
      'Usage: pnpm dev confirm-substack --source "<canonicalSourceUrl>" --url "<publicSubstackUrl>"',
    );
    return 2;
  }
  const db = new Db(cfg.SQLITE_PATH);
  try {
    const meta = db.getSourceMeta(source);
    if (!meta) {
      log(`No known source article for ${source}. Run scan/publish first.`);
      return 2;
    }
    const now = nowIso();
    db.upsertPublication(
      {
        sourceUrl: source,
        target: "substack",
        status: "published",
        targetUrl: url,
      },
      now,
    );
    const v = await substack.verify(url, {
      title: meta.title,
      sourceUrl: source,
    });
    if (v.verified) {
      db.upsertPublication(
        {
          sourceUrl: source,
          target: "substack",
          status: "verified",
          targetUrl: url,
          verifiedAt: now,
        },
        now,
      );
      log(`✓ Substack verified for ${source} → ${url}`);
      return 0;
    }
    db.setStatus(source, "substack", "published", now);
    log(`✗ Could not verify ${url}: ${v.error}`);
    return 1;
  } finally {
    db.close();
  }
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const command = argv[0];
  const cfg = loadConfig();

  let code = 0;
  switch (command) {
    case "scan":
      await cmdScan(cfg);
      break;
    case "publish":
      code = await cmdPublish(cfg, argv);
      break;
    case "verify":
      code = await cmdVerify(cfg, getFlag(argv, "strict"));
      break;
    case "confirm-substack":
      code = await cmdConfirmSubstack(cfg, argv);
      break;
    default:
      log("chemacabeza-crosspost");
      log("Commands:");
      log("  scan                         Discover and print source articles");
      log("  publish --dry-run            Show planned actions");
      log("  publish --strict             Publish, verify, exit 1 if any unverified");
      log("  verify [--strict]            Re-verify pending records");
      log('  confirm-substack --source <url> --url <url>   Attach + verify a Substack URL');
      code = command ? 1 : 0;
  }
  process.exitCode = code;
}

main().catch((err) => {
  process.stderr.write(`fatal: ${(err as Error).stack ?? err}\n`);
  process.exitCode = 1;
});
