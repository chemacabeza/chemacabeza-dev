import { AlertTriangle, CheckCircle2, CircleX, Clock3, GitBranch, Server } from "lucide-react";
import type { DeploymentReportResult } from "@/lib/agentvercel";

const formatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function DeploymentReportPanel({ result }: { result: DeploymentReportResult }) {
  if (result.state === "error") {
    return (
      <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <div className="flex items-center gap-3 text-red-300">
          <CircleX className="h-5 w-5" aria-hidden="true" />
          <h2 className="font-semibold">Report unavailable</h2>
        </div>
        <p className="mt-2 text-sm text-red-200/80">{result.message}</p>
      </div>
    );
  }

  const { report } = result;
  if (report.projects.length === 0 && report.deployments.length === 0) {
    return (
      <div role="status" className="rounded-xl border border-slate-700 bg-slate-900/60 p-8 text-center">
        <Server className="mx-auto h-7 w-7 text-slate-500" aria-hidden="true" />
        <h2 className="mt-3 font-semibold text-slate-200">No deployments found</h2>
        <p className="mt-1 text-sm text-slate-400">The connected Vercel team returned an empty report.</p>
      </div>
    );
  }

  const degraded = report.warnings.length > 0 || report.findings.some(({ severity }) => severity !== "info") ||
    report.deployments.some(({ status }) => status === "failed" || status === "cancelled");
  const StatusIcon = degraded ? AlertTriangle : CheckCircle2;

  return (
    <div className="space-y-6">
      <section role="status" aria-live="polite" className={`rounded-xl border p-5 ${degraded ? "border-amber-500/30 bg-amber-500/10" : "border-emerald-500/30 bg-emerald-500/10"}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-5 w-5 ${degraded ? "text-amber-300" : "text-emerald-300"}`} aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-slate-100">{degraded ? "Deployment health is degraded" : "Deployments are healthy"}</h2>
              <p className="text-sm text-slate-400">{report.projects.length} projects · {report.deployments.length} deployments</p>
            </div>
          </div>
          <span className="flex items-center gap-2 text-xs text-slate-400">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            Captured {formatter.format(new Date(report.capturedAt))} UTC
          </span>
        </div>
      </section>

      {report.findings.length > 0 || report.warnings.length > 0 ? (
        <section aria-labelledby="report-findings" className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 id="report-findings" className="font-semibold text-slate-100">Findings and warnings</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {report.findings.map((finding, index) => <li key={`${finding.code}-${finding.deploymentId ?? index}`}>{finding.message}</li>)}
            {report.warnings.map((warning, index) => <li key={`warning-${index}`}>{warning}</li>)}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="recent-deployments">
        <h2 id="recent-deployments" className="text-lg font-semibold text-slate-100">Recent deployments</h2>
        <div className="mt-3 grid gap-3">
          {report.deployments.map((deployment) => (
            <article key={deployment.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-100">{deployment.projectName}</h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                    <GitBranch className="h-4 w-4" aria-hidden="true" />
                    {deployment.branch ?? "Branch unavailable"}{deployment.commitSha ? ` · ${deployment.commitSha.slice(0, 8)}` : ""}
                  </p>
                </div>
                <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-medium uppercase text-slate-300">
                  {deployment.environment} · {deployment.status}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div><dt className="text-slate-500">Deployment URL</dt><dd className="mt-1 break-all text-slate-300">{deployment.url || "Unavailable"}</dd></div>
                <div><dt className="text-slate-500">Created</dt><dd className="mt-1 text-slate-300">{formatter.format(new Date(deployment.createdAt))} UTC</dd></div>
                <div><dt className="text-slate-500">Failure stage</dt><dd className="mt-1 text-slate-300">{deployment.failureStage ?? "None"}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
