import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { projects } from "@/lib/projects";
import { createMetadata } from "@/lib/metadata";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const project = projects.find((p) => p.slug === slug);
    if (!project) return {};
    return createMetadata({
        title: project.title,
        description: project.tagline,
        path: `/projects/${slug}`,
    });
}

export default async function ProjectDetailPage({ params }: Props) {
    const { slug } = await params;
    const project = projects.find((p) => p.slug === slug);

    if (!project) notFound();

    return (
        <div className="pt-24 pb-32">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[120px]" />
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back */}
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 mb-10 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    All projects
                </Link>

                {/* Header */}
                <div className="mb-12">
                    <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-4">
                        {project.category}
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-100 mb-3 leading-tight">
                        {project.title}
                    </h1>
                    <p className="text-xl text-slate-400">{project.tagline}</p>
                </div>

                {/* Tech stack */}
                <div className="mb-12 p-6 rounded-xl border border-slate-800/60 bg-slate-900/40">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
                        Tech Stack
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {project.techStack.map((tech) => (
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
                <div className="space-y-10">
                    {[
                        { label: "Overview", content: project.description },
                        { label: "The Problem", content: project.problem },
                        { label: "The Solution", content: project.solution },
                        { label: "Architecture", content: project.architecture },
                        { label: "Outcome & Impact", content: project.outcome },
                    ].map(({ label, content }) => (
                        <section key={label}>
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-indigo-400 mb-3">
                                {label}
                            </h2>
                            <p className="text-slate-300 leading-relaxed text-[17px]">{content}</p>
                        </section>
                    ))}
                </div>

                {/* Back link */}
                <div className="mt-16 pt-8 border-t border-slate-800/40">
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Back to all projects
                    </Link>
                </div>
            </div>
        </div>
    );
}
