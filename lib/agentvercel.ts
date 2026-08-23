export interface AgentVercelStatus {
  available: boolean;
  lastSuccessfulReportTime: string | null;
  lastReportChangeCount: number;
  warningCount: number;
  statusMessage?: string;
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
