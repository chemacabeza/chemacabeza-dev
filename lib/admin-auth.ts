import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "chemacabeza_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

function configuredSecret(): string | null {
  const secret = process.env.ADMIN_DASHBOARD_SECRET?.trim();
  return secret && secret.length >= 16 ? secret : null;
}

function digest(value: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(value).digest();
}

function sessionToken(secret: string, expiresAt: number): string {
  const signature = createHmac("sha256", secret)
    .update(`chemacabeza-admin-session.v1:${expiresAt}`)
    .digest("base64url");
  return `${expiresAt}.${signature}`;
}

export function isValidAdminCredential(candidate: string): boolean {
  const secret = configuredSecret();
  if (!secret) return false;
  return timingSafeEqual(digest(candidate, secret), digest(secret, secret));
}

export function createAdminSessionToken(now = Date.now()): string | null {
  const secret = configuredSecret();
  const expiresAt = now + ADMIN_SESSION_MAX_AGE_SECONDS * 1000;
  return secret ? sessionToken(secret, expiresAt) : null;
}

export function isValidAdminSession(candidate: string | undefined, now = Date.now()): boolean {
  const secret = configuredSecret();
  if (!secret || !candidate) return false;
  const [expiresRaw, signature, extra] = candidate.split(".");
  const expiresAt = Number(expiresRaw);
  if (extra !== undefined || !signature || !Number.isSafeInteger(expiresAt) || expiresAt <= now) return false;
  return timingSafeEqual(digest(candidate, secret), digest(sessionToken(secret, expiresAt), secret));
}
