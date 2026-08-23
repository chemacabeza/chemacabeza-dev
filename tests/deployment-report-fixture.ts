import type { DeploymentReport } from "../lib/agentvercel";

export const validReport = (overrides: Partial<DeploymentReport> = {}): DeploymentReport => ({
  schemaVersion: "deployment-report.v1",
  teamId: "team_test",
  capturedAt: 1_787_472_000_000,
  projects: [{ id: "prj_1", name: "site", createdAt: 1, updatedAt: 2, config: {}, domains: [], environmentVariables: [] }],
  deployments: [{
    id: "dpl_1", projectId: "prj_1", projectName: "site", environment: "production", status: "ready",
    url: "https://site.example", dashboardUrl: "https://vercel.com/example", aliases: [], branch: "main",
    commitSha: "abcdef1234", commitMessage: "Ship", commitAuthor: "Jose", creator: "Jose", createdAt: 10,
    completedAt: 20, buildDurationMs: 10, failureStage: null,
  }],
  accountDomains: [], accountAliases: [], team: null, auditEvents: [], findings: [], warnings: [],
  ...overrides,
});
