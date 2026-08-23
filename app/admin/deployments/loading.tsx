export default function DeploymentAdminLoading() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16" aria-busy="true" aria-live="polite">
      <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">Private administration</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-100">Deployment reports</h1>
      <div role="status" className="mt-8 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-slate-400">
        Loading deployment health…
      </div>
    </section>
  );
}
