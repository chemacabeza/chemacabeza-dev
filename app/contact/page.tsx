import { Metadata } from "next";
import { createMetadata, siteConfig } from "@/lib/metadata";
import { Github, Linkedin, Mail, ArrowRight } from "lucide-react";

export const metadata: Metadata = createMetadata({
    title: "Contact",
    description: "Get in touch with José María Cabeza Rodríguez — engineering leadership, collaboration, and speaking.",
    path: "/contact",
});

const links = [
    {
        icon: Mail,
        label: "Email",
        value: siteConfig.author.email,
        href: `mailto:${siteConfig.author.email}`,
        description: "Best for detailed conversations, collaborations, or opportunities.",
        color: "indigo",
    },
    {
        icon: Github,
        label: "GitHub",
        value: "github.com/chemacabeza",
        href: siteConfig.author.github,
        description: "Browse my open-source work, experiments, and contributions.",
        color: "violet",
    },
    {
        icon: Linkedin,
        label: "LinkedIn",
        value: "linkedin.com/in/jcabeza",
        href: siteConfig.author.linkedin,
        description: "Professional background, endorsements, and career history.",
        color: "blue",
    },
];

const colorMap: Record<string, string> = {
    indigo:
        "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/15",
    violet:
        "bg-violet-500/10 border-violet-500/20 text-violet-400 hover:border-violet-500/50 hover:bg-violet-500/15",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/15",
};

const iconBg: Record<string, string> = {
    indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
};

export default function ContactPage() {
    return (
        <div className="pt-24 pb-32">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[100px]" />
                <div className="absolute bottom-40 left-0 w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-[100px]" />
            </div>

            <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="mb-14">
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4">
                        Contact
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-100 mb-4 leading-tight">
                        Let&apos;s talk.
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        Whether you&apos;re looking for an Engineering Manager, want to collaborate on a technical project,
                        or just want to discuss distributed systems at length — I&apos;m up for it.
                    </p>
                </div>

                {/* Contact cards */}
                <div className="space-y-4 mb-14">
                    {links.map(({ icon: Icon, label, value, href, description, color }) => (
                        <a
                            key={label}
                            href={href}
                            target={href.startsWith("mailto") ? undefined : "_blank"}
                            rel="noopener noreferrer"
                            className={`group flex items-center gap-5 p-6 rounded-xl border transition-all duration-300 ${colorMap[color]}`}
                        >
                            <div
                                className={`w-11 h-11 rounded-lg border flex items-center justify-center flex-shrink-0 ${iconBg[color]}`}
                            >
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-slate-100 mb-0.5">{label}</div>
                                <div className="text-sm text-slate-400 truncate">{value}</div>
                                <div className="text-xs text-slate-500 mt-1 leading-snug">{description}</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </a>
                    ))}
                </div>

                {/* What I'm open to */}
                <section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-7">
                    <h2 className="font-bold text-slate-100 text-lg mb-4">What I&apos;m open to</h2>
                    <ul className="space-y-3">
                        {[
                            "Engineering management / VP Engineering roles",
                            "Technical advisory for early-stage startups",
                            "Conference talks and podcast appearances",
                            "Writing and content collaboration",
                            "Interesting technical conversations",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2.5 text-slate-400 text-sm leading-relaxed">
                                <span className="text-indigo-400 mt-0.5 font-bold">✓</span>
                                {item}
                            </li>
                        ))}
                    </ul>

                    <div className="mt-6 pt-5 border-t border-slate-800/40">
                        <p className="text-xs text-slate-500 leading-relaxed">
                            I do <strong className="text-slate-400">not</strong> accept cold outreach for freelance
                            work, link exchanges, or unsolicited pitches. I will not respond to those.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
