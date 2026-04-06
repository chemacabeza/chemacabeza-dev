import { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { BookOpen, Hammer, Cpu, Target } from "lucide-react";

export const metadata: Metadata = createMetadata({
    title: "Now",
    description: "What José María Cabeza Rodríguez is currently focused on, building, and learning.",
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
                        A snapshot of my current focus. Last updated: <span className="text-slate-300">April 2026</span>.
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
                                    Leading Partner Account Infrastructure in Berlin — overseeing 7 critical
                                    services handling API integrations with 40+ payment partners (Adyen, Mollie, Stripe).
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-indigo-500 mt-1 flex-shrink-0">→</span>
                                <span>
                                    Scaling and evolving a custom framework that enables automatic retriggering,
                                    prioritisation, and chaining of service calls — reducing maintenance overhead
                                    significantly.
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-indigo-500 mt-1 flex-shrink-0">→</span>
                                <span>
                                    Running quarterly engineering strategy and OKR processes, tying team technical bets
                                    to measurable business outcomes.
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
                                    Expanding a <strong className="text-slate-300">massive open-source curriculum portfolio</strong> —
                                    16+ deep-dive technical courses spanning Java/Spring Boot (24 parts), Linux (85 chapters),
                                    System Design (34 chapters), AI &amp; ML (21 chapters), Advanced AI (20 chapters),
                                    CyberSecurity (20 chapters), C++, Go, DDD, and Bash.
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-violet-500 mt-1 flex-shrink-0">→</span>
                                <span>
                                    Building full-stack <strong className="text-slate-300">AI-powered applications</strong> —
                                    an AI Video Generation Studio (5 models including Wan, Kling, LTX-2), an AI Voice Assistant
                                    with Whisper + GPT-4o + TTS, and an ML Inference Pipeline (PyTorch → ONNX → Spring Boot).
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-violet-500 mt-1 flex-shrink-0">→</span>
                                <span>
                                    Running a local <strong className="text-slate-300">AI Image Generation Platform</strong> with
                                    Stable Diffusion and Fooocus — a 46GB model library with 7 SDXL checkpoints and 40+ LoRAs,
                                    optimized for Apple Silicon via MPS GPU acceleration. Training custom character LoRAs on CivitAI.
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-violet-500 mt-1 flex-shrink-0">→</span>
                                <span>
                                    <strong className="text-slate-300">This website</strong> — built from scratch with
                                    Next.js and deployed on Vercel. A permanent home for my writing, projects, hobbies, and thinking.
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
                                    <strong className="text-slate-300">Deep Learning foundations</strong> — working through
                                    Goodfellow, Géron, Rashid, Nielsen, and d2l.ai to build an Advanced AI curriculum covering
                                    Transformers, RNN/LSTM, Federated Learning, Graph Neural Networks, and AI Agents.
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-500 mt-1 flex-shrink-0">→</span>
                                <span>
                                    <strong className="text-slate-300">Generative AI workflows</strong> — Flux prompt crafting,
                                    Kling AI video directing, and CivitAI LoRA training for custom character creation.
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-500 mt-1 flex-shrink-0">→</span>
                                <span>
                                    Deepening <strong className="text-slate-300">Spring Boot 3 + Spring 6</strong> —
                                    exploring Spring Modulith, Model Context Protocol (MCP) for LLM tool integration,
                                    and event-driven architectural patterns.
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-500 mt-1 flex-shrink-0">→</span>
                                <span>
                                    <strong className="text-slate-300">CyberSecurity</strong> — building a 20-chapter
                                    offensive/defensive curriculum from 24 textbooks, covering penetration testing,
                                    reverse engineering with Ghidra, and digital forensics.
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-500 mt-1 flex-shrink-0">→</span>
                                <span>
                                    <strong className="text-slate-300">German</strong> — continuing to improve while
                                    living in Berlin. Both necessary and rewarding.
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
