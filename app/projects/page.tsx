import { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { projects } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";
import SectionHeader from "@/components/SectionHeader";

export const metadata: Metadata = createMetadata({
    title: "Projects",
    description:
        "Selected engineering projects: AI voice generation, microservices observability, and SaaS products.",
    path: "/projects",
});

export default function ProjectsPage() {
    return (
        <div className="pt-24 pb-32">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-violet-600/5 blur-[100px]" />
            </div>

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader
                    label="Projects"
                    title="Work I'm proud of"
                    description="Systems and products built to solve real problems at scale. Each one taught me something new about the craft."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <ProjectCard key={project.slug} project={project} />
                    ))}
                </div>
            </div>
        </div>
    );
}
