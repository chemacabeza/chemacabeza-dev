import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { DeploymentReportPanel } from "../components/DeploymentReportPanel";
import { validReport } from "./deployment-report-fixture";

test("deployment panel renders healthy and empty states", () => {
  const healthy = renderToStaticMarkup(<DeploymentReportPanel result={{ state: "success", report: validReport() }} />);
  assert.match(healthy, /Deployments are healthy/);
  assert.match(healthy, /site/);

  const empty = renderToStaticMarkup(<DeploymentReportPanel result={{ state: "success", report: validReport({ projects: [], deployments: [] }) }} />);
  assert.match(empty, /No deployments found/);
  assert.match(empty, /role="status"/);
});

test("deployment panel renders degraded and accessible error states", () => {
  const report = validReport({ findings: [{ severity: "critical", code: "deployment_failed", message: "A production deployment failed." }] });
  const degraded = renderToStaticMarkup(<DeploymentReportPanel result={{ state: "success", report }} />);
  assert.match(degraded, /Deployment health is degraded/);
  assert.match(degraded, /A production deployment failed/);

  const error = renderToStaticMarkup(<DeploymentReportPanel result={{ state: "error", message: "Deployment reports are temporarily unavailable." }} />);
  assert.match(error, /role="alert"/);
  assert.match(error, /Report unavailable/);
});
