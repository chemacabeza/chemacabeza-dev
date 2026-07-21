import Link from "next/link";
import { siteConfig } from "@/lib/metadata";

/**
 * Concise author biography shown at the foot of each article, with a link to
 * the full About page. Reinforces authorship (E-E-A-T) and internal linking.
 */
export default function AuthorBio() {
    return (
        <aside className="mt-12 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2">
                About the author
            </p>
            <p className="text-slate-400 leading-relaxed">
                <span className="text-slate-200 font-medium">{siteConfig.author.name}</span>{" "}
                is an Engineering Manager and System Architect based in Berlin with 15+ years
                building high-performance backend systems, distributed architectures, and the
                engineering teams that ship them.{" "}
                <Link
                    href="/about"
                    className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2"
                >
                    Read more about me
                </Link>
                .
            </p>
        </aside>
    );
}
