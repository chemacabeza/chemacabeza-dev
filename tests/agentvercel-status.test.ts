import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  fetchAgentVercelStatus,
  validateAgentVercelStatusResponse,
  NEUTRAL_UNAVAILABLE_STATUS,
} from "../lib/agentvercel";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

test("validateAgentVercelStatusResponse validates valid status object", () => {
  const validPayload = {
    available: true,
    lastSuccessfulReportTime: "2026-08-22T08:00:00.000Z",
    lastReportChangeCount: 2,
    warningCount: 0,
  };

  const result = validateAgentVercelStatusResponse(validPayload);
  assert.ok(result);
  assert.equal(result.available, true);
  assert.equal(result.lastSuccessfulReportTime, "2026-08-22T08:00:00.000Z");
  assert.equal(result.lastReportChangeCount, 2);
  assert.equal(result.warningCount, 0);
});

test("validateAgentVercelStatusResponse accepts timestamp numbers and status strings", () => {
  const payload = {
    status: "ok",
    timestamp: 1787385600000,
    changeCount: 5,
    warningsCount: 1,
  };

  const result = validateAgentVercelStatusResponse(payload);
  assert.ok(result);
  assert.equal(result.available, true);
  assert.ok(result.lastSuccessfulReportTime?.includes("2026"));
  assert.equal(result.lastReportChangeCount, 5);
  assert.equal(result.warningCount, 1);
});

test("validateAgentVercelStatusResponse rejects invalid schemas", () => {
  assert.equal(validateAgentVercelStatusResponse(null), null);
  assert.equal(validateAgentVercelStatusResponse("invalid"), null);
  assert.equal(validateAgentVercelStatusResponse({ available: "not-a-boolean" }), null);
  assert.equal(
    validateAgentVercelStatusResponse({ available: true, lastReportChangeCount: -1 }),
    null
  );
  assert.equal(
    validateAgentVercelStatusResponse({ available: true, lastReportChangeCount: "two" }),
    null
  );
});

test("fetchAgentVercelStatus returns neutral state when env variables are missing", async () => {
  delete process.env.AGENTVERCEL_REPORTER_URL;
  delete process.env.AGENTVERCEL_STATUS_SECRET;

  const result = await fetchAgentVercelStatus();
  assert.deepEqual(result, NEUTRAL_UNAVAILABLE_STATUS);
});

test("fetchAgentVercelStatus succeeds with valid response and auth header", async () => {
  process.env.AGENTVERCEL_REPORTER_URL = "https://reporter.test.example";
  process.env.AGENTVERCEL_STATUS_SECRET = "super-secret-status-token";

  const originalFetch = globalThis.fetch;
  let capturedUrl = "";
  let capturedHeaders: Record<string, string> = {};

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    capturedUrl = input.toString();
    capturedHeaders = (init?.headers as Record<string, string>) || {};

    return new Response(
      JSON.stringify({
        available: true,
        lastSuccessfulReportTime: "2026-08-22T08:00:00.000Z",
        lastReportChangeCount: 4,
        warningCount: 0,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }) as typeof fetch;

  try {
    const result = await fetchAgentVercelStatus();
    assert.equal(capturedUrl, "https://reporter.test.example/api/status");
    assert.equal(capturedHeaders.Authorization, "Bearer super-secret-status-token");
    assert.equal(result.available, true);
    assert.equal(result.lastReportChangeCount, 4);
    assert.equal(result.warningCount, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fetchAgentVercelStatus fails closed on authentication failure (401/403)", async () => {
  process.env.AGENTVERCEL_REPORTER_URL = "https://reporter.test.example";
  process.env.AGENTVERCEL_STATUS_SECRET = "wrong-token";

  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async () => {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }) as typeof fetch;

  try {
    const result = await fetchAgentVercelStatus();
    assert.deepEqual(result, NEUTRAL_UNAVAILABLE_STATUS);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fetchAgentVercelStatus fails closed on unavailable service (500/503)", async () => {
  process.env.AGENTVERCEL_REPORTER_URL = "https://reporter.test.example";
  process.env.AGENTVERCEL_STATUS_SECRET = "valid-token";

  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async () => {
    return new Response(JSON.stringify({ error: "Internal Error" }), { status: 503 });
  }) as typeof fetch;

  try {
    const result = await fetchAgentVercelStatus();
    assert.deepEqual(result, NEUTRAL_UNAVAILABLE_STATUS);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fetchAgentVercelStatus fails closed on network failure or throw", async () => {
  process.env.AGENTVERCEL_REPORTER_URL = "https://reporter.test.example";
  process.env.AGENTVERCEL_STATUS_SECRET = "valid-token";

  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async () => {
    throw new TypeError("Failed to fetch");
  }) as typeof fetch;

  try {
    const result = await fetchAgentVercelStatus();
    assert.deepEqual(result, NEUTRAL_UNAVAILABLE_STATUS);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fetchAgentVercelStatus fails closed on timeout", async () => {
  process.env.AGENTVERCEL_REPORTER_URL = "https://reporter.test.example";
  process.env.AGENTVERCEL_STATUS_SECRET = "valid-token";

  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    return new Promise<Response>((_resolve, reject) => {
      if (init?.signal) {
        init.signal.addEventListener("abort", () => {
          const err = new Error("The operation was aborted");
          err.name = "AbortError";
          reject(err);
        });
      }
    });
  }) as typeof fetch;

  try {
    const result = await fetchAgentVercelStatus(50); // short 50ms timeout for test
    assert.deepEqual(result, NEUTRAL_UNAVAILABLE_STATUS);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fetchAgentVercelStatus fails closed on malformed JSON / invalid response schema", async () => {
  process.env.AGENTVERCEL_REPORTER_URL = "https://reporter.test.example";
  process.env.AGENTVERCEL_STATUS_SECRET = "valid-token";

  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async () => {
    return new Response(JSON.stringify({ unexpectedField: 12345 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const result = await fetchAgentVercelStatus();
    assert.deepEqual(result, NEUTRAL_UNAVAILABLE_STATUS);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fetchAgentVercelStatus never exposes secrets in output", async () => {
  const secret = "SUPER-CONFIDENTIAL-BEARER-SECRET-999";
  process.env.AGENTVERCEL_REPORTER_URL = "https://reporter.test.example";
  process.env.AGENTVERCEL_STATUS_SECRET = secret;

  const result = await fetchAgentVercelStatus();
  const serialized = JSON.stringify(result);

  assert.ok(!serialized.includes(secret), "Secret should never appear in returned status object");
});
