import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DeploymentReportPanel } from "@/components/DeploymentReportPanel";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { fetchAgentVercelReport } from "@/lib/agentvercel";

export const metadata: Metadata = {
  title: "Deployment reports",
  robots: { index: false, follow: false },
};

export default async function DeploymentAdminPage() {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSession(session)) redirect("/admin/login");
  const result = await fetchAgentVercelReport();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">Private administration</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-100">Deployment reports</h1>
          <p className="mt-2 text-slate-400">Live, server-fetched status from the daily reporter.</p>
        </div>
        <form action="/api/admin/session" method="post">
          <input type="hidden" name="action" value="logout" />
          <button type="submit" className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400">Sign out</button>
        </form>
      </div>
      <DeploymentReportPanel result={result} />
    </section>
  );
}
