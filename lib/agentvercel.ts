export interface AgentVercelStatus {
  available: boolean;
  lastSuccessfulReportTime: string | null;
  lastReportChangeCount: number;
  warningCount: number;
  statusMessage?: string;
}

export const DEPLOYMENT_REPORT_SCHEMA_VERSION = "deployment-report.v1" as const;

export interface DeploymentRecord {
  id: string;
  projectId: string;
  projectName: string;
  environment: "production" | "preview";
  status: "ready" | "failed" | "cancelled" | "building";
  url: string;
  dashboardUrl: string;
  aliases: string[];
  branch: string | null;
  commitSha: string | null;
  commitMessage: string | null;
  commitAuthor: string | null;
  creator: string | null;
  createdAt: number;
  completedAt: number | null;
  buildDurationMs: number | null;
  failureStage: string | null;
}

export interface DeploymentFinding {
  severity: "info" | "warning" | "critical";
  code: string;
  message: string;
  projectId?: string;
  deploymentId?: string;
}

export interface DeploymentReport {
  schemaVersion: typeof DEPLOYMENT_REPORT_SCHEMA_VERSION;
  teamId: string;
  capturedAt: number;
  projects: Array<{
    id: string;
    name: string;
    createdAt: number;
    updatedAt: number;
    config: Record<string, unknown>;
    domains: string[];
    environmentVariables: Array<{ key: string; scopes: string[] }>;
  }>;
  deployments: DeploymentRecord[];
  accountDomains: string[];
  accountAliases: Array<{ alias: string; deploymentId: string }>;
  team: {
    id: string;
    name: string;
    slug: string;
    members: Array<{ id: string; name: string; role: string; confirmed: boolean }>;
  } | null;
  auditEvents: Array<{
    id: string;
    createdAt: number;
    action: string;
    actor: string | null;
    description: string | null;
  }>;
  findings: DeploymentFinding[];
  warnings: string[];
}

export type DeploymentReportResult =
  | { state: "success"; report: DeploymentReport }
  | { state: "error"; message: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === "string";
const isNullableString = (value: unknown): value is string | null => value === null || isString(value);
const isTimestamp = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString);
const hasOnlyKeys = (value: Record<string, unknown>, keys: readonly string[]): boolean =>
  Object.keys(value).every((key) => keys.includes(key));

export function validateDeploymentReport(payload: unknown): DeploymentReport | null {
  if (!isRecord(payload) || !hasOnlyKeys(payload, ["schemaVersion", "teamId", "capturedAt", "projects", "deployments", "accountDomains", "accountAliases", "team", "auditEvents", "findings", "warnings"]) ||
    payload.schemaVersion !== DEPLOYMENT_REPORT_SCHEMA_VERSION ||
    !isString(payload.teamId) || !isTimestamp(payload.capturedAt) || !Array.isArray(payload.projects) ||
    !Array.isArray(payload.deployments) || !isStringArray(payload.accountDomains) ||
    !Array.isArray(payload.accountAliases) || !Array.isArray(payload.auditEvents) ||
    !Array.isArray(payload.findings) || !isStringArray(payload.warnings)) return null;

  const projectsValid = payload.projects.every((project) => isRecord(project) &&
    hasOnlyKeys(project, ["id", "name", "createdAt", "updatedAt", "config", "domains", "environmentVariables"]) &&
    isString(project.id) && isString(project.name) && isTimestamp(project.createdAt) &&
    isTimestamp(project.updatedAt) && isRecord(project.config) && isStringArray(project.domains) &&
    Array.isArray(project.environmentVariables) && project.environmentVariables.every((env) =>
      isRecord(env) && hasOnlyKeys(env, ["key", "scopes"]) && isString(env.key) && isStringArray(env.scopes)));

  const deploymentsValid = payload.deployments.every((deployment) => isRecord(deployment) &&
    hasOnlyKeys(deployment, ["id", "projectId", "projectName", "environment", "status", "url", "dashboardUrl", "aliases", "branch", "commitSha", "commitMessage", "commitAuthor", "creator", "createdAt", "completedAt", "buildDurationMs", "failureStage"]) &&
    isString(deployment.id) && isString(deployment.projectId) && isString(deployment.projectName) &&
    (deployment.environment === "production" || deployment.environment === "preview") &&
    ["ready", "failed", "cancelled", "building"].includes(String(deployment.status)) &&
    isString(deployment.url) && isString(deployment.dashboardUrl) && isStringArray(deployment.aliases) &&
    isNullableString(deployment.branch) && isNullableString(deployment.commitSha) &&
    isNullableString(deployment.commitMessage) && isNullableString(deployment.commitAuthor) &&
    isNullableString(deployment.creator) && isTimestamp(deployment.createdAt) &&
    (deployment.completedAt === null || isTimestamp(deployment.completedAt)) &&
    (deployment.buildDurationMs === null || isTimestamp(deployment.buildDurationMs)) &&
    isNullableString(deployment.failureStage));

  const aliasesValid = payload.accountAliases.every((item) => isRecord(item) && hasOnlyKeys(item, ["alias", "deploymentId"]) && isString(item.alias) && isString(item.deploymentId));
  const teamValid = payload.team === null || (isRecord(payload.team) && isString(payload.team.id) &&
    hasOnlyKeys(payload.team, ["id", "name", "slug", "members"]) && isString(payload.team.name) && isString(payload.team.slug) && Array.isArray(payload.team.members) &&
    payload.team.members.every((member) => isRecord(member) && hasOnlyKeys(member, ["id", "name", "role", "confirmed"]) && isString(member.id) && isString(member.name) &&
      isString(member.role) && typeof member.confirmed === "boolean"));
  const auditValid = payload.auditEvents.every((event) => isRecord(event) && hasOnlyKeys(event, ["id", "createdAt", "action", "actor", "description"]) && isString(event.id) &&
    isTimestamp(event.createdAt) && isString(event.action) && isNullableString(event.actor) &&
    isNullableString(event.description));
  const findingsValid = payload.findings.every((finding) => isRecord(finding) && hasOnlyKeys(finding, ["severity", "code", "message", "projectId", "deploymentId"]) &&
    ["info", "warning", "critical"].includes(String(finding.severity)) && isString(finding.code) &&
    isString(finding.message) && (finding.projectId === undefined || isString(finding.projectId)) &&
    (finding.deploymentId === undefined || isString(finding.deploymentId)));

  return projectsValid && deploymentsValid && aliasesValid && teamValid && auditValid && findingsValid
    ? payload as unknown as DeploymentReport
    : null;
}

export const NEUTRAL_UNAVAILABLE_STATUS: AgentVercelStatus = {
  available: false,
  lastSuccessfulReportTime: null,
  lastReportChangeCount: 0,
  warningCount: 0,
  statusMessage: "Status temporarily unavailable",
};

/**
 * Validates whether an unknown raw object conforms to the expected status response schema.
 * Sanitizes and extracts ONLY allowed status fields.
 */
export function validateAgentVercelStatusResponse(payload: unknown): AgentVercelStatus | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const obj = payload as Record<string, unknown>;

  // Reporter available state
  let available: boolean;
  if (typeof obj.available === "boolean") {
    available = obj.available;
  } else if (typeof obj.status === "string") {
    const s = obj.status.toLowerCase();
    available = s === "ok" || s === "available" || s === "healthy";
  } else {
    return null;
  }

  // Last successful report time
  let lastSuccessfulReportTime: string | null = null;
  const rawTime = obj.lastSuccessfulReportTime ?? obj.lastReportTime ?? obj.timestamp ?? obj.capturedAt;
  if (rawTime !== undefined && rawTime !== null) {
    if (typeof rawTime === "string") {
      lastSuccessfulReportTime = rawTime;
    } else if (typeof rawTime === "number" && !isNaN(rawTime)) {
      lastSuccessfulReportTime = new Date(rawTime).toISOString();
    } else {
      return null;
    }
  }

  // Last report change count
  const rawChangeCount = obj.lastReportChangeCount ?? obj.changeCount ?? obj.changesCount;
  let lastReportChangeCount = 0;
  if (rawChangeCount !== undefined && rawChangeCount !== null) {
    if (typeof rawChangeCount === "number" && Number.isInteger(rawChangeCount) && rawChangeCount >= 0) {
      lastReportChangeCount = rawChangeCount;
    } else {
      return null;
    }
  }

  // Warning count
  const rawWarningCount = obj.warningCount ?? obj.warningsCount;
  let warningCount = 0;
  if (rawWarningCount !== undefined && rawWarningCount !== null) {
    if (typeof rawWarningCount === "number" && Number.isInteger(rawWarningCount) && rawWarningCount >= 0) {
      warningCount = rawWarningCount;
    } else {
      return null;
    }
  }

  return {
    available,
    lastSuccessfulReportTime,
    lastReportChangeCount,
    warningCount,
  };
}

/**
 * Fetches status server-side from the protected AGENTVERCEL_REPORTER_URL endpoint.
 * Fails closed with neutral state on any error, missing env, timeout, or schema mismatch.
 */
export async function fetchAgentVercelStatus(timeoutMs: number = 3000): Promise<AgentVercelStatus> {
  const reporterUrl = process.env.AGENTVERCEL_REPORTER_URL?.trim();
  const secret = process.env.AGENTVERCEL_STATUS_SECRET?.trim();

  if (!reporterUrl || !secret) {
    return NEUTRAL_UNAVAILABLE_STATUS;
  }

  const baseUrl = reporterUrl.replace(/\/+$/, "");
  const targetUrl = `${baseUrl}/api/status`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secret}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timer);
    });

    if (!res.ok) {
      return NEUTRAL_UNAVAILABLE_STATUS;
    }

    const data = await res.json();
    const validated = validateAgentVercelStatusResponse(data);

    if (!validated) {
      return NEUTRAL_UNAVAILABLE_STATUS;
    }

    return validated;
  } catch {
    return NEUTRAL_UNAVAILABLE_STATUS;
  }
}

export async function fetchAgentVercelReport(timeoutMs: number = 35_000): Promise<DeploymentReportResult> {
  const reporterUrl = process.env.AGENTVERCEL_REPORTER_URL?.trim();
  const secret = process.env.AGENTVERCEL_STATUS_SECRET?.trim();
  if (!reporterUrl || !secret) return { state: "error", message: "Deployment reports are not configured." };

  try {
    const response = await fetch(`${reporterUrl.replace(/\/+$/, "")}/api/deployment-report`, {
      headers: { Authorization: `Bearer ${secret}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) return { state: "error", message: "Deployment reports are temporarily unavailable." };
    const report = validateDeploymentReport(await response.json());
    return report
      ? { state: "success", report }
      : { state: "error", message: "The deployment report response was invalid." };
  } catch {
    return { state: "error", message: "Deployment reports are temporarily unavailable." };
  }
}
