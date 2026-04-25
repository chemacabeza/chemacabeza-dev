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
        repo: "assistant-google",
        url: "https://github.com/chemacabeza/assistant-google",
        emoji: "🎩",
        title: "Personal AI Assistant",
        subtitle: "Alfred · Bilingual (EN/ES) · Multi-account Gmail · Native WA Bridge · Atomic Session Reset · Android Auto",
        description:
            "\"At your service, sir!\" A production-ready, full-stack AI butler that securely connects to multiple Google Accounts via OAuth 2.0 to manage your Gmail, Calendar, and Maps concurrently — and now connects natively to your WhatsApp via a custom Dockerized bridge (Baileys), with no Meta API tokens required. Simply scan a QR code in the high-fidelity dark-mode dashboard (mirroring WhatsApp Web) to link your personal account. Recently updated with a \"nuclear\" atomic session reset to purge stale connections instantly. The AI assistant is fully bilingual (English and Spanish), capable of aggregating and searching across multiple Gmail inboxes, sending WhatsApp messages on your behalf, deleting calendar events, and automatically generating Android Auto navigation links for any address in your schedule. Powered by OpenAI for intelligent intent parsing, it features custom email reply templates, geocoding via Google Maps, and AES-encrypted token storage at rest. Get started in 5 commands: git clone → ./build.sh → scan QR → Alfred is live at localhost:5173. Fully containerized: Spring Boot 3.4 + React 18 + Node.js Bridge + PostgreSQL 16.",
        tags: ["Spring Boot 3.4", "React 18", "Bilingual", "Multi-account Gmail", "Native WA Bridge", "Socket.io", "OpenAI", "QR Authentication", "Android Auto", "Google OAuth2", "Gmail API", "Calendar API", "Maps API", "PostgreSQL 16", "Docker"],
    },
    {
        repo: "test-with-llms",
        url: "https://github.com/chemacabeza/test-with-llms",
        emoji: "🚀",
        title: "LLM Engineering Mastery",
        subtitle: "38 chapters · Feynman Technique · RAG & Agentic AI",
        description:
            "A deeply detailed, technically rigorous 38-chapter curriculum built using the Richard Feynman Technique. Synthesized from a 10-book technical library, this mastery sequence breaks down complex concepts in LLM Engineering—from transformer math and fine-tuning (LoRA/DPO) to advanced RAG pipelines, multimodal vision fusion, and local-first AI orchestration. Now featuring advanced modules on Multi-Agent Systems, Human-AI Co-Intelligence, and the path to robust, common-sense AI. Including core safety modules on LLM Security and Threat Modeling. Featuring layered narrative analogies and 100+ custom visual infographics, this curriculum takes you from the foundational next-token prediction logic into the deep deployment of production-ready, autonomous agentic systems.",
        tags: ["LLMs", "RAG", "Agentic AI", "Ollama", "HuggingFace", "Python", "Docker"],
    },
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
            "A full-stack video platform supporting 5 state-of-the-art models (Wan 2.6, Kling 2.5, LTX-2, PixVerse) via fal.ai. Engineered with a flexible hybrid architecture: a single configuration switch lets you toggle between running models entirely offline on local hardware or connecting to cloud APIs for scale. Features async job orchestration, isolated Docker environments, and zero-downtime database migrations with automated health checks.",
        tags: ["Spring Boot 3.4", "React 18", "Hybrid Cloud", "Local Inference", "fal.ai", "Wan 2.6", "Kling 2.5", "Docker"],
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
            "\"Hey Nova, tell me a joke.\" Speak naturally, and this full-stack AI assistant listens (Whisper), thinks (GPT-4o), and speaks back (TTS) — all in real time, right in your browser. Features wake word detection ('Nova'), 9 languages, 6 voice personas, custom AI naming, push-to-talk and continuous listening modes, and both online and offline backends. It's your own Alexa — but you built it, you control it, and it runs with a single Docker command.",
        tags: ["Spring Boot 3.4", "React 18", "Vite", "OpenAI", "GPT-4o", "Whisper", "TTS", "Docker"],
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
        subtitle: "24-part deep dive · Java (13) + Spring Boot (11) + Advanced Topics",
        description:
            "A powerhouse mastery curriculum split into two comprehensive tracks. The 13-part Java track covers Fundamentals, OOP Essentials, Core APIs, Exception Handling, Generics & Type Safety, Lambda Expressions, Streams API, Concurrency & Multithreading, I/O & NIO, Advanced OOP & Design Patterns, Modern Java Features, JNI & Project Panama, and JVM Troubleshooting & Tuning. The 11-part Spring Boot track covers Spring Core & JPA CRUD, REST CRUD APIs, REST API Security, Spring MVC, JPA Advanced Mappings, AOP, Hibernate Deep Dive, and AspectJ Deep Dive. Also includes advanced standalone topics: Apache Kafka Integration, Spring Modulith, Model Context Protocol (MCP) for exposing Java tools natively to LLMs, and High-Performance gRPC Microservices.",
        tags: ["Java 21", "Spring Boot 3", "JVM Tuning", "Hibernate", "AspectJ", "Kafka", "gRPC", "Modulith", "MCP", "Docker"],
    },
    {
        repo: "AdvancedAI",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/AdvancedAI",
        emoji: "🔬",
        title: "Advanced AI Curriculum",
        subtitle: "20 chapters · 7 phases · Theoretical & Distributed AI",
        description:
            "A comprehensive, senior-level systems engineering guide synthesized from 10+ foundational textbooks (Goodfellow, Géron, Rashid, Nielsen, d2l.ai) diving into the deepest technical layers of modern AI. Spans 7 phases: hardware compilation & acceleration, Federated Learning, Graph Neural Networks, NLP pipelines, Autonomous Vehicle Perception, Biometric Security, Symbolic AI, AI Agents (RAG & Multiagent Systems), and Deep Learning Foundations covering Transformers, RNN/LSTM, Transfer Learning, TorchScript deployment, and Mixed Precision training across TensorFlow and PyTorch. Includes Dockerized exercises in both Python and Java.",
        tags: ["Deep Learning Systems", "TensorFlow", "PyTorch", "Transformers", "Federated Learning", "GNN", "AI Agents", "RL"],
    },
    {
        repo: "ai_and_MachineLearning",
        url: "https://github.com/chemacabeza/ai_and_MachineLearning",
        emoji: "🧬",
        title: "AI & Machine Learning Course",
        subtitle: "21 chapters · Hands-on · Fully Dockerized exercises",
        description:
            "A hands-on, beginner-friendly curriculum synthesized from over 50 academic textbooks spanning 21 chapters of modern AI. Every chapter includes a fully Dockerized exercise — no local setup beyond Docker. Covers neural networks from scratch, Federated Learning, Reinforcement Learning, NLP, SVMs, Swarm AI, Computer Vision (CNNs), Transfer Learning, Semi-Supervised Learning, Autonomous Vehicles, Algorithmic Trading, Graph Neural Networks, DQN for games, Active Learning, Adversarial ML defenses, Fake News Detection, IoT Edge AI, Lifelong Learning, Metric Learning, ML Data Pipelines, and Game Theory.",
        tags: ["Deep Learning", "Reinforcement Learning", "Computer Vision", "NLP", "Adversarial ML", "IoT", "Game Theory", "Docker"],
    },
    {
        repo: "CyberSecurity",
        url: "https://github.com/chemacabeza/CyberSecurity",
        emoji: "🛡️",
        title: "CyberSecurity Curriculum",
        subtitle: "20 chapters · Red & Blue Team · 24 textbooks · Dockerized exercises",
        description:
            "A comprehensive, hands-on curriculum synthesized from 24 leading industry textbooks taking you from fundamental defensive principles to advanced offensive red team operations. Every chapter follows a rigorous pedagogical structure: a clear learning goal, distilled core concepts, interactive reflection questions with hidden answers, and a fully Dockerized reproducible exercise (Python or Bash) runnable in isolation. The 20 chapters cover: Security Foundations & CIA Triad, Threat Landscape, Networking for Security, Linux Hardening, Windows Hardening, Cryptography & PKI, Network Traffic Analysis, Penetration Testing Methodology, Exploitation Frameworks & Payloads, Web Application Security, Red Team Operations & Kill Chain, Malware Analysis, Reverse Engineering with Ghidra, Digital Forensics & Evidence Collection, Incident Response & SOC Operations, Cloud Security (AWS & Azure), Container & Kubernetes Security, Mobile & IoT Forensics, Threat Hunting & Intelligence, and Security Automation with Python.",
        tags: ["CyberSecurity", "Red Team", "Blue Team", "Penetration Testing", "Ghidra", "Forensics", "Cloud Security", "Kubernetes", "Python", "Docker"],
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
        subtitle: "12 chapters · 4 phases · 100% Dockerized · 17 textbooks",
        description:
            "A complete path from absolute beginner to production-ready multi-container microservices, synthesized from 17 professional-grade textbooks on gRPC, Concurrency, TDD, and DDD. Every module is 100% Dockerized with FROM scratch multi-stage builds — no local Go installation needed. Phase 1 (Foundations) covers Basics & Environment, Structs & Interfaces, and Go's explicit Error Handling with defer/panic/recover. Phase 2 (Advanced Mechanics) tackles the CSP Concurrency model (Goroutines, Channels, select), Functional Programming with Go 1.18+ Generics, and Test-Driven Development with Dependency Injection. Phase 3 (Systems & Data) covers Data Structures & Algorithms (Slice headers, Generic Queues), System Programming (POSIX, graceful SIGTERM shutdowns, bufio disk streaming), and building zero-dependency CLI binaries with Cobra. Phase 4 (Enterprise Microservices Capstone) implements Domain-Driven Design with Hexagonal Architecture (Ports & Adapters), replaces REST with gRPC over Protocol Buffers on HTTP/2, and culminates in a full multi-container microservice system linking an HTTP Gateway to a backend gRPC Core Service via Docker Compose.",
        tags: ["Go", "gRPC", "Protobufs", "CSP Concurrency", "TDD", "DDD", "Hexagonal Architecture", "Generics", "CLI", "Docker"],
    },
    {
        repo: "SystemDesign",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/SystemDesign",
        emoji: "🏗️",
        title: "System Design Mastery",
        subtitle: "48 chapters · 10 phases · Scale to Millions",
        description:
            "How do you design YouTube? How does WhatsApp deliver a message in 30 ms? This 48-chapter curriculum, distilled from over 45 professional-grade textbooks (DDIA, Alex Xu's Volumes, API Security in Action, Learning Serverless, Serverless Architectures on AWS), takes you systematically through 10 phases: Phase 1 covers Scalability, Databases, Caching & Networking. Phase 2 dives into Distributed Systems theory (CAP, Raft, Saga). Phase 3 covers Building Blocks (Kafka, Gateways, Microservices). Phase 4 covers Architecture (CQRS, Event Sourcing, Observability, CI/CD). Phase 5 tackles end-to-end designs (URL Shortener, Chat, News Feed, Video). Phase 6 covers Advanced Patterns (Strangler Fig, Micro-Frontends). Phase 7 covers Trade-Offs & the C4 Model. Phase 8 delivers advanced designs (Proximity/Quadtrees, TSDBs, Kafka Deep Dive). Phase 9 focuses on robust API Architecture (REST, OpenAPI, GraphQL, OAuth/JWT). Phase 10 introduces Serverless Architecture & Cloud-Native Patterns (FaaS/BaaS, AWS Lambda Deep Dive, DynamoDB Single-Table Design, EventBridge choreography, and Step Functions). Concludes with the ultimate System Design Interview Framework.",
        tags: ["DDIA", "Distributed Systems", "Serverless", "AWS", "Kafka", "REST API", "GraphQL", "CQRS", "C4 Model", "Microservices"],
    },
    {
        repo: "DDD",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/DDD",
        emoji: "🏛️",
        title: "Domain-Driven Design (DDD)",
        subtitle: "7 chapters · Strategic & Tactical Patterns · Java",
        description:
            "A curriculum synthesizing the foundational literature of Domain-Driven Design (Eric Evans, Vladik Khononov) to tackle complexity in the heart of software. It teaches how to bridge the gap between domain experts and developers using a Ubiquitous Language. Covers Strategic Design (Bounded Contexts, Context Mapping), Tactical Design (Entities, Value Objects, Aggregate Roots), Domain Events, CQRS with Event Sourcing, and a comprehensive visual encyclopedia of all DDD Building Blocks. All code examples are implemented in modern Java (17+).",
        tags: ["DDD", "Java", "Architecture", "CQRS", "Event Sourcing", "Strategic Design"],
    },
    {
        repo: "Linux",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/Linux",
        emoji: "🐧",
        title: "Linux Mastery Curriculum",
        subtitle: "85 chapters · 23 phases · Kernel to UNIX Power Tools",
        description:
            "A hardcore 85-part curriculum synthesized from 34 professional-grade textbooks (including Systems Performance, BPF Performance Tools, TLPI, and Advanced Programming in the UNIX Environment). Spans 23 phases: Phases 1-3 cover Foundations, Sysadmin automation, and Ring-0 Kernel Systems Programming natively in C. Phase 4 is an Extreme Observability capstone using eBPF and the USE Method. Phases 5-11 dive deeply into The UNIX Programming Interface (TLPI), Containerization Internals (Namespaces/Cgroups built from scratch), VFS & Memory Management (Page Caches/mmap), Kernel Extension (FUSE/Netfilter), Security (SELinux/Seccomp), and High-Performance Networking (XDP/DPDK kernel-bypass). Phases 12-16 handle Production Engineering, DNS/Web administration, and deep CLI text processing (Sed/Awk). Phases 17-21 scale to Cybersecurity Operations, Digital Forensics, TCP/IP Deep Dives, and Brenda Gregg's Performance analysis (Flame Graphs/Latency). Finally, Phases 22-23 culminate in Software Dynamics, Latency Tracing, and absolute mastery of the GNU Build Ecosystem (Autotools & Make) and UNIX Power Tools. Packed with heavily hands-on, securely isolated execution exercises.",
        tags: ["Linux", "Kernel Development", "eBPF", "Systems Programming", "Cybersecurity", "Performance", "Docker Internals", "C", "Bash", "GNU Autotools"],
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
