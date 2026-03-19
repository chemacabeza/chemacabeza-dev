import { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { BookOpen, Hammer, Cpu, Target } from "lucide-react";

export const metadata: Metadata = createMetadata({
    title: "Now",
    description: "What Chema Cabeza is currently focused on, building, and learning.",
    path: "/now",
});

export default function NowPage() {
    return (
        <div className="pt-24 pb-32">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-0 w-[350px] h-[350px] rounded-full bg-indigo-600/5 blur-[100px]" />
            </div>

            <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="mb-12">
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4">
                        Now
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-100 mb-4 leading-tight">
                        What I&apos;m doing right now
                    </h1>
                    <p className="text-slate-400 leading-relaxed">
                        A snapshot of my current focus. Last updated: <span className="text-slate-300">March 2025</span>.
                    </p>
                    <p className="text-slate-500 text-sm mt-2">
                        Inspired by{" "}
                        <a
                            href="https://nownownow.com/about"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                        >
                            Derek Sivers&apos; /now page movement
                        </a>
                        .
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Current focus */}
                    <section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-7 hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <Target className="w-4.5 h-4.5 text-indigo-400" />
                            </div>
                            <h2 className="font-bold text-slate-100 text-lg">Current focus</h2>
                        </div>
                        <ul className="space-y-3 text-slate-400 leading-relaxed">
                            <li className="flex gap-2">
                                <span className="text-indigo-500 mt-1 flex-shrink-0">→</span>
                                <span>
                                    Leading a platform re-architecture initiative to move from a distributed monolith to a
                                    proper service mesh, with full observability from day one.
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-indigo-500 mt-1 flex-shrink-0">→</span>
                                <span>
                                    Scaling my engineering team from 8 to 14 people — hiring for two senior backend roles
                                    and one Staff Engineer.
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-indigo-500 mt-1 flex-shrink-0">→</span>
                                <span>
                                    Establishing a quarterly engineering strategy process — tying technical bets
                                    to business outcomes with clear metrics.
                                </span>
                            </li>
                        </ul>
                    </section>

                    {/* Building */}
                    <section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-7 hover:border-violet-500/30 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                <Hammer className="w-4.5 h-4.5 text-violet-400" />
                            </div>
                            <h2 className="font-bold text-slate-100 text-lg">What I&apos;m building</h2>
                        </div>
                        <ul className="space-y-3 text-slate-400 leading-relaxed">
                            <li className="flex gap-2">
                                <span className="text-violet-500 mt-1 flex-shrink-0">→</span>
                                <span>
                                    <strong className="text-slate-300">This website</strong> — built from scratch with
                                    Next.js, Tailwind, and MDX. A permanent home for my writing and projects.
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-violet-500 mt-1 flex-shrink-0">→</span>
                                <span>
                                    <strong className="text-slate-300">Consistency Tracker v2</strong> — adding team
                                    features, webhooks, and a data export API. Planning to launch a free tier publicly.
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-violet-500 mt-1 flex-shrink-0">→</span>
                                <span>
                                    A short-form writing habit — committing to one technical post every two weeks. Systems
                                    thinking, performance, leadership.
                                </span>
                            </li>
                        </ul>
                    </section>

                    {/* Learning */}
                    <section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-7 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <BookOpen className="w-4.5 h-4.5 text-emerald-400" />
                            </div>
                            <h2 className="font-bold text-slate-100 text-lg">What I&apos;m learning</h2>
                        </div>
                        <ul className="space-y-3 text-slate-400 leading-relaxed">
                            <li className="flex gap-2">
                                <span className="text-emerald-500 mt-1 flex-shrink-0">→</span>
                                <span>
                                    <strong className="text-slate-300">eBPF</strong> — understanding kernel-level
                                    observability primitives and their applications in production tracing.
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-500 mt-1 flex-shrink-0">→</span>
                                <span>
                                    <strong className="text-slate-300">Rust</strong> — working through the language to
                                    better understand memory management and write faster CLI tooling.
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-500 mt-1 flex-shrink-0">→</span>
                                <span>
                                    Reading: <em className="text-slate-300">An Elegant Puzzle</em> by Will Larson and{" "}
                                    <em className="text-slate-300">Designing Data-Intensive Applications</em> (re-read).
                                </span>
                            </li>
                        </ul>
                    </section>

                    {/* Not doing */}
                    <section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-7">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-slate-700/50 border border-slate-700/60 flex items-center justify-center">
                                <Cpu className="w-4.5 h-4.5 text-slate-400" />
                            </div>
                            <h2 className="font-bold text-slate-100 text-lg">
                                Intentionally <em>not</em> doing
                            </h2>
                        </div>
                        <ul className="space-y-3 text-slate-400 leading-relaxed">
                            <li className="flex gap-2">
                                <span className="text-slate-600 mt-1 flex-shrink-0">✕</span>
                                <span>Taking on freelance projects — my bandwidth is fully committed.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-slate-600 mt-1 flex-shrink-0">✕</span>
                                <span>
                                    Chasing hype frameworks. I&apos;m focused on depth, not breadth.
                                </span>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
