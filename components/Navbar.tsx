"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Code2 } from "lucide-react";

const navLinks = [
    { href: "/about", label: "About" },
    { href: "/projects", label: "Projects" },
    { href: "/writing", label: "Writing" },
    { href: "/hobbies", label: "Hobbies" },
    { href: "/now", label: "Now" },
    { href: "/contact", label: "Contact" },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || open
                ? "bg-[#020817]/95 backdrop-blur-md border-b border-slate-800/60 shadow-lg shadow-black/20"
                : "bg-transparent"
                }`}
        >
            <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                            <Code2 className="w-4 h-4 text-indigo-400" />
                        </div>
                        <span className="font-bold text-slate-100 tracking-tight">
                            chema<span className="text-indigo-400">cabeza</span>
                            <span className="text-slate-500">.dev</span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive =
                                link.href === "/"
                                    ? pathname === "/"
                                    : pathname.startsWith(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                                        ? "text-indigo-400 bg-indigo-500/10"
                                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setOpen(!open)}
                        className="md:hidden p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors focus:outline-none"
                        aria-label="Toggle menu"
                    >
                        {open ? <X className="w-5 h-5 transition-transform duration-300 rotate-0" /> : <Menu className="w-5 h-5 transition-transform duration-300" />}
                    </button>
                </div>

                {/* Mobile menu */}
                <div 
                    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                        open ? "max-h-96 opacity-100 border-t border-slate-800/60" : "max-h-0 opacity-0 pointer-events-none"
                    }`}
                >
                    <div className="py-4 space-y-1">
                        {navLinks.map((link) => {
                            const isActive =
                                link.href === "/"
                                    ? pathname === "/"
                                    : pathname.startsWith(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`block px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                                        ? "text-indigo-400 bg-indigo-500/10"
                                        : "text-slate-300 hover:text-slate-100 hover:bg-slate-800/60"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </header>
    );
}
