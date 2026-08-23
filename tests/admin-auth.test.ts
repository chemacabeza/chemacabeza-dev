import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  isValidAdminCredential,
  isValidAdminSession,
} from "../lib/admin-auth";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => { process.env = { ...ORIGINAL_ENV, ADMIN_DASHBOARD_SECRET: "test-admin-credential-123456" }; });
afterEach(() => { process.env = { ...ORIGINAL_ENV }; });

test("admin credential creates a verifiable derived session", () => {
  assert.equal(isValidAdminCredential("test-admin-credential-123456"), true);
  assert.equal(isValidAdminCredential("incorrect"), false);
  const session = createAdminSessionToken();
  assert.ok(session);
  assert.notEqual(session, process.env.ADMIN_DASHBOARD_SECRET);
  assert.equal(isValidAdminSession(session), true);
  assert.equal(isValidAdminSession("invalid"), false);
  const expired = createAdminSessionToken(Date.now() - ADMIN_SESSION_MAX_AGE_SECONDS * 1000 - 1);
  assert.equal(isValidAdminSession(expired ?? undefined), false);
});

test("admin authentication fails closed when configuration is absent or too short", () => {
  delete process.env.ADMIN_DASHBOARD_SECRET;
  assert.equal(createAdminSessionToken(), null);
  assert.equal(isValidAdminCredential("anything"), false);
  process.env.ADMIN_DASHBOARD_SECRET = "short";
  assert.equal(isValidAdminSession("anything"), false);
});
