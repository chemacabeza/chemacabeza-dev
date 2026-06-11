import type { Config } from "../config.js";
import { buildMediumPayload } from "../render.js";
import type { PublishOutcome, SourceArticle, VerifyOutcome } from "../types.js";

const API_BASE = "https://api.medium.com/v1";

function headers(cfg: Config): Record<string, string> {
  return {
    Authorization: `Bearer ${cfg.MEDIUM_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

type MeResponse = {
  data?: { id?: string; username?: string; name?: string };
};

type CreatePostResponse = {
  data?: {
    id?: string;
    url?: string;
    canonicalUrl?: string;
    publishStatus?: string;
  };
};

/** Confirm the token belongs to chemacabeza and return the author id. */
async function getAuthorId(cfg: Config): Promise<string> {
  const res = await fetch(`${API_BASE}/me`, { headers: headers(cfg) });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Medium /me returned ${res.status}: ${text.slice(0, 300)}`);
  }
  const body = (await res.json()) as MeResponse;
  const id = body.data?.id;
  const username = (body.data?.username ?? "").toLowerCase();
  if (!id) {
    throw new Error("Medium /me did not return a user id.");
  }
  if (!username.includes("chemacabeza")) {
    throw new Error(
      `Medium token belongs to "${username || "unknown"}", expected chemacabeza. Refusing to publish.`,
    );
  }
  return id;
}

export async function publish(
  article: SourceArticle,
  cfg: Config,
): Promise<PublishOutcome> {
  if (!cfg.mediumEnabled) {
    return {
      status: "failed",
      error:
        "Medium API token missing; Medium no longer issues new integration tokens.",
    };
  }

  let authorId: string;
  try {
    authorId = await getAuthorId(cfg);
  } catch (err) {
    return { status: "failed", error: (err as Error).message };
  }

  const res = await fetch(`${API_BASE}/users/${authorId}/posts`, {
    method: "POST",
    headers: headers(cfg),
    body: JSON.stringify(buildMediumPayload(article)),
  });

  if (res.status !== 201 && res.status !== 200) {
    const text = await res.text().catch(() => "");
    return {
      status: "failed",
      error: `Medium create returned ${res.status}: ${text.slice(0, 500)}`,
    };
  }

  const body = (await res.json().catch(() => ({}))) as CreatePostResponse;
  const data = body.data ?? {};

  if (data.publishStatus !== "public") {
    return {
      status: "failed",
      error: `Medium publishStatus is "${data.publishStatus}", expected "public".`,
      targetUrl: data.url,
      externalId: data.id,
    };
  }
  if (data.canonicalUrl && data.canonicalUrl !== article.sourceUrl) {
    return {
      status: "failed",
      error: `Medium canonicalUrl "${data.canonicalUrl}" != source "${article.sourceUrl}".`,
      targetUrl: data.url,
      externalId: data.id,
    };
  }

  return { status: "published", targetUrl: data.url, externalId: data.id };
}

/** Verify the public Medium URL fetches and contains the article title. */
export async function verify(
  targetUrl: string | undefined,
  article: { title: string },
): Promise<VerifyOutcome> {
  if (!targetUrl) {
    return { verified: false, error: "No Medium URL stored to verify." };
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
      error: `Medium URL fetch returned ${res.status}.`,
      targetUrl,
    };
  }
  const html = await res.text();
  if (html.includes(article.title)) {
    return { verified: true, targetUrl };
  }
  return {
    verified: false,
    error: "Medium page did not contain the article title.",
    targetUrl,
  };
}
