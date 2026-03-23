import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/mdx";
import { createMetadata } from "@/lib/metadata";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) return {};
    return createMetadata({
        title: post.frontmatter.title,
        description: post.frontmatter.description,
        path: `/writing/${slug}`,
    });
}

export default async function PostPage({ params }: Props) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) notFound();

    const { frontmatter, content, readingTime } = post;

    return (
        <div className="pt-24 pb-32">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-indigo-600/5 blur-[100px]" />
            </div>

            <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
                {/* Back */}
                <Link
                    href="/writing"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 mb-10 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    All articles
                </Link>

                {/* Header */}
                <header className="mb-12">
                    {frontmatter.tags && (
                        <div className="flex flex-wrap gap-1.5 mb-5">
                            {frontmatter.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-100 mb-4 leading-tight">
                        {frontmatter.title}
                    </h1>

                    <p className="text-lg text-slate-400 mb-6 leading-relaxed">
                        {frontmatter.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-slate-500 pb-8 border-b border-slate-800/60">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {new Date(frontmatter.date).toLocaleDateString("en-GB", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {readingTime}
                        </span>
                    </div>
                </header>

                {/* MDX content */}
                <article className="prose prose-invert sm:prose-lg max-w-none overflow-hidden">
                    <MDXRemote source={content} />
                </article>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-slate-800/40">
                    <Link
                        href="/writing"
                        className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Back to all articles
                    </Link>
                </div>
            </div>
        </div>
    );
}
