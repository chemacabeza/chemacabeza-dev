import { Metadata } from "next";
import { Rss } from "lucide-react";
import { createMetadata } from "@/lib/metadata";
import { getAllPosts } from "@/lib/mdx";
import ArticleCard from "@/components/ArticleCard";
import SectionHeader from "@/components/SectionHeader";
import NewsletterForm from "@/components/NewsletterForm";
import JsonLd from "@/components/JsonLd";
import { blogSchema, breadcrumbSchema } from "@/lib/jsonld";

export const metadata: Metadata = createMetadata({
    title: "Writing — System Design & Engineering",
    description:
        "Technical writing on system design, distributed systems, Java and Spring Boot, backend engineering, software architecture, AI, and engineering leadership.",
    path: "/writing",
});

export default function WritingPage() {
    const posts = getAllPosts();
    const allTags = Array.from(
        new Set(posts.flatMap((p) => p.frontmatter.tags))
    ).sort();

    return (
        <div className="pt-24 pb-32">
            <JsonLd
                data={[
                    breadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "Writing", path: "/writing" },
                    ]),
                    blogSchema(
                        "/writing",
                        posts.map((p) => ({
                            slug: p.slug,
                            title: p.frontmatter.title,
                            description: p.frontmatter.description,
                            date: p.frontmatter.date,
                        }))
                    ),
                ]}
            />
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[100px]" />
            </div>

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader
                    as="h1"
                    label="Writing"
                    title="Thoughts on the craft"
                    description="Deep dives and hard-earned lessons on system design, distributed systems, Java and backend architecture, software engineering, AI, and leading engineering teams at scale."
                />

                {/* Tags + RSS */}
                <div className="flex flex-wrap items-center gap-2 mb-10">
                    {allTags.map((tag) => (
                        <span
                            key={tag}
                            className="text-xs font-medium px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60"
                        >
                            {tag}
                        </span>
                    ))}
                    <a
                        href="/rss.xml"
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                    >
                        <Rss className="w-3 h-3" /> RSS feed
                    </a>
                </div>

                <NewsletterForm />

                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <ArticleCard key={post.slug} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-20 text-center">
                        <p className="text-slate-500 text-lg mb-2">Articles coming soon.</p>
                        <p className="text-slate-600 text-sm">
                            Check back soon — I&apos;m writing about microservices, performance, and engineering leadership.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
