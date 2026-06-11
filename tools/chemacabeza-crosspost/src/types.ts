export type SourceArticle = {
  sourceUrl: string;
  slug: string;
  title: string;
  description: string;
  publishedDate?: string;
  tags: string[];
  html: string;
  markdown: string;
};

export type TargetName = "linkedin" | "medium" | "substack";

export const ALL_TARGETS: TargetName[] = ["linkedin", "medium", "substack"];

export type PublicationStatus =
  | "pending"
  | "published"
  | "verified"
  | "needs_manual_publish"
  | "failed";

export type PublicationRecord = {
  id?: number;
  sourceUrl: string;
  target: TargetName;
  status: PublicationStatus;
  targetUrl?: string;
  externalId?: string;
  error?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
};

/** Outcome returned by a publisher's `publish()` before verification. */
export type PublishOutcome = {
  status: PublicationStatus;
  targetUrl?: string;
  externalId?: string;
  error?: string;
};

/** Outcome returned by a target's `verify()`. */
export type VerifyOutcome = {
  verified: boolean;
  targetUrl?: string;
  error?: string;
};
