import { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import SectionHeader from "@/components/SectionHeader";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = createMetadata({
    title: "Hobbies",
    description:
        "Personal projects and creative explorations in AI image generation, Stable Diffusion, and generative art.",
    path: "/hobbies",
});

const hobbyProjects = [
    {
        repo: "AI-related",
        url: "https://github.com/chemacabeza/my-github-projects/tree/master/AI-related",
        emoji: "🎨",
        title: "AI Image Generation Platform",
        subtitle: "Stable Diffusion · Fooocus · Model Library",
        description:
            "A local high-performance art platform using Stable Diffusion and Fooocus. Features a 46GB model library with 7 SDXL checkpoints and 41 LoRAs, optimized for Apple Silicon via MPS GPU acceleration. Includes a centralized storage architecture and pre-configured workflows for production-quality character and environment synthesis.",
        tags: ["Stable Diffusion", "SDXL", "LoRA", "Apple Silicon", "MPS", "Docker", "Fooocus"],
    },
];

export default function HobbiesPage() {
    return (
        <div className="pt-24 pb-32">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-fuchsia-600/5 blur-[100px]" />
            </div>

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader
                    label="Hobbies"
                    title="Creative side projects"
                    description="Things I build for fun — exploring generative AI, digital art, and creative technology outside of work."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hobbyProjects.map((proj) => (
                        <Link
                            key={proj.repo}
                            href={proj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group rounded-xl border border-slate-800/60 bg-slate-900/40 p-6 hover:border-fuchsia-500/40 hover:bg-slate-900/70 transition-all duration-300 flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <span className="text-3xl">{proj.emoji}</span>
                                <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-fuchsia-400 transition-colors flex-shrink-0 mt-1" />
                            </div>

                            {/* Title */}
                            <h3 className="font-bold text-slate-100 text-lg leading-snug mb-0.5 group-hover:text-fuchsia-300 transition-colors">
                                {proj.title}
                            </h3>
                            <p className="text-xs font-semibold text-fuchsia-500/80 mb-3 font-mono">
                                {proj.subtitle}
                            </p>

                            {/* Description */}
                            <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-5">
                                {proj.description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5">
                                {proj.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
