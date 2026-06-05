import Link from "next/link";

// Rendered once by the post template (app/writing/[slug]/page.tsx), so it
// appears at the end of every post — existing and future — with no per-post
// edits. Update these URLs in one place.
const MEDIUM_URL = "https://medium.com/@chemacabeza";
const LINKEDIN_URL = "https://www.linkedin.com/in/jcabeza/";

const linkClass =
    "text-indigo-400 hover:text-indigo-300 font-medium transition-colors";

export default function FollowLinks() {
    return (
        <aside className="mt-12 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 sm:p-8">
            <p className="text-slate-400 leading-relaxed">
                You can also follow my writing on{" "}
                <a
                    href={MEDIUM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                >
                    Medium
                </a>{" "}
                and{" "}
                <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                >
                    LinkedIn
                </a>
                . For a complete archive, visit my{" "}
                <Link href="/writing" className={linkClass}>
                    writing page
                </Link>
                .
            </p>
        </aside>
    );
}
