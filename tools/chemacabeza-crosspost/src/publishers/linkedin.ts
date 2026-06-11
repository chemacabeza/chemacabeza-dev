import type { Config } from "../config.js";
import { buildLinkedinPayload } from "../render.js";
import type { PublishOutcome, SourceArticle, VerifyOutcome } from "../types.js";

const REST_BASE = "https://api.linkedin.com/rest";

function headers(cfg: Config): Record<string, string> {
  return {
    Authorization: `Bearer ${cfg.LINKEDIN_ACCESS_TOKEN}`,
    "LinkedIn-Version": cfg.LINKEDIN_VERSION,
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json",
  };
}

/** Best-effort public URL for a share/ugcPost URN; otherwise undefined. */
export function publicUrlForUrn(urn: string): string | undefined {
  // e.g. urn:li:share:7211... -> https://www.linkedin.com/feed/update/urn:li:share:7211...
  if (/^urn:li:(share|ugcPost):\d+$/.test(urn)) {
    return `https://www.linkedin.com/feed/update/${urn}`;
  }
  return undefined;
}

export async function publish(
  article: SourceArticle,
  cfg: Config,
): Promise<PublishOutcome> {
  if (!cfg.linkedinEnabled) {
    return {
      status: "failed",
      error: "LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_URN are required.",
    };
  }

  const res = await fetch(`${REST_BASE}/posts`, {
    method: "POST",
    headers: headers(cfg),
    body: JSON.stringify(buildLinkedinPayload(article, cfg.LINKEDIN_PERSON_URN)),
  });

  if (res.status !== 201) {
    const text = await res.text().catch(() => "");
    return {
      status: "failed",
      error: `LinkedIn create returned ${res.status}: ${text.slice(0, 500)}`,
    };
  }

  const urn = res.headers.get("x-restli-id") ?? undefined;
  if (!urn) {
    return {
      status: "failed",
      error: "LinkedIn returned 201 but no x-restli-id header.",
    };
  }

  return {
    status: "published",
    externalId: urn,
    targetUrl: publicUrlForUrn(urn),
  };
}

/**
 * Verify by reading the post back by encoded URN. Requires a token with read
 * scope; without it we cannot confirm, and strict mode must treat that as a
 * failure (handled by the caller).
 */
export async function verify(
  externalId: string | undefined,
  cfg: Config,
): Promise<VerifyOutcome> {
  if (!externalId) {
    return { verified: false, error: "No LinkedIn URN stored to verify." };
  }
  const encoded = encodeURIComponent(externalId);
  let res: Response;
  try {
    res = await fetch(`${REST_BASE}/posts/${encoded}`, {
      method: "GET",
      headers: headers(cfg),
    });
  } catch (err) {
    return { verified: false, error: (err as Error).message };
  }

  if (res.status === 403) {
    return {
      verified: false,
      error:
        "LinkedIn publish succeeded but API verification requires read permission.",
    };
  }
  if (!res.ok) {
    return {
      verified: false,
      error: `LinkedIn read returned ${res.status}.`,
    };
  }

  const body = (await res.json().catch(() => ({}))) as {
    lifecycleState?: string;
  };
  if (body.lifecycleState === "PUBLISHED") {
    return { verified: true, targetUrl: publicUrlForUrn(externalId) };
  }
  return {
    verified: false,
    error: `LinkedIn lifecycleState is ${body.lifecycleState ?? "unknown"}.`,
  };
}
