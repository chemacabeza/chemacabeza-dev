import { Metadata } from "next";
import { createMetadata, siteConfig } from "@/lib/metadata";
import Link from "next/link";
import { Mail, Github, MessageCircle, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = createMetadata({
    title: "Support",
    description:
        "Get help and support for projects, tools, and services by José María Cabeza Rodríguez.",
    path: "/support",
});

const faqs = [
    {
        q: "How do I report a bug or issue?",
        a: "Open an issue on the relevant GitHub repository with a clear description, steps to reproduce, and any relevant logs or screenshots. I triage issues weekly.",
    },
    {
        q: "Can I request a new feature?",
        a: 'Absolutely. Feature requests are welcome as GitHub issues tagged with "enhancement". I prioritise based on impact and alignment with the project roadmap.',
    },
    {
        q: "How long does it take to get a response?",
        a: "I aim to acknowledge all inquiries within 48 hours on business days. Complex issues may take longer to resolve, but you'll always get an initial response.",
    },
    {
        q: "Do you offer paid consulting or support?",
        a: "Yes. For dedicated support, architecture reviews, or engineering coaching, you can book a paid session through my Contact page.",
    },
    {
        q: "Is there a community or forum?",
        a: "Not at this time. The best channels are GitHub Discussions on the relevant repository, or reaching out directly via email.",
    },
];

const channels = [
    {
        icon: Mail,
        label: "Email",
        value: siteConfig.author.email,
        href: `mailto:${siteConfig.author.email}`,
        description: "For general enquiries and private matters.",
        color: "indigo",
    },
    {
        icon: Github,
        label: "GitHub Issues",
        value: "github.com/chemacabeza",
        href: siteConfig.author.github,
        description: "For bug reports and feature requests on specific projects.",
        color: "violet",
    },
    {
        icon: MessageCircle,
        label: "Contact Page",
        value: "chemacabeza.dev/contact",
        href: "/contact",
        description: "All contact options including free and paid meetings.",
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

export default function SupportPage() {
    return (
        <div className="pt-24 pb-32">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[100px]" />
                <div className="absolute bottom-40 left-0 w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-[100px]" />
            </div>

            <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="mb-14">
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4">
                        Support
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-100 mb-4 leading-tight">
                        How can I{" "}
                        <span className="gradient-text">help?</span>
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
                        Whether you&apos;ve found a bug, need guidance on a project, or want to discuss a
                        collaboration — here&apos;s how to reach me and what to expect.
                    </p>
                </div>

                {/* Support channels */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-slate-100 mb-6">Support channels</h2>
                    <div className="space-y-4">
                        {channels.map(({ icon: Icon, label, value, href, description, color }) => {
                            const isExternal = href.startsWith("http") || href.startsWith("mailto");
                            const Comp = isExternal ? "a" : Link;
                            const extra = isExternal
                                ? { target: href.startsWith("mailto") ? undefined : "_blank", rel: "noopener noreferrer" }
                                : {};

                            return (
                                <Comp
                                    key={label}
                                    href={href}
                                    {...extra}
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
                                </Comp>
                            );
                        })}
                    </div>
                </section>

                {/* Response times */}
                <section className="mb-16">
                    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-7">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <Clock className="w-4 h-4 text-indigo-400" />
                            </div>
                            <h2 className="font-bold text-slate-100 text-lg">Expected response times</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { label: "Email", time: "Within 48 hours" },
                                { label: "GitHub Issues", time: "Within 1 week" },
                                { label: "Paid sessions", time: "Next available slot" },
                            ].map(({ label, time }) => (
                                <div
                                    key={label}
                                    className="rounded-lg border border-slate-800/40 bg-slate-900/60 p-4 text-center"
                                >
                                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
                                    <p className="font-semibold text-slate-200 text-sm">{time}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section>
                    <h2 className="text-2xl font-bold text-slate-100 mb-6">
                        Frequently asked questions
                    </h2>
                    <div className="space-y-4">
                        {faqs.map(({ q, a }, idx) => (
                            <div
                                key={idx}
                                className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6 hover:border-indigo-500/30 transition-all duration-300"
                            >
                                <h3 className="font-bold text-slate-100 mb-2">{q}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{a}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
