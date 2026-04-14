import { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { getAllPosts } from "@/lib/mdx";
import ArticleCard from "@/components/ArticleCard";
import SectionHeader from "@/components/SectionHeader";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata: Metadata = createMetadata({
    title: "Writing",
    description:
        "Thoughts on backend systems, distributed architecture, engineering leadership, and the craft of building software.",
    path: "/writing",
});

export default function WritingPage() {
    const posts = getAllPosts();
    const allTags = Array.from(
        new Set(posts.flatMap((p) => p.frontmatter.tags))
    ).sort();

    return (
        <div className="pt-24 pb-32">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[100px]" />
            </div>

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader
                    label="Writing"
                    title="Thoughts on the craft"
                    description="Opinions and hard-earned lessons about systems, teams, and engineering at scale."
                />

                {/* Tags */}
                {allTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-10">
                        {allTags.map((tag) => (
                            <span
                                key={tag}
                                className="text-xs font-medium px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

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
