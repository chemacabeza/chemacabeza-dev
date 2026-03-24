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
        subtitle: "Hybrid Architecture · Online & Offline Video Synthesis",
        description:
            "Type a prompt and watch AI turn it into a video. This full-stack, SaaS-grade video platform is built from scratch with a flexible hybrid architecture: a single configuration switch lets you instantly toggle between running it entirely offline on your local hardware for air-gapped privacy, or connecting it effortlessly to cloud APIs (like fal.ai) for massive scale. Engineered with Spring Boot 3, React, and PostgreSQL, it features async job orchestration, isolated Docker environments, and zero-downtime database migrations.",
        tags: ["Spring Boot 3", "React 18", "Hybrid Cloud", "Local Inference", "fal.ai", "Docker"],
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
        repo: "test-audio-listener",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/test-audio-listener",
        emoji: "🎙️",
        title: "AI Audio Listener",
        subtitle: "Hybrid Architecture · Online & Offline Transcription",
        description:
            "A full-stack transcription pipeline powered by Whisper, engineered with a flexible hybrid architecture: a single configuration toggle lets you instantly choose between running transcription models entirely offline on your local hardware for strict privacy, or connecting to OpenAI cloud APIs for maximum scale and speed. Featuring a Next.js 15 App Router frontend and a Spring Boot 3 & Java 21 backend backed by PostgreSQL, you can spin up the entire isolated stack locally via Docker Compose — allowing seamless browser-based audio recording and historical tracking.",
        tags: ["Spring Boot 3", "Next.js 15", "Hybrid Cloud", "Local Inference", "Whisper", "Docker"],
    },
    {
        repo: "test-for-audio-listener",
        url: "https://github.com/chemacabeza/test-for-audio-listener",
        emoji: "🎧",
        title: "AI Audio Listener",
        subtitle: "STT via OpenAI Whisper",
        description:
            "Record. Transcribe. Search. This is a full-stack audio intelligence platform that turns speech into text with near-perfect accuracy using OpenAI Whisper. Whether it's a live recording from your mic or a file upload, the system handles it with a high-performance Java 21 backend and a lightning-fast Next.js 15 UI. Features include searchable transcription history, persistent storage with PostgreSQL, and a completely Dockerized environment for instant setup. A clean, modular architecture where performance meets simplicity.",
        tags: ["Spring Boot 3", "Next.js 15", "OpenAI Whisper", "PostgreSQL", "Flyway", "Docker", "TypeScript"],
    },
    {
        repo: "test-ai-asistant",
        url: "https://github.com/chemacabeza/test-ai-asistant",
        emoji: "🤖",
        title: "AI Voice Assistant",
        subtitle: "Conversational AI · Whisper + GPT-4o + TTS",
        description:
            "\"Hey Nova, tell me a joke.\" Speak naturally, and this full-stack AI assistant listens (Whisper), thinks (GPT-4o), and speaks back (TTS) — all in real time, right in your browser. Features wake word detection, 9 languages, 6 voice personas, custom AI naming, push-to-talk and continuous listening modes, and both online and offline backends. It's your own Alexa — but you built it, you control it, and it runs with a single Docker command.",
        tags: ["Spring Boot 3", "React", "Vite", "OpenAI", "GPT-4o", "Whisper", "TTS", "Docker"],
    },
    {
        repo: "bash",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/bash",
        emoji: (
            <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-10 h-10 text-slate-100 drop-shadow-md"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M21.038,4.9l-7.577-4.498C13.009,0.134,12.505,0,12,0c-0.505,0-1.009,0.134-1.462,0.403L2.961,4.9 C2.057,5.437,1.5,6.429,1.5,7.503v8.995c0,1.073,0.557,2.066,1.462,2.603l7.577,4.497C10.991,23.866,11.495,24,12,24 c0.505,0,1.009-0.134,1.461-0.402l7.577-4.497c0.904-0.537,1.462-1.529,1.462-2.603V7.503C22.5,6.429,21.943,5.437,21.038,4.9z M15.17,18.946l0.013,0.646c0.001,0.078-0.05,0.167-0.111,0.198l-0.383,0.22c-0.061,0.031-0.111-0.007-0.112-0.085L14.57,19.29 c-0.328,0.136-0.66,0.169-0.872,0.084c-0.04-0.016-0.057-0.075-0.041-0.142l0.139-0.584c0.011-0.046,0.036-0.092,0.069-0.121 c0.012-0.011,0.024-0.02,0.036-0.026c0.022-0.011,0.043-0.014,0.062-0.006c0.229,0.077,0.521,0.041,0.802-0.101 c0.357-0.181,0.596-0.545,0.592-0.907c-0.003-0.328-0.181-0.465-0.613-0.468c-0.55,0.001-1.064-0.107-1.072-0.917 c-0.007-0.667,0.34-1.361,0.889-1.8l-0.007-0.652c-0.001-0.08,0.048-0.168,0.111-0.2l0.37-0.236 c0.061-0.031,0.111,0.007,0.112,0.087l0.006,0.653c0.273-0.109,0.511-0.138,0.726-0.088c0.047,0.012,0.067,0.076,0.048,0.151 l-0.144,0.578c-0.011,0.044-0.036,0.088-0.065,0.116c-0.012,0.012-0.025,0.021-0.038,0.028c-0.019,0.01-0.038,0.013-0.057,0.009 c-0.098-0.022-0.332-0.073-0.699,0.113c-0.385,0.195-0.52,0.53-0.517,0.778c0.003,0.297,0.155,0.387,0.681,0.396 c0.7,0.012,1.003,0.318,1.01,1.023C16.105,17.747,15.736,18.491,15.17,18.946z M19.143,17.859c0,0.06-0.008,0.116-0.058,0.145 l-1.916,1.164c-0.05,0.029-0.09,0.004-0.09-0.056v-0.494c0-0.06,0.037-0.093,0.087-0.122l1.887-1.129 c0.05-0.029,0.09-0.004,0.09,0.056V17.859z M20.459,6.797l-7.168,4.427c-0.894,0.523-1.553,1.109-1.553,2.187v8.833 c0,0.645,0.26,1.063,0.66,1.184c-0.131,0.023-0.264,0.039-0.398,0.039c-0.42,0-0.833-0.114-1.197-0.33L3.226,18.64 c-0.741-0.44-1.201-1.261-1.201-2.142V7.503c0-0.881,0.46-1.702,1.201-2.142l7.577-4.498c0.363-0.216,0.777-0.33,1.197-0.33 c0.419,0,0.833,0.114,1.197,0.33l7.577,4.498c0.624,0.371,1.046,1.013,1.164,1.732C21.686,6.557,21.12,6.411,20.459,6.797z" />
            </svg>
        ),
        title: "Bash In Depth",
        subtitle: "A Developer's Guide · 7-part living book",
        description:
            "A living, structured deep-dive into Bash — from variables and control flow to process management and advanced topics. 7 parts, dozens of chapters, written for engineers who want to go beyond quick scripts and truly understand the shell that holds systems together.",
        tags: ["Bash", "Shell Scripting", "Linux", "Systems", "Developer Tools"],
    },
    {
        repo: "JavaSpringBoot",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/JavaSpringBoot",
        emoji: "☕",
        title: "Java + Spring Boot In Depth",
        subtitle: "23-part curriculum · 70+ projects · 133+ tests",
        description:
            "Two massive, fully documented courses built from industry reference books. The 12-part Java track goes from OOP essentials through Generics, Streams API, Concurrency, and culminates in JNI & Project Panama. The 11-part Spring Boot track covers Spring Core, REST CRUD, Security (BCrypt + JDBC), MVC, JPA Advanced Mappings, plus deep dives into Hibernate internals and AspectJ. Bonus modules include Apache Kafka integration, Spring Modulith with event-driven architecture, and a Model Context Protocol (MCP) module that natively exposes enterprise Java tools to Anthropic's Claude Desktop via JSON-RPC over HTTP SSE.",
        tags: ["Java", "Spring Boot 3", "Hibernate", "JPA", "Spring Security", "AOP", "AspectJ", "Kafka", "Spring Modulith", "MCP", "Docker"],
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
    {
        repo: "Cplusplus",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/Cplusplus",
        emoji: "⚙️",
        title: "C++ In Depth",
        subtitle: "Advanced systems programming · Mastery sequence",
        description:
            "A comprehensive deep-dive into the C++ Object Model and Language Specification. Covers memory architecture, virtual tables, template metaprogramming (SFINAE), and policy-based design. Culminates in a type-erased, thread-safe heterogeneous container built entirely from scratch.",
        tags: ["C++", "Systems Programming", "Memory Architecture", "Template Metaprogramming", "STL"],
    },
    {
        repo: "Golang",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/Golang",
        emoji: <span className="bg-[#00ADD8] text-white px-2 py-0.5 rounded-md text-xl font-bold italic tracking-tighter shadow-sm inline-flex items-center justify-center">Go</span>,
        title: "Golang Mastery Curriculum",
        subtitle: "12-part guide · Microservices & gRPC",
        description:
            "A complete 12-part path to taking Go from zero to production. Covers fundamentals, the CSP concurrency model (Goroutines & Channels), Test-Driven Development, and Domain-Driven Design. Culminates in building multi-container microservices communicating over gRPC with Protocol Buffers. 100% Dockerized for zero-overhead local execution.",
        tags: ["Go", "Microservices", "gRPC", "Protobufs", "Docker", "Concurrency", "DDD"],
    },
    {
        repo: "Linux",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/Linux",
        emoji: "🐧",
        title: "Linux Mastery Curriculum",
        subtitle: "13-part guide · Kernel & eBPF Sandboxes",
        description:
            "A hardcore 13-part curriculum synthesizing foundational bibles of system engineering. Takes you from basic CLI to custom Character Device Driver development in C, Deep Packet Inspection, and injecting live eBPF observability probes. Every module now features completely containerized execution via Docker and docker-compose, allowing you to safely execute dangerous kernel-level code and networking traces within an isolated sandbox on both Linux and macOS.",
        tags: ["Linux", "Sysadmin", "Kernel", "Device Drivers", "Networking", "eBPF", "C", "Docker"],
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
