import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { projects } from "@/lib/projects";
import { createMetadata, siteConfig } from "@/lib/metadata";
import { getAllPosts } from "@/lib/mdx";
import { creativeWorkSchema, breadcrumbSchema } from "@/lib/jsonld";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";

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
        description: project.description,
        path: `/projects/${slug}`,
        ogImageAlt: `${project.title} — ${project.tagline}`,
    });
}

/** Articles whose tags overlap a project's tech stack / category, for cross-linking. */
function relatedArticles(techStack: string[], category: string, limit = 3) {
    const needles = [...techStack, category].map((s) => s.toLowerCase());
    return getAllPosts()
        .map((post) => {
            const tags = (post.frontmatter.tags ?? []).map((t) => t.toLowerCase());
            const score = tags.filter((t) =>
                needles.some((n) => n.includes(t) || t.includes(n))
            ).length;
            return { post, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((x) => x.post);
}

export default async function ProjectDetailPage({ params }: Props) {
    const { slug } = await params;
    const project = projects.find((p) => p.slug === slug);

    if (!project) notFound();

    const projectUrl = `${siteConfig.url}/projects/${slug}`;
    const related = relatedArticles(project.techStack, project.category);

    return (
        <>
            <JsonLd
                data={[
                    breadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "Projects", path: "/projects" },
                        { name: project.title, path: `/projects/${slug}` },
                    ]),
                    creativeWorkSchema({
                        title: project.title,
                        description: project.description,
                        url: projectUrl,
                        keywords: project.techStack,
                        category: project.category,
                    }),
                ]}
            />
            <div className="pt-24 pb-32">
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[120px]" />
                </div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs
                        items={[
                            { name: "Home", path: "/" },
                            { name: "Projects", path: "/projects" },
                            { name: project.title },
                        ]}
                    />

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
                            Technologies
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

                    {/* Related writing — project-to-article links */}
                    {related.length > 0 && (
                        <section className="mt-16" aria-labelledby="related-writing">
                            <h2
                                id="related-writing"
                                className="text-sm font-semibold uppercase tracking-widest text-indigo-400 mb-4"
                            >
                                Related writing
                            </h2>
                            <ul className="space-y-3">
                                {related.map((r) => (
                                    <li key={r.slug}>
                                        <Link
                                            href={`/writing/${r.slug}`}
                                            className="group flex items-start gap-3 rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 hover:border-indigo-500/40 hover:bg-slate-900/70 transition-all"
                                        >
                                            <ArrowRight className="w-4 h-4 text-indigo-400 mt-1 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                            <span className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors leading-snug">
                                                {r.frontmatter.title}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

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
        </>
    );
}
