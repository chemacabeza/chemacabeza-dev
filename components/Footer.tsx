import Link from "next/link";
import { Github, Linkedin, Mail, Code2 } from "lucide-react";
import { siteConfig } from "@/lib/metadata";

export default function Footer() {
    const year = new Date().getFullYear();

    const socials = [
        {
            href: siteConfig.author.github,
            label: "GitHub",
            icon: Github,
        },
        {
            href: siteConfig.author.linkedin,
            label: "LinkedIn",
            icon: Linkedin,
        },
        {
            href: `mailto:${siteConfig.author.email}`,
            label: "Email",
            icon: Mail,
        },
    ];

    return (
        <footer className="border-t border-slate-800/60 bg-background">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Brand */}
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-7 h-7 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                            </div>
                            <span className="font-bold text-slate-300 text-sm tracking-tight">
                                chema<span className="text-indigo-400">cabeza</span>
                                <span className="text-slate-500">.dev</span>
                            </span>
                        </Link>
                        <p className="text-xs text-slate-500 text-center md:text-left max-w-xs">
                            Building high-performance systems and engineering teams that ship.
                        </p>
                    </div>

                    {/* Nav */}
                    <nav className="flex flex-wrap justify-center gap-5 text-sm text-slate-500">
                        {[
                            ["About", "/about"],
                            ["Projects", "/projects"],
                            ["Writing", "/writing"],
                            ["Hobbies", "/hobbies"],
                            ["Now", "/now"],
                            ["Contact", "/contact"],
                        ].map(([label, href]) => (
                            <Link
                                key={href}
                                href={href}
                                className="hover:text-slate-300 transition-colors"
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* Socials */}
                    <div className="flex items-center gap-3">
                        {socials.map(({ href, label, icon: Icon }) => (
                            <a
                                key={label}
                                href={href}
                                target={href.startsWith("mailto") ? undefined : "_blank"}
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="p-2 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all"
                            >
                                <Icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800/40 text-center text-xs text-slate-600">
                    <p>
                        © {year} {siteConfig.name}. Built with Next.js & Tailwind CSS.
                        Deployed on Vercel.
                    </p>
                </div>
            </div>
        </footer>
    );
}
