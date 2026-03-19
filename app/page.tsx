import Link from "next/link";
import { ArrowRight, Github, Linkedin, Mail, ChevronDown, Cpu, Layers, BarChart3, Users } from "lucide-react";
import { Metadata } from "next";
import { siteConfig, createMetadata } from "@/lib/metadata";
import { getFeaturedPosts } from "@/lib/mdx";
import { projects } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";
import ArticleCard from "@/components/ArticleCard";
import SectionHeader from "@/components/SectionHeader";

export const metadata: Metadata = createMetadata({
  title: "Engineering Manager & System Architect",
  description: siteConfig.description,
});

const principles = [
  {
    icon: Layers,
    title: "Systems over components",
    desc: "A great system is greater than the sum of its parts. I design for composition, not isolation.",
  },
  {
    icon: Cpu,
    title: "Performance is product",
    desc: "Latency, throughput, and reliability aren't operational concerns — they're product features that compound.",
  },
  {
    icon: BarChart3,
    title: "Measure everything",
    desc: "Intuition gets you to good. Observability gets you to great. You can't improve what you can't see.",
  },
  {
    icon: Users,
    title: "People build systems",
    desc: "The best architecture is useless with a dysfunctional team. I invest in people as much as in code.",
  },
];

export default async function HomePage() {
  const featuredPosts = getFeaturedPosts(3);
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(to right, rgba(99,102,241,0.5) 1px, transparent 1px)`,
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="max-w-4xl">
            {/* Eyebrow */}
            <div className="animate-fade-in-up flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Available for engineering leadership roles
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up animation-delay-100 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
              <span className="text-slate-100">Engineering Manager</span>
              <br />
              <span className="gradient-text">building systems</span>
              <br />
              <span className="text-slate-100">that scale.</span>
            </h1>

            {/* Sub-headline */}
            <p className="animate-fade-in-up animation-delay-200 text-lg sm:text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl">
              15+ years designing backend systems, distributed architectures, and the engineering
              teams that ship them. I write about performance, reliability, and the craft of building
              software that lasts.
            </p>

            {/* CTAs */}
            <div className="animate-fade-in-up animation-delay-300 flex flex-wrap gap-4 mb-16">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5"
              >
                View my work <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/writing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-slate-100 font-semibold text-sm transition-all duration-200 hover:bg-slate-800/50"
              >
                Read my writing
              </Link>
            </div>

            {/* Social links */}
            <div className="animate-fade-in-up animation-delay-400 flex items-center gap-6">
              <span className="text-xs text-slate-600 font-medium uppercase tracking-widest">
                Find me on
              </span>
              {[
                { href: siteConfig.author.github, icon: Github, label: "GitHub" },
                { href: siteConfig.author.linkedin, icon: Linkedin, label: "LinkedIn" },
                { href: `mailto:${siteConfig.author.email}`, icon: Mail, label: "Email" },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-200 text-sm transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-600 animate-bounce">
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* ── FEATURED PROJECTS ── */}
      <section className="py-24 border-t border-slate-800/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <SectionHeader
              label="Selected Work"
              title="Projects I'm proud of"
              description="Systems that solve real problems at scale."
              className="mb-0"
            />
            <Link
              href="/projects"
              className="hidden sm:flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              All projects <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} variant="featured" />
            ))}
          </div>

          <div className="sm:hidden mt-6 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View all projects <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW I THINK ── */}
      <section className="py-24 border-t border-slate-800/40 bg-slate-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Philosophy"
            title="How I think about engineering"
            description="Four principles that guide every system I design and every team I build."
            align="center"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {principles.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-xl border border-slate-800/60 bg-slate-900/40 p-6 hover:border-indigo-500/30 hover:bg-slate-900/70 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-bold text-slate-100 mb-2 leading-snug">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED WRITING ── */}
      <section className="py-24 border-t border-slate-800/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <SectionHeader
              label="From the Blog"
              title="Recent writing"
              description="Opinions and lessons from 15 years in the trenches."
              className="mb-0"
            />
            <Link
              href="/writing"
              className="hidden sm:flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              All articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <ArticleCard key={post.slug} post={post} featured />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-12 text-center">
              <p className="text-slate-500">Articles coming soon.</p>
            </div>
          )}

          <div className="sm:hidden mt-6 text-center">
            <Link
              href="/writing"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View all articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 border-t border-slate-800/40 bg-slate-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-100 mb-4 leading-tight">
              Let&apos;s build something{" "}
              <span className="gradient-text">exceptional</span>.
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Open to engineering leadership roles, technical advisory, and interesting
              collaboration opportunities.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5"
              >
                Get in touch <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-slate-100 font-semibold transition-all"
              >
                Learn about me
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
