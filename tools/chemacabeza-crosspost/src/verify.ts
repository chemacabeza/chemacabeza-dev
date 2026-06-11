import type { Config } from "./config.js";
import type { Db } from "./db.js";
import * as linkedin from "./publishers/linkedin.js";
import * as medium from "./publishers/medium.js";
import * as substack from "./publishers/substack.js";
import { ALL_TARGETS } from "./types.js";
import type { PublicationRecord, VerifyOutcome } from "./types.js";

/** Run the target-appropriate verification for a single publication record. */
export async function verifyRecord(
  db: Db,
  rec: PublicationRecord,
  cfg: Config,
): Promise<VerifyOutcome> {
  const meta = db.getSourceMeta(rec.sourceUrl);
  const title = meta?.title ?? "";

  switch (rec.target) {
    case "linkedin":
      return linkedin.verify(rec.externalId, cfg);
    case "medium":
      return medium.verify(rec.targetUrl, { title });
    case "substack":
      return substack.verify(rec.targetUrl, {
        title,
        sourceUrl: rec.sourceUrl,
      });
    default:
      return { verified: false, error: `Unknown target ${rec.target}.` };
  }
}

/** Verify a record and persist the resulting status. Returns the new status. */
export async function verifyAndPersist(
  db: Db,
  rec: PublicationRecord,
  cfg: Config,
  now: string,
): Promise<VerifyOutcome> {
  const outcome = await verifyRecord(db, rec, cfg);
  if (outcome.verified) {
    db.upsertPublication(
      {
        sourceUrl: rec.sourceUrl,
        target: rec.target,
        status: "verified",
        targetUrl: outcome.targetUrl ?? rec.targetUrl,
        externalId: rec.externalId,
        verifiedAt: now,
      },
      now,
    );
  } else {
    db.upsertPublication(
      {
        sourceUrl: rec.sourceUrl,
        target: rec.target,
        // Keep needs_manual_publish where it applies; otherwise leave as-is.
        status: rec.status === "verified" ? "published" : rec.status,
        targetUrl: rec.targetUrl,
        externalId: rec.externalId,
        error: outcome.error,
      },
      now,
    );
  }
  return outcome;
}

/** True only when all three targets for a source article are verified. */
export function isArticleComplete(db: Db, sourceUrl: string): boolean {
  const recs = db.listPublications(sourceUrl);
  const byTarget = new Map(recs.map((r) => [r.target, r.status]));
  return ALL_TARGETS.every((t) => byTarget.get(t) === "verified");
}

/** Re-verify every publication that is not already verified. */
export async function verifyAllPending(
  db: Db,
  cfg: Config,
  now: string,
): Promise<PublicationRecord[]> {
  const pending = db
    .listPublications()
    .filter((r) => r.status !== "verified");
  for (const rec of pending) {
    await verifyAndPersist(db, rec, cfg, now);
  }
  return db.listPublications();
}
