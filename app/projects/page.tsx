import { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { projects } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";
import SectionHeader from "@/components/SectionHeader";
import { Github, ExternalLink } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = createMetadata({
    title: "Projects",
    description:
        "Selected engineering projects: AI voice generation, microservices observability, and SaaS products.",
    path: "/projects",
});

const githubProjects = [
    {
        repo: "neural-network-with-java",
        url: "https://github.com/chemacabeza/neural-network-with-java",
        emoji: "🧠",
        title: "ML Inference Pipeline",
        subtitle: "PyTorch → ONNX → Java",
        description:
            "What if you could train a model in Python and deploy it in Java — with mathematically identical results? That's exactly what this does. Four production-grade models (MNIST CNN at 99.13% accuracy, ResNet18 at 98.12%) trained in PyTorch, exported to ONNX, and served through a single Spring Boot API with live WebSocket updates. Golden parity tests prove every prediction matches across runtimes. Zero Python in production.",
        tags: ["PyTorch", "ONNX", "Spring Boot 3", "React", "WebSocket", "Docker"],
    },
    {
        repo: "test-for-ai-wan",
        url: "https://github.com/chemacabeza/test-for-ai-wan",
        emoji: "⚡",
        title: "AI Video Generation Studio",
        subtitle: "Full-stack AI video platform",
        description:
            "Type a prompt. Watch AI turn it into a video. In your browser. This is a full SaaS-grade platform built from scratch — not a wrapper, not a notebook. Five cutting-edge models (Wan 2.6, Kling v2.5 Turbo Pro, PixVerse v5 and more), async job orchestration with live polling, zero-downtime DB migrations via Flyway, and an architecture so clean that adding a new model is literally one config entry. From zero to production in days — not weeks.",
        tags: ["Spring Boot 3", "React 18", "Vite", "PostgreSQL", "Flyway", "Docker", "fal.ai"],
    },
    {
        repo: "test-for-audio-generation",
        url: "https://github.com/chemacabeza/test-for-audio-generation",
        emoji: "🔊",
        title: "AI Voice Studio",
        subtitle: "Text-to-speech via OpenAI API",
        description:
            "Type any text, pick from 11 expressive OpenAI voices, and hear it spoken back to you instantly — streamed as raw MP3 straight to your browser. The magic? Your API key never leaves the server. A clean, secure architecture where the React frontend knows nothing about credentials, the stateless Spring Boot backend scales horizontally with zero changes, and Docker spins everything up with a single command. Production-grade security meets effortless developer experience.",
        tags: ["Spring Boot 3", "React 18", "OpenAI TTS", "Docker", "Nginx"],
    },
    {
        repo: "AI-related",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/AI-related",
        emoji: "🎨",
        title: "AI Image Generation Platform",
        subtitle: "Stable Diffusion · Fooocus · 46 GB model library",
        description:
            "Turn your machine into an AI art powerhouse — one command and you're generating stunning images. Ships with a massive 46 GB curated model library: 7 SDXL checkpoints and 41 LoRAs including 35 custom character LoRAs spanning 34 nationalities. Blazing-fast on Apple Silicon via MPS GPU acceleration (M1 through M4). Run it locally or in Docker. Want a new model? Just drop a .safetensors file and it's ready. The creative possibilities are literally endless.",
        tags: ["Stable Diffusion", "Fooocus", "SDXL", "LoRA", "Docker", "Apple Silicon", "Python"],
    },
];

export default function ProjectsPage() {
    return (
        <div className="pt-24 pb-32">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-violet-600/5 blur-[100px]" />
            </div>

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader
                    label="Projects"
                    title="Work I'm proud of"
                    description="Systems and products built to solve real problems at scale. Each one taught me something new about the craft."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <ProjectCard key={project.slug} project={project} />
                    ))}
                </div>

                {/* GitHub section */}
                <div className="mt-24">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">
                                Open Source
                            </span>
                            <h2 className="text-3xl font-black text-slate-100 flex items-center gap-3">
                                <Github className="w-7 h-7 text-slate-400" />
                                GitHub
                            </h2>
                        </div>
                        <Link
                            href="https://github.com/chemacabeza/my-github-projects"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                        >
                            View all on GitHub <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>
                    <p className="text-slate-400 mb-8 max-w-2xl">
                        A selection of open-source experiments and projects exploring AI, machine learning, and systems engineering.
                        Full collection at{" "}
                        <Link
                            href="https://github.com/chemacabeza/my-github-projects"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
                        >
                            chemacabeza/my-github-projects
                        </Link>
                        .
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {githubProjects.map((proj) => (
                            <Link
                                key={proj.repo}
                                href={proj.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group rounded-xl border border-slate-800/60 bg-slate-900/40 p-6 hover:border-indigo-500/40 hover:bg-slate-900/70 transition-all duration-300 flex flex-col"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <span className="text-3xl">{proj.emoji}</span>
                                    <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors flex-shrink-0 mt-1" />
                                </div>

                                {/* Title */}
                                <h3 className="font-bold text-slate-100 text-lg leading-snug mb-0.5 group-hover:text-indigo-300 transition-colors">
                                    {proj.title}
                                </h3>
                                <p className="text-xs font-semibold text-indigo-500/80 mb-3 font-mono">
                                    {proj.subtitle}
                                </p>

                                {/* Description */}
                                <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-5">
                                    {proj.description}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5">
                                    {proj.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Mobile "view all" link */}
                    <div className="mt-6 sm:hidden">
                        <Link
                            href="https://github.com/chemacabeza/my-github-projects"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                        >
                            View all on GitHub <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
