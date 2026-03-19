import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Post } from "@/lib/mdx";

interface ArticleCardProps {
    post: Post;
    featured?: boolean;
}

export default function ArticleCard({ post, featured = false }: ArticleCardProps) {
    const { slug, frontmatter, readingTime, excerpt } = post;

    return (
        <Link href={`/writing/${slug}`} className="group block">
            <article
                className={`relative h-full rounded-xl border border-slate-800/60 bg-slate-900/40 p-6 hover:border-indigo-500/40 hover:bg-slate-900/70 transition-all duration-300 ${featured ? "hover:shadow-lg hover:shadow-indigo-500/10" : ""
                    }`}
            >
                {/* Tags */}
                {frontmatter.tags && frontmatter.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {frontmatter.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-indigo-300 transition-colors leading-snug">
                    {frontmatter.title}
                </h3>

                {excerpt && (
                    <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-3">
                        {excerpt}
                    </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(frontmatter.date).toLocaleDateString("en-GB", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {readingTime}
                        </span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-indigo-400 font-medium group-hover:gap-2 transition-all">
                        Read <ArrowRight className="w-3 h-3" />
                    </span>
                </div>
            </article>
        </Link>
    );
}
