import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { fetchAgentVercelReport, validateDeploymentReport } from "../lib/agentvercel";
import { validReport } from "./deployment-report-fixture";

const ORIGINAL_ENV = { ...process.env };
const originalFetch = globalThis.fetch;

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV, AGENTVERCEL_REPORTER_URL: "https://reporter.example/", AGENTVERCEL_STATUS_SECRET: "reporter-secret" };
});
afterEach(() => { process.env = { ...ORIGINAL_ENV }; globalThis.fetch = originalFetch; });

test("deployment-report.v1 validates and rejects credentials in environment records", () => {
  assert.ok(validateDeploymentReport(validReport()));
  const unsafe = validReport();
  unsafe.projects[0].environmentVariables = [{ key: "SECRET", scopes: ["production"], value: "not-allowed" } as never];
  assert.equal(validateDeploymentReport(unsafe), null);
  assert.equal(validateDeploymentReport({ ...validReport(), schemaVersion: "deployment-report.v2" }), null);
});

test("report request uses server bearer authentication and accepts a valid contract", async () => {
  let requestUrl = "";
  let authorization = "";
  globalThis.fetch = (async (input, init) => {
    requestUrl = String(input);
    authorization = new Headers(init?.headers).get("authorization") ?? "";
    return Response.json(validReport());
  }) as typeof fetch;
  const result = await fetchAgentVercelReport();
  assert.equal(requestUrl, "https://reporter.example/api/deployment-report");
  assert.equal(authorization, "Bearer reporter-secret");
  assert.equal(result.state, "success");
});

test("report request fails closed for upstream and contract errors", async () => {
  globalThis.fetch = (async () => new Response("private upstream detail", { status: 502 })) as typeof fetch;
  const upstream = await fetchAgentVercelReport();
  assert.deepEqual(upstream, { state: "error", message: "Deployment reports are temporarily unavailable." });
  assert.ok(!JSON.stringify(upstream).includes("private upstream detail"));

  globalThis.fetch = (async () => Response.json({ unexpected: true })) as typeof fetch;
  assert.deepEqual(await fetchAgentVercelReport(), { state: "error", message: "The deployment report response was invalid." });
});

test("report request handles timeout without leaking errors", async () => {
  globalThis.fetch = (async (_input, init) => new Promise<Response>((_resolve, reject) => {
    const keepAlive = setTimeout(() => reject(new Error("request did not abort")), 100);
    init?.signal?.addEventListener("abort", () => {
      clearTimeout(keepAlive);
      reject(new Error("sensitive timeout detail"));
    });
  })) as typeof fetch;
  assert.deepEqual(await fetchAgentVercelReport(5), { state: "error", message: "Deployment reports are temporarily unavailable." });
});
