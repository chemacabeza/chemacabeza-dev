import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-6 py-20">
      <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-indigo-950/20">
        <LockKeyhole className="mb-5 h-8 w-8 text-indigo-400" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-slate-100">Deployment administration</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Sign in to view private deployment health and daily report data.
        </p>
        {error ? (
          <p role="alert" className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            The credential was not accepted.
          </p>
        ) : null}
        <form action="/api/admin/session" method="post" className="mt-6 space-y-4">
          <div>
            <label htmlFor="credential" className="mb-2 block text-sm font-medium text-slate-200">
              Admin credential
            </label>
            <input
              id="credential"
              name="credential"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          <button type="submit" className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900">
            Sign in
          </button>
        </form>
      </div>
    </section>
  );
}
