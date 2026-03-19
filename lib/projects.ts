export interface Project {
    slug: string;
    title: string;
    tagline: string;
    description: string;
    problem: string;
    solution: string;
    architecture: string;
    techStack: string[];
    outcome: string;
    featured?: boolean;
    category: string;
}

export const projects: Project[] = [
    {
        slug: "ai-voice-generation",
        title: "AI Voice Generation Tool",
        tagline: "Production-grade TTS pipeline with sub-200ms latency",
        description:
            "A cloud-native voice synthesis platform that converts text to natural-sounding speech using fine-tuned neural models, serving 50k+ daily requests.",
        problem:
            "The team needed a flexible, latency-sensitive voice synthesis API capable of supporting multiple languages and custom voice cloning — all within strict SLA requirements for a B2B product.",
        solution:
            "Built a streaming TTS microservice wrapping multiple model backends (OpenAI TTS, Coqui, ElevenLabs) behind a unified API. Implemented model-level caching, async request queuing via Redis Streams, and a voice-fingerprint registry. Dockerised for horizontal scaling on Kubernetes.",
        architecture:
            "Stateless FastAPI service → Redis Stream queue → Worker pool (GPU nodes) → S3 audio storage → signed CDN URLs. Each voice model runs in isolated containers with shared GPU scheduling. A Postgres-backed registry tracks voice profiles, usage, and per-tenant rate limits.",
        techStack: [
            "Python",
            "FastAPI",
            "Redis Streams",
            "Kubernetes",
            "Docker",
            "PostgreSQL",
            "S3",
            "OpenAI TTS",
            "Coqui TTS",
        ],
        outcome:
            "P95 latency reduced to 180ms. Scaled to 50k+ daily requests with zero downtime. Three enterprise clients onboarded within the first month of launch.",
        featured: true,
        category: "AI / ML",
    },
    {
        slug: "microservices-observability-dashboard",
        title: "Microservices Observability Dashboard",
        tagline: "Real-time visibility across 40+ services",
        description:
            "A centralised observability platform unifying metrics, traces, and logs for a distributed system of 40+ microservices, reducing MTTR from hours to minutes.",
        problem:
            "Engineers were flying blind across a complex microservices landscape. Incidents took 3–6 hours to diagnose because traces lived in one tool, logs in another, and there was no correlation between them. On-call engineers needed a single source of truth.",
        solution:
            "Designed and shipped a custom Grafana-based observability platform with auto-instrumented services (OpenTelemetry), centralised log correlation via structured logging conventions, and a custom alerting rules engine with Slack/PagerDuty integration.",
        architecture:
            "OpenTelemetry SDKs in all services → Collector agents → Tempo (traces) + Loki (logs) + Prometheus (metrics) → Grafana dashboards. A lightweight correlation service tags log lines with trace IDs, enabling one-click navigation from a slow trace to its corresponding log stream.",
        techStack: [
            "OpenTelemetry",
            "Grafana",
            "Tempo",
            "Loki",
            "Prometheus",
            "Kubernetes",
            "Alertmanager",
            "PagerDuty",
            "Go",
        ],
        outcome:
            "MTTR dropped from ~4 hours to under 15 minutes. On-call engineer satisfaction score improved from 3.2 to 4.7/5. Engineering leadership now uses dashboards in weekly reliability reviews.",
        featured: true,
        category: "Platform Engineering",
    },
    {
        slug: "consistency-tracker-saas",
        title: "Consistency Tracker SaaS",
        tagline: "Habit-building platform with streak analytics",
        description:
            "A full-stack SaaS application that helps professionals build consistency through daily habit tracking, streak analytics, and team accountability features.",
        problem:
            "Existing habit trackers were either too simple (no data insight) or overcomplicated (cognitive overload). Teams working remotely needed a lightweight accountability layer without another heavy project management tool.",
        solution:
            "Built a clean SaaS product with a tight feedback loop: log a habit in one tap, see your streak, and optionally share it with a team. Added a webhook system so organisations can pipe completion events to Slack or their own tooling.",
        architecture:
            "Next.js App Router frontend → tRPC API layer → PostgreSQL (via Drizzle ORM) → Redis for streak caching. Background jobs (BullMQ) send daily reminder emails and aggregate weekly reports. Multi-tenant from day one using row-level security in Postgres.",
        techStack: [
            "Next.js",
            "TypeScript",
            "tRPC",
            "PostgreSQL",
            "Drizzle ORM",
            "Redis",
            "BullMQ",
            "Vercel",
            "Resend",
        ],
        outcome:
            "Reached 500 active users organically within 60 days of soft launch. 78% day-30 retention. Selected as a case study for a European SaaS conference talk on lean product development.",
        featured: true,
        category: "SaaS / Product",
    },
];
