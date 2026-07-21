import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Clock, RefreshCw } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
    getAllPosts,
    getPostBySlug,
    getRelatedPosts,
    getAdjacentPosts,
} from "@/lib/mdx";
import { createMetadata, siteConfig } from "@/lib/metadata";
import { deriveCoverImage } from "@/lib/cover-image";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/jsonld";
import NewsletterForm from "@/components/NewsletterForm";
import FollowLinks from "@/components/FollowLinks";
import AuthorBio from "@/components/AuthorBio";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { mdxComponents } from "@/components/mdx";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
}

const dateFmt: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) return {};
    const coverImage = deriveCoverImage(post.content);
    return createMetadata({
        title: post.frontmatter.title,
        description: post.frontmatter.description,
        path: `/writing/${slug}`,
        ogImage: coverImage,
        ogImageAlt: post.frontmatter.title,
        type: "article",
        publishedTime: post.frontmatter.date,
        modifiedTime: post.frontmatter.updated,
        tags: post.frontmatter.tags,
        section: post.frontmatter.tags?.[0],
    });
}

export default async function PostPage({ params }: Props) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) notFound();

    const { frontmatter, content, readingTime } = post;
    const coverImage = deriveCoverImage(content);
    const postUrl = `${siteConfig.url}/writing/${slug}`;
    const related = getRelatedPosts(slug, 3);
    const { previous, next } = getAdjacentPosts(slug);
    const section = frontmatter.tags?.[0];
    const updated =
        frontmatter.updated && frontmatter.updated !== frontmatter.date
            ? frontmatter.updated
            : undefined;

    return (
        <>
            <JsonLd
                data={[
                    breadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "Writing", path: "/writing" },
                        { name: frontmatter.title, path: `/writing/${slug}` },
                    ]),
                    blogPostingSchema({
                        title: frontmatter.title,
                        description: frontmatter.description,
                        url: postUrl,
                        datePublished: frontmatter.date,
                        dateModified: frontmatter.updated,
                        image: coverImage,
                        tags: frontmatter.tags,
                        section,
                    }),
                ]}
            />
            <div className="pt-24 pb-32">
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-indigo-600/5 blur-[100px]" />
                </div>

                <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
                    <Breadcrumbs
                        items={[
                            { name: "Home", path: "/" },
                            { name: "Writing", path: "/writing" },
                            { name: frontmatter.title },
                        ]}
                    />

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

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 pb-8 border-b border-slate-800/60">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <time dateTime={frontmatter.date}>
                                    {new Date(frontmatter.date).toLocaleDateString("en-GB", dateFmt)}
                                </time>
                            </span>
                            {updated && (
                                <span className="flex items-center gap-1.5">
                                    <RefreshCw className="w-4 h-4" />
                                    Updated{" "}
                                    <time dateTime={updated}>
                                        {new Date(updated).toLocaleDateString("en-GB", dateFmt)}
                                    </time>
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {readingTime}
                            </span>
                        </div>
                    </header>

                    {/* MDX content */}
                    <article className="prose prose-invert sm:prose-lg max-w-none overflow-hidden">
                        <MDXRemote source={content} components={mdxComponents} />
                    </article>

                    {/* Author bio + about link */}
                    <AuthorBio />

                    {/* Related reading */}
                    {related.length > 0 && (
                        <section className="mt-12" aria-labelledby="related-heading">
                            <h2
                                id="related-heading"
                                className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4"
                            >
                                Related reading
                            </h2>
                            <ul className="space-y-3">
                                {related.map((r) => (
                                    <li key={r.slug}>
                                        <Link
                                            href={`/writing/${r.slug}`}
                                            className="group flex items-start gap-3 rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 hover:border-indigo-500/40 hover:bg-slate-900/70 transition-all"
                                        >
                                            <ArrowRight className="w-4 h-4 text-indigo-400 mt-1 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                            <span>
                                                <span className="block font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors leading-snug">
                                                    {r.frontmatter.title}
                                                </span>
                                                <span className="block text-sm text-slate-500 mt-0.5">
                                                    {r.frontmatter.description}
                                                </span>
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Cross-posting / archive links — shown on every post */}
                    <FollowLinks />

                    <div className="mt-12">
                        <NewsletterForm />
                    </div>

                    {/* Prev / next navigation */}
                    {(previous || next) && (
                        <nav
                            aria-label="More articles"
                            className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                            {previous ? (
                                <Link
                                    href={`/writing/${previous.slug}`}
                                    className="group rounded-xl border border-slate-800/60 bg-slate-900/40 p-5 hover:border-indigo-500/40 transition-all"
                                    rel="prev"
                                >
                                    <span className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                                        <ArrowLeft className="w-3.5 h-3.5" /> Older
                                    </span>
                                    <span className="block font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors leading-snug">
                                        {previous.frontmatter.title}
                                    </span>
                                </Link>
                            ) : (
                                <span />
                            )}
                            {next && (
                                <Link
                                    href={`/writing/${next.slug}`}
                                    className="group rounded-xl border border-slate-800/60 bg-slate-900/40 p-5 hover:border-indigo-500/40 transition-all sm:text-right"
                                    rel="next"
                                >
                                    <span className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 sm:justify-end">
                                        Newer <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                    <span className="block font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors leading-snug">
                                        {next.frontmatter.title}
                                    </span>
                                </Link>
                            )}
                        </nav>
                    )}

                    {/* Footer */}
                    <div className="mt-10 pt-8 border-t border-slate-800/40">
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
        </>
    );
}
