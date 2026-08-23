import { fetchAgentVercelStatus } from "@/lib/agentvercel";
import { ShieldCheck, ShieldAlert, AlertTriangle, Activity } from "lucide-react";

export default async function AgentVercelStatus() {
  const status = await fetchAgentVercelStatus();

  const formatReportTime = (timeStr: string | null): string | null => {
    if (!timeStr) return null;
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      });
    } catch {
      return timeStr;
    }
  };

  const formattedTime = formatReportTime(status.lastSuccessfulReportTime);

  return (
    <div className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-3.5 text-xs text-slate-400 transition-all hover:border-slate-700/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {status.available ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-medium text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                AgentVercel Reporter Active
              </span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-slate-500" />
              <span className="font-medium text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                Status temporarily unavailable
              </span>
            </>
          )}
        </div>

        {/* Status Metrics */}
        {status.available && (
          <div className="flex flex-wrap items-center gap-3 text-slate-400">
            {formattedTime && (
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-slate-500" />
                <span>Last report: {formattedTime}</span>
              </span>
            )}

            <span className="px-2 py-0.5 rounded-md bg-slate-800/60 border border-slate-700/40 text-slate-300">
              Changes: <strong className="text-indigo-400 font-semibold">{status.lastReportChangeCount}</strong>
            </span>

            {status.warningCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Warnings: {status.warningCount}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
