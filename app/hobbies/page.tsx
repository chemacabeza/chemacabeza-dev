import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Cpu, HardDrive } from "lucide-react";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
    title: "AI Image Generation Platform",
    description: "A local high-performance art platform using Stable Diffusion and Fooocus.",
    path: "/hobbies",
});

export default function HobbiesPage() {
    return (
        <div className="pt-24 pb-32">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full bg-fuchsia-600/5 blur-[120px]" />
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 mb-4">
                        Generative Art
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-100 mb-3 leading-tight">
                        AI Image Generation Platform
                    </h1>
                    <p className="text-xl text-slate-400">
                        Stable Diffusion · Fooocus · Model Library
                    </p>
                </div>

                {/* Tech stack */}
                <div className="mb-12 p-6 rounded-xl border border-slate-800/60 bg-slate-900/40">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
                        Tech Stack
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {["Stable Diffusion", "SDXL", "LoRA", "Apple Silicon", "MPS", "Docker", "Fooocus"].map((tech) => (
                            <span
                                key={tech}
                                className="text-sm px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Content sections */}
                <div className="space-y-12">
                    <section>
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-fuchsia-400 mb-3 block">
                            Introduction
                        </h2>
                        <div className="space-y-4 text-slate-300 leading-relaxed text-[17px]">
                            <p>
                                Welcome to the ultimate playground of creativity! This is the section where imagination bridges the gap directly into computation. I extensively push the boundaries of <strong>Stable Diffusion</strong> and <strong>Fooocus</strong> to create vibrant, intelligent art and experiment with generative workflows.
                            </p>
                            <p>
                                It features hands-on tooling integrations, a custom macOS-optimized backend, and centralized model management. Whether running completely natively on Apple Silicon or dockerized, it serves as my complete, high-performance toolkit for AI synthesis.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-fuchsia-400 mb-3 block">
                            Quick Start & Architecture
                        </h2>
                        <div className="space-y-4 text-slate-300 leading-relaxed text-[17px]">
                            <p>
                                The platform supports both completely containerized execution via Docker and bare-metal optimized execution on Apple Silicon.
                            </p>
                            <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5 mt-4">
                                <h3 className="text-slate-100 font-semibold mb-2 flex items-center gap-2">
                                    <HardDrive className="w-4 h-4 text-fuchsia-400" /> Model Management
                                </h3>
                                <p className="text-sm text-slate-400 mb-3">
                                    To avoid duplication, the installation uses a centralized storage approach with symbolic links. Checkpoints and LoRAs are kept in dedicated libraries and mapped into the application at runtime.
                                </p>
                                <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-sm font-mono text-slate-300 border border-slate-800">
                                    Fooocus/models/checkpoints → ../../models{"\n"}
                                    Fooocus/models/loras       → ../../LoRAs
                                </pre>
                            </div>
                            
                            <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
                                <h3 className="text-slate-100 font-semibold mb-2 flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-fuchsia-400" /> macOS & MPS Acceleration
                                </h3>
                                <p className="text-sm text-slate-400">
                                    Automatically detects macOS environments and configures PyTorch with Metal Performance Shaders (MPS) for GPU acceleration on M-series chips (Apple Silicon M1/M2/M3/M4). It enables aggressive VRAM optimizations like <code>--all-in-fp16</code> and <code>--always-high-vram</code> for peak token-generation speed.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-fuchsia-400 mb-4 block">
                            Curated Model Library
                        </h2>
                        <p className="text-slate-300 leading-relaxed text-[17px] mb-6">
                            The platform comes heavily armed with a massive 46GB library featuring 7 SDXL Checkpoints and 46 LoRAs downloaded from HuggingFace and CivitAI.
                        </p>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-slate-100 mb-4">Featured Checkpoints</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { name: "Juggernaut XL v8", type: "SDXL 1.0", desc: "General purpose, high quality realistic model" },
                                        { name: "Anima Pencil XL v5", type: "SDXL 1.0", desc: "Anime and detailed illustration style" },
                                        { name: "Realistic Stock Photo", type: "SDXL 1.0", desc: "Stock photography realism aesthetic" },
                                        { name: "SDXL Ronghua v4.5", type: "SDXL 1.0", desc: "Chinese aesthetic and style (国风)" },
                                    ].map(model => (
                                        <div key={model.name} className="p-4 rounded-lg border border-slate-800/60 bg-slate-900/30">
                                            <h4 className="font-semibold text-slate-200">{model.name}</h4>
                                            <p className="text-xs text-fuchsia-400 font-mono my-1">{model.type}</p>
                                            <p className="text-sm text-slate-400">{model.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-slate-100 mb-4">Selected LoRAs</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { name: "SDXL Offset Example", desc: "Improves overall contrast and dynamic range", url: "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0" },
                                        { name: "Film Photography Style", desc: "Classic film photography aesthetic", url: "https://huggingface.co/mashb1t/fav_models" },
                                        { name: "Retro Neon Illustrious", desc: "Retro neon synthwave style", url: "https://civitai.com/models/569937" },
                                        { name: "Pumps & Stilettos", desc: "Targeted accessories generation", url: "https://civitai.com/models/94667" },
                                        { name: "Character Library", desc: "Extensive collection of 41 geographically distinct characters, featuring the newly updated Hildur (v1) from Iceland", url: "https://github.com/chemacabeza/my-github-projects/tree/master/AI-related#loras" },
                                    ].map(lora => (
                                        <a key={lora.name} href={lora.url} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-lg border border-slate-800/60 bg-slate-900/30 hover:bg-slate-900/60 hover:border-fuchsia-500/30 transition-all group">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-semibold text-slate-200 group-hover:text-fuchsia-300 transition-colors">{lora.name}</h4>
                                                <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-fuchsia-400 transition-colors flex-shrink-0 mt-1" />
                                            </div>
                                            <p className="text-sm text-slate-400 mt-1">{lora.desc}</p>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-fuchsia-400 mb-4 block">
                            Expert Tips & Advanced Workflows
                        </h2>
                        <p className="text-slate-300 leading-relaxed text-[17px] mb-6">
                            Beyond standard generation, I also document advanced techniques and highly specialized workflows. Read through these guides to understand the finer details of AI creation:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                {
                                    title: "Flux Prompt Crafting",
                                    desc: "Learn to systematically construct highly detailed, natural language prompts optimized specifically for the unparalleled coherency of Flux models.",
                                    url: "https://github.com/chemacabeza/my-github-projects/blob/master/AI-related/courses/ExpertTips_AdvancedWorkflows/Flux_Prompt_Crafter/README.md"
                                },
                                {
                                    title: "Kling AI Video Directing",
                                    desc: "Step-by-step techniques for translating static ideas or image generations into dynamic, cinematic video sequences using Kling AI.",
                                    url: "https://github.com/chemacabeza/my-github-projects/blob/master/AI-related/courses/ExpertTips_AdvancedWorkflows/Kling_AI_Video_Prompts/README.md"
                                },
                                {
                                    title: "CivitAI LoRA Training",
                                    desc: "A comprehensive teardown on how to gather datasets, configure epochs, and successfully train custom Character or Stylistic LoRAs on CivitAI.",
                                    url: "https://github.com/chemacabeza/my-github-projects/blob/master/AI-related/courses/ExpertTips_AdvancedWorkflows/CivitAI_LoRA_Training/README.md"
                                }
                            ].map(guide => (
                                <a key={guide.title} href={guide.url} target="_blank" rel="noopener noreferrer" className="block p-5 rounded-xl border border-slate-800/60 bg-slate-900/30 hover:bg-slate-900/60 hover:border-fuchsia-500/30 transition-all group">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-bold text-slate-200 group-hover:text-fuchsia-300 transition-colors leading-snug">{guide.title}</h3>
                                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-fuchsia-400 transition-colors flex-shrink-0 mt-0.5" />
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed">{guide.desc}</p>
                                </a>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Footer Link */}
                <div className="mt-16 pt-8 border-t border-slate-800/40 pb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
                        <a 
                            href="https://github.com/chemacabeza/my-github-projects/tree/master/AI-related"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors bg-slate-800/50 hover:bg-slate-800 px-4 py-2 rounded-lg"
                        >
                            View on GitHub <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
