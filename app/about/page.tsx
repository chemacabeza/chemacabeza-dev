import { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
    title: "About",
    description:
        "Engineering Manager with 15+ years building high-performance backend systems, distributed architectures, and the teams that ship them.",
    path: "/about",
});

const experience = [
    {
        period: "2021 — Present",
        role: "Engineering Manager",
        company: "Scale-up (FinTech)",
        description:
            "Leading a team of 12 engineers across 3 squads. Drove a platform re-architecture that reduced infrastructure costs by 40% while doubling throughput. Established engineering excellence practices: on-call rotation, blameless post-mortems, RFC culture.",
    },
    {
        period: "2018 — 2021",
        role: "Senior Backend Engineer → Staff Engineer",
        company: "E-commerce Platform",
        description:
            "Designed and implemented the event-driven inventory system processing 2M+ events/day. Mentored 6 engineers from mid to senior level. Led the migration from a monolith to service-oriented architecture across 18 months.",
    },
    {
        period: "2015 — 2018",
        role: "Backend Engineer",
        company: "Digital Agency",
        description:
            "Built APIs and backend systems for clients across finance, media, and retail. Introduced automated testing culture — test coverage went from 12% to 78% in 12 months.",
    },
    {
        period: "2010 — 2015",
        role: "Full-Stack Developer",
        company: "Various (freelance + startups)",
        description:
            "Shipped 20+ projects from 0→1. Learned the value of constraints, simplicity, and shipping fast. Built the foundation of full-stack intuition that I still use every day.",
    },
];

const principles = [
    {
        number: "01",
        title: "Simplicity is a feature",
        desc: "Complex systems fail in complex ways. I ruthlessly cut scope and complexity. The best code is often the code you don't write.",
    },
    {
        number: "02",
        title: "Observability-first",
        desc: "You cannot debug what you cannot see. Every system I build ships with structured logging, distributed traces, and meaningful metrics from day one.",
    },
    {
        number: "03",
        title: "Strong opinions, loosely held",
        desc: "I form clear technical positions and defend them with data — but I change my mind when presented with better evidence. Intellectual integrity over ego.",
    },
    {
        number: "04",
        title: "Autonomy through context",
        desc: "The best teams don't need micromanagement. I invest in giving engineers deep context on business goals so they can make great decisions independently.",
    },
    {
        number: "05",
        title: "Ship, learn, iterate",
        desc: "Perfect is the enemy of shipped. I lean into iterative delivery, measure outcomes, and compound learnings. Momentum beats perfection.",
    },
    {
        number: "06",
        title: "Write more than you think",
        desc: "Writing clarifies thinking. RFCs, post-mortems, ADRs — documentation is not overhead. It is how knowledge outlives the people who had it.",
    },
];

export default function AboutPage() {
    return (
        <div className="pt-24 pb-32">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[100px]" />
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-16">
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4">
                        About
                    </span>
                    <h1 className="text-5xl sm:text-6xl font-black text-slate-100 mb-6 leading-tight">
                        Building systems
                        <br />
                        <span className="gradient-text">and the teams</span> behind them.
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
                        I&apos;m Chema Cabeza — an Engineering Manager based in Spain with 15+ years of experience
                        designing backend systems, distributed architectures, and high-performing engineering teams.
                    </p>
                </div>

                {/* Professional story */}
                <section className="mb-20">
                    <h2 className="text-2xl font-bold text-slate-100 mb-6">My story</h2>
                    <div className="space-y-5 text-slate-400 leading-relaxed text-[17px]">
                        <p>
                            I started writing code in my teens — mostly because I was curious and slightly obsessed
                            with how things worked. That curiosity turned into a career. I spent my early years as a
                            freelance full-stack developer, building products from scratch and learning what it
                            actually takes to ship software that works.
                        </p>
                        <p>
                            Over time I gravitated toward backend systems. The combination of constraints, scale, and
                            the need for rigorous thinking resonated with how my brain works. I became obsessed with
                            distributed systems, event-driven architecture, and the craft of building things that
                            don&apos;t break at 3am.
                        </p>
                        <p>
                            My shift to engineering management wasn&apos;t a career pivot — it was a natural extension.
                            I realised that the highest-leverage thing I could do was to make other engineers more
                            effective. Coaching, system design, technical strategy, culture-building — these became
                            the craft. I never stopped being an engineer; I just became a different kind.
                        </p>
                        <p>
                            Today I lead engineering teams building at the intersection of reliability, scale, and
                            product velocity. I care deeply about systems thinking, a11y, observability, and the kind
                            of engineering culture where people do the best work of their careers.
                        </p>
                    </div>
                </section>

                {/* Experience timeline */}
                <section className="mb-20">
                    <h2 className="text-2xl font-bold text-slate-100 mb-8">Experience</h2>
                    <div className="space-y-0">
                        {experience.map((item, idx) => (
                            <div
                                key={idx}
                                className="relative flex gap-6 pb-10 last:pb-0"
                            >
                                {/* Timeline line */}
                                {idx < experience.length - 1 && (
                                    <div className="absolute left-[5.5px] top-5 bottom-0 w-px bg-gradient-to-b from-indigo-500/30 to-transparent" />
                                )}
                                {/* Dot */}
                                <div className="mt-1.5 w-3 h-3 rounded-full bg-indigo-500/20 border-2 border-indigo-500/60 flex-shrink-0" />
                                <div>
                                    <span className="text-xs font-semibold text-indigo-400 tracking-wide">
                                        {item.period}
                                    </span>
                                    <h3 className="font-bold text-slate-100 text-lg mt-0.5">{item.role}</h3>
                                    <p className="text-sm text-slate-500 mb-2">{item.company}</p>
                                    <p className="text-slate-400 leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Engineering principles */}
                <section>
                    <h2 className="text-2xl font-bold text-slate-100 mb-3">Engineering principles</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        These aren&apos;t aspirational. They&apos;re the lens through which I evaluate every technical
                        decision and engineering interaction.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {principles.map(({ number, title, desc }) => (
                            <div
                                key={number}
                                className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6 hover:border-indigo-500/30 transition-all duration-300"
                            >
                                <span className="text-xs font-bold text-indigo-500/60 font-mono mb-3 block">
                                    {number}
                                </span>
                                <h3 className="font-bold text-slate-100 mb-2">{title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
