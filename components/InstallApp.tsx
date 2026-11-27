"use client";

import Link from "next/link";
import { CheckCircle2, Download, Smartphone } from "lucide-react";
import { useAppInstall } from "@/components/AppInstallProvider";

export default function InstallApp() {
    const { canInstall, isInstalled, isStandalone, isPrompting, message, install } = useAppInstall();

    if (isInstalled) {
        return (
            <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-6 sm:p-8">
                <CheckCircle2 className="mb-4 h-8 w-8 text-indigo-300" aria-hidden="true" />
                <h2 className="text-2xl font-bold text-slate-100">
                    {isStandalone ? "You’re using the app" : "The app is installed"}
                </h2>
                <p role="status" className="mt-3 leading-relaxed text-slate-300">
                    {isStandalone
                        ? "Your home-screen app is ready. Explore the latest projects and articles."
                        : "Open chemacabeza.dev from your phone’s home screen or app drawer."}
                </p>
                <Link
                    href="/"
                    className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-300"
                >
                    Continue to the website
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-6 sm:p-8">
                <Smartphone className="mb-4 h-8 w-8 text-indigo-300" aria-hidden="true" />
                <h2 className="text-2xl font-bold text-slate-100">Add it to your phone</h2>
                <p className="mt-3 leading-relaxed text-slate-300">
                    Open your projects and articles from a dedicated app window. An internet
                    connection is needed to load the website.
                </p>

                {canInstall || isPrompting ? (
                    <button
                        type="button"
                        onClick={() => void install()}
                        disabled={isPrompting}
                        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-300 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
                    >
                        <Download className="h-5 w-5" aria-hidden="true" />
                        {isPrompting ? "Follow the installation prompt…" : "Install app"}
                    </button>
                ) : (
                    <a
                        href="#android-install-steps"
                        className="mt-6 inline-flex min-h-12 items-center rounded-xl border border-indigo-400/40 px-6 py-3 font-semibold text-indigo-200 hover:bg-indigo-500/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-300"
                    >
                        See Android installation steps
                    </a>
                )}

                <p role="status" aria-live="polite" className="mt-4 text-sm leading-relaxed text-slate-300">
                    {message}
                </p>
            </div>

            <section
                id="android-install-steps"
                aria-labelledby="android-install-heading"
                className="scroll-mt-24 rounded-2xl border border-slate-800 bg-slate-900/30 p-6 sm:p-8"
            >
                <h2 id="android-install-heading" className="text-xl font-bold text-slate-100">
                    Install with Chrome on Android
                </h2>
                <ol className="mt-5 list-decimal space-y-4 pl-5 leading-relaxed text-slate-300 marker:font-semibold marker:text-indigo-300">
                    <li>Open <strong className="text-slate-100">chemacabeza.dev/install</strong> in Chrome on your phone.</li>
                    <li>Tap Chrome’s <strong className="text-slate-100">three-dot menu (⋮)</strong>.</li>
                    <li>
                        Choose <strong className="text-slate-100">Install and create shortcut</strong>,
                        then <strong className="text-slate-100">Install</strong>. Some versions show
                        <strong className="text-slate-100"> Add to Home screen</strong> first.
                    </li>
                    <li>Confirm installation, then tap the purple gear icon on your home screen or in your app drawer.</li>
                </ol>
                <p className="mt-6 rounded-xl bg-indigo-500/10 p-4 text-sm leading-relaxed text-slate-300">
                    Already have the chemacabeza.dev icon? Open it first. If the website opens
                    in its own window, you can keep using that app. The install button may be
                    hidden when the app is already installed or Chrome is not ready to offer it.
                </p>
            </section>
        </div>
    );
}
