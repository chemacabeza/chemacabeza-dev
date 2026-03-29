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
        subtitle: "Train in Python → Export to ONNX → Serve in Java",
        description:
            "A complete, production-ready machine learning pipeline that trains a neural network in Python (PyTorch), exports it to ONNX, and serves it via a Spring Boot API with 'Golden Parity' tests. This automated architecture ensures mathematically identical results between Python and Java runtimes, proving that models can be trained in Python but executed with zero-Python production footprints.",
        tags: ["PyTorch", "ONNX", "Spring Boot 3", "React", "Golden Parity", "Docker"],
    },
    {
        repo: "test-for-ai-wan",
        url: "https://github.com/chemacabeza/test-for-ai-wan",
        emoji: "⚡",
        title: "AI Video Generation Studio",
        subtitle: "Hybrid Architecture · Online & Offline Video Synthesis",
        description:
            "A full-stack video platform supporting 5 state-of-the-art models (Wan, Kling, LTX-2, PixVerse) via fal.ai. Engineered with a flexible hybrid architecture: a single configuration switch lets you toggle between running models entirely offline on local hardware or connecting to cloud APIs for scale. Features async job orchestration, isolated Docker environments, and zero-downtime database migrations.",
        tags: ["Spring Boot 3", "React 18", "Hybrid Cloud", "Local Inference", "fal.ai", "Docker"],
    },
    {
        repo: "test-for-audio-generation",
        url: "https://github.com/chemacabeza/test-for-audio-generation",
        emoji: "🔊",
        title: "AI Voice Studio",
        subtitle: "Text-to-speech Generator · OpenAI TTS",
        description:
            "Convert text to natural-sounding speech instantly using the OpenAI TTS API. Choose from 11 expressive voices and stream raw MP3 audio straight to your browser. The secure architecture keeps API keys strictly server-side, while the Spring Boot backend and React frontend are fully Dockerized for effortless, horizontal scaling in any environment.",
        tags: ["Spring Boot 3", "React 18", "OpenAI TTS", "MP3 Streaming", "Docker"],
    },
    {
        repo: "test-ai-asistant",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/test-ai-asistant",
        emoji: "🎙️",
        title: "AI Voice Assistant",
        subtitle: "Whisper STT · GPT-4o Chat · OpenAI TTS",
        description:
            "A production-ready voice assistant featuring speech-to-text (Whisper), intelligent GPT-4o chat responses, and natural TTS output. Includes configurable wake-word detection ('Nova'), support for 9 languages, and custom AI personas. Built with a premium dark-themed React UI and a Spring Boot backend, completely containerized for instant local deployment via Docker.",
        tags: ["Spring Boot 3", "React 18", "GPT-4o", "Whisper", "Voice Assistant", "Docker"],
    },
    {
        repo: "test-audio-listener",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/test-audio-listener",
        emoji: "🎧",
        title: "AI Audio Listener",
        subtitle: "Hybrid Architecture · Online & Offline Transcription",
        description:
            "A high-performance transcription pipeline powered by OpenAI Whisper. This hybrid platform allows you to toggle instantly between local-only transcription for air-gapped privacy or cloud acceleration via OpenAI APIs. Featuring a Next.js 15 App Router frontend and a Spring Boot 3.3 backend with PostgreSQL, it includes searchable history, file uploads, and browser-based recording updates.",
        tags: ["Spring Boot 3.3", "Next.js 15", "PostgreSQL", "Whisper", "Docker", "Flyway"],
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
            "A structured deep-dive into Bash systems engineering — from variables and control flow to process management and signals. This 7-part living book is written for engineers who want to go beyond quick scripts and truly master the shell that holds systems together. Features chapters on subshells, Coprocesses, and Programmable Completion.",
        tags: ["Bash", "Systems Engineering", "Linux", "DevOps", "Automation"],
    },
    {
        repo: "JavaSpringBoot",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/JavaSpringBoot",
        emoji: "☕",
        title: "Java + Spring Boot In Depth",
        subtitle: "24-part deep dive · 70+ projects · 133+ tests",
        description:
            "A massive mastery curriculum split into two deep tracks. The 13-part Java track spans OOP essentials, the Streams API, Concurrency, and JNI/Project Panama. The 11-part Spring Boot track covers REST, Security, JPA internal mappings, and advanced architectural patterns including Spring Modulith, event-driven design, and the Model Context Protocol (MCP) for LLM tool integration. The curriculum features a catalog of 70+ hands-on projects and a completely Dockerized Documentation Suite, guaranteeing instant, reproducible local execution across Mac and Linux.",
        tags: ["Java 21", "Spring Boot 3", "Project Panama", "Hibernate", "Modulith", "MCP", "Docker"],
    },
    {
        repo: "AI-related",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/AI-related",
        emoji: "🎨",
        title: "AI Image Generation Platform",
        subtitle: "Stable Diffusion · Fooocus · Model Library",
        description:
            "A local high-performance art platform using Stable Diffusion and Fooocus. Features a 46GB model library with 7 SDXL checkpoints and 41 LoRAs, optimized for Apple Silicon via MPS GPU acceleration. Includes a centralized storage architecture and pre-configured workflows for production-quality character and environment synthesis.",
        tags: ["Stable Diffusion", "SDXL", "LoRA", "Apple Silicon", "MPS", "Docker", "Fooocus"],
    },
    {
        repo: "Cplusplus",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/Cplusplus",
        emoji: "⚙️",
        title: "C++ In Depth",
        subtitle: "Advanced Systems Programming · Mastery Sequence",
        description:
            "A 12-part sequence in high-performance C++ systems engineering. Covers the C++ Object Model under the hood, memory architecture, virtual tables, and template metaprogramming (SFINAE). Explores policy-based design and assembly-level reversing, culminating in a Mastery Project focusing on type-erased thread-safe containers.",
        tags: ["C++", "Memory Architecture", "Metaprogramming", "STL", "Assembly"],
    },
    {
        repo: "Golang",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/Golang",
        emoji: <span className="bg-[#00ADD8] text-white px-2 py-0.5 rounded-md text-xl font-bold italic tracking-tighter shadow-sm inline-flex items-center justify-center">Go</span>,
        title: "Golang Mastery Curriculum",
        subtitle: "Microservices & Concurrency · 12-part guide",
        description:
            "A comprehensive path from zero to production Go. Mentions the CSP concurrency model (Goroutines/Channels), Test-Driven Development (TDD), and Domain-Driven Design (DDD). Culminates in building multi-container microservices communicating over gRPC with Protocol Buffers, fully Dockerized for containerized local execution.",
        tags: ["Go", "Microservices", "gRPC", "Protobufs", "Concurrency", "DDD", "Docker"],
    },
    {
        repo: "SystemDesign",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/SystemDesign",
        emoji: "🏗️",
        title: "System Design Mastery",
        subtitle: "31 chapters · 8 phases · Scale to Millions",
        description:
            "How do you design YouTube? How does WhatsApp deliver a message in 30 ms? This 31-chapter curriculum, distilled from over 30 professional-grade textbooks including Designing Data-Intensive Applications and Alex Xu's System Design Interview series, takes you from first principles (CAP theorem, Raft consensus, Saga transactions) through production-grade building blocks (Kafka, Redis) to designing real systems end-to-end. It culminates in advanced architectural patterns, the C4 Model, geospatial proximity services, and deep-dive Apache Kafka internals.",
        tags: ["DDIA", "Distributed Systems", "Kafka", "Redis", "Microservices", "CQRS", "C4 Model", "Kubernetes"],
    },
    {
        repo: "Linux",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/Linux",
        emoji: "🐧",
        title: "Linux Mastery Curriculum",
        subtitle: "85 chapters · 23 phases · Kernel to UNIX Power Tools",
        description:
            "A hardcore 85-part curriculum synthesized from 34 professional-grade textbooks. Spans 23 phases: from CLI survival and Ring-0 device drivers through eBPF observability, containerization internals, FUSE filesystems, SELinux/Seccomp security, XDP/DPDK kernel-bypass networking, live kernel patching, cybersecurity operations, advanced systems programming (epoll/IPC), TCP/IP protocol mastery, extreme Performance Engineering, and culminating in digital forensics, latency tracing, and the GNU Build Ecosystem. Packed with hands-on execution exercises.",
        tags: ["Linux Kernel", "Device Drivers", "eBPF", "Cybersecurity", "Performance", "GNU Autotools", "DevOps", "Power Tools"],
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
