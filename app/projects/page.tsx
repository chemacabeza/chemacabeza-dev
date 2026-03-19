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
            "Multi-model machine learning serving on a single Spring Boot REST API. Models are trained in Python with PyTorch, exported to the ONNX format, then deployed in Java using ONNX Runtime — with golden parity tests guaranteeing identical outputs across both runtimes. Includes four models: Iris MLP classifier, MNIST CNN (99.13% accuracy), Glasses ResNet18 (98.12% accuracy), and a Document Reader.",
        tags: ["PyTorch", "ONNX", "Spring Boot 3", "React", "WebSocket", "Docker"],
    },
    {
        repo: "test-for-ai-wan",
        url: "https://github.com/chemacabeza/test-for-ai-wan",
        emoji: "⚡",
        title: "AI Video Generation Studio",
        subtitle: "Full-stack AI video platform",
        description:
            "A production-ready full-stack platform that converts a text prompt or image into a video using state-of-the-art generative AI models — delivered live in the browser. Built with an async job lifecycle (submit → scheduled polling → live UI update) and supports 5 models: Wan 2.6, Wan 2.2-A14B, Kling v2.5 Turbo Pro, LTX-2 19B, and PixVerse v5. Adding a new model is a single config entry.",
        tags: ["Spring Boot 3", "React 18", "Vite", "PostgreSQL", "Flyway", "Docker", "fal.ai"],
    },
    {
        repo: "test-for-audio-generation",
        url: "https://github.com/chemacabeza/test-for-audio-generation",
        emoji: "🔊",
        title: "AI Voice Studio",
        subtitle: "Text-to-speech via OpenAI API",
        description:
            "A full-stack Text-to-Speech application that converts any text into natural, expressive speech via the OpenAI TTS API and streams the MP3 back to the browser instantly. The API key lives exclusively on the backend — the React frontend never sees it, demonstrating secure full-stack API design. Supports 11 OpenAI voices and custom speaking instructions. Stateless backend scales horizontally with zero changes.",
        tags: ["Spring Boot 3", "React 18", "OpenAI TTS", "Docker", "Nginx"],
    },
    {
        repo: "AI-related",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/AI-related",
        emoji: "🎨",
        title: "AI Image Generation Platform",
        subtitle: "Stable Diffusion · Fooocus · 46 GB model library",
        description:
            "A production-ready Fooocus deployment that turns your machine into an AI art powerhouse. Ships with a curated 46 GB model library — 7 SDXL checkpoints and 41 LoRAs (including 35 custom character LoRAs spanning 34 nationalities). Runs locally or in Docker with one command. Full Apple Silicon MPS GPU acceleration for blazing-fast generation on M1/M2/M3/M4 chips. Extensible architecture — drop a new .safetensors file and it just works.",
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
