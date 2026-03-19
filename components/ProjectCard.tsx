import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Project } from "@/lib/projects";

interface ProjectCardProps {
    project: Project;
    variant?: "grid" | "featured";
}

export default function ProjectCard({
    project,
    variant = "grid",
}: ProjectCardProps) {
    return (
        <Link href={`/projects/${project.slug}`} className="group block h-full">
            <article className="relative h-full rounded-xl border border-slate-800/60 bg-slate-900/40 p-6 hover:border-indigo-500/40 hover:bg-slate-900/70 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 flex flex-col">
                {/* Category badge */}
                <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-4 self-start">
                    {project.category}
                </span>

                <h3
                    className={`font-bold text-slate-100 mb-2 group-hover:text-indigo-300 transition-colors leading-snug ${variant === "featured" ? "text-xl" : "text-lg"
                        }`}
                >
                    {project.title}
                </h3>

                <p className="text-sm text-slate-400 leading-relaxed mb-4 flex-1">
                    {project.tagline}
                </p>

                {/* Tech stack */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                    {project.techStack.slice(0, 4).map((tech) => (
                        <span
                            key={tech}
                            className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60"
                        >
                            {tech}
                        </span>
                    ))}
                    {project.techStack.length > 4 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-500">
                            +{project.techStack.length - 4} more
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1.5 text-sm text-indigo-400 font-medium group-hover:gap-2.5 transition-all">
                    View case study <ArrowRight className="w-4 h-4" />
                </div>
            </article>
        </Link>
    );
}
