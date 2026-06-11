import { createHash } from "node:crypto";
import { dirname } from "node:path";
import { mkdirSync } from "node:fs";
import Database from "better-sqlite3";
import type {
  PublicationRecord,
  PublicationStatus,
  SourceArticle,
  TargetName,
} from "./types.js";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS source_articles (
  source_url TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  published_date TEXT,
  content_hash TEXT NOT NULL,
  first_seen_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS publications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_url TEXT NOT NULL,
  target TEXT NOT NULL,
  status TEXT NOT NULL,
  target_url TEXT,
  external_id TEXT,
  error TEXT,
  verified_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(source_url, target)
);
`;

export function contentHash(article: SourceArticle): string {
  return createHash("sha256")
    .update(`${article.title}\n${article.description}\n${article.html}`)
    .digest("hex");
}

export class Db {
  private readonly sqlite: Database.Database;

  constructor(path: string) {
    if (path !== ":memory:") {
      mkdirSync(dirname(path), { recursive: true });
    }
    this.sqlite = new Database(path);
    this.sqlite.pragma("journal_mode = WAL");
    this.sqlite.exec(SCHEMA);
  }

  close(): void {
    this.sqlite.close();
  }

  /** Insert or refresh a source article. Returns true when the content changed. */
  upsertSourceArticle(article: SourceArticle, now: string): boolean {
    const hash = contentHash(article);
    const existing = this.sqlite
      .prepare(
        `SELECT content_hash AS contentHash FROM source_articles WHERE source_url = ?`,
      )
      .get(article.sourceUrl) as { contentHash: string } | undefined;

    if (!existing) {
      this.sqlite
        .prepare(
          `INSERT INTO source_articles
             (source_url, slug, title, description, published_date, content_hash, first_seen_at, updated_at)
           VALUES (@sourceUrl, @slug, @title, @description, @publishedDate, @hash, @now, @now)`,
        )
        .run({
          sourceUrl: article.sourceUrl,
          slug: article.slug,
          title: article.title,
          description: article.description,
          publishedDate: article.publishedDate ?? null,
          hash,
          now,
        });
      return true;
    }

    const changed = existing.contentHash !== hash;
    this.sqlite
      .prepare(
        `UPDATE source_articles
           SET slug = @slug, title = @title, description = @description,
               published_date = @publishedDate, content_hash = @hash, updated_at = @now
         WHERE source_url = @sourceUrl`,
      )
      .run({
        sourceUrl: article.sourceUrl,
        slug: article.slug,
        title: article.title,
        description: article.description,
        publishedDate: article.publishedDate ?? null,
        hash,
        now,
      });
    return changed;
  }

  getSourceMeta(
    sourceUrl: string,
  ): { sourceUrl: string; slug: string; title: string } | undefined {
    return this.sqlite
      .prepare(
        `SELECT source_url AS sourceUrl, slug, title FROM source_articles WHERE source_url = ?`,
      )
      .get(sourceUrl) as
      | { sourceUrl: string; slug: string; title: string }
      | undefined;
  }

  getPublication(
    sourceUrl: string,
    target: TargetName,
  ): PublicationRecord | undefined {
    const row = this.sqlite
      .prepare(
        `SELECT id, source_url AS sourceUrl, target, status, target_url AS targetUrl,
                external_id AS externalId, error, verified_at AS verifiedAt,
                created_at AS createdAt, updated_at AS updatedAt
           FROM publications WHERE source_url = ? AND target = ?`,
      )
      .get(sourceUrl, target) as PublicationRecord | undefined;
    return row;
  }

  listPublications(sourceUrl?: string): PublicationRecord[] {
    const base = `SELECT id, source_url AS sourceUrl, target, status, target_url AS targetUrl,
                         external_id AS externalId, error, verified_at AS verifiedAt,
                         created_at AS createdAt, updated_at AS updatedAt
                  FROM publications`;
    if (sourceUrl) {
      return this.sqlite
        .prepare(`${base} WHERE source_url = ? ORDER BY target`)
        .all(sourceUrl) as PublicationRecord[];
    }
    return this.sqlite
      .prepare(`${base} ORDER BY source_url, target`)
      .all() as PublicationRecord[];
  }

  /**
   * Idempotent upsert keyed on (source_url, target). Re-running never creates a
   * duplicate row — it updates the existing one in place.
   */
  upsertPublication(
    rec: Pick<PublicationRecord, "sourceUrl" | "target" | "status"> &
      Partial<
        Pick<
          PublicationRecord,
          "targetUrl" | "externalId" | "error" | "verifiedAt"
        >
      >,
    now: string,
  ): PublicationRecord {
    this.sqlite
      .prepare(
        `INSERT INTO publications
           (source_url, target, status, target_url, external_id, error, verified_at, created_at, updated_at)
         VALUES (@sourceUrl, @target, @status, @targetUrl, @externalId, @error, @verifiedAt, @now, @now)
         ON CONFLICT(source_url, target) DO UPDATE SET
           status = excluded.status,
           target_url = COALESCE(excluded.target_url, publications.target_url),
           external_id = COALESCE(excluded.external_id, publications.external_id),
           error = excluded.error,
           verified_at = COALESCE(excluded.verified_at, publications.verified_at),
           updated_at = excluded.updated_at`,
      )
      .run({
        sourceUrl: rec.sourceUrl,
        target: rec.target,
        status: rec.status,
        targetUrl: rec.targetUrl ?? null,
        externalId: rec.externalId ?? null,
        error: rec.error ?? null,
        verifiedAt: rec.verifiedAt ?? null,
        now,
      });

    return this.getPublication(rec.sourceUrl, rec.target)!;
  }

  setStatus(
    sourceUrl: string,
    target: TargetName,
    status: PublicationStatus,
    now: string,
  ): void {
    this.sqlite
      .prepare(
        `UPDATE publications SET status = ?, updated_at = ? WHERE source_url = ? AND target = ?`,
      )
      .run(status, now, sourceUrl, target);
  }
}
