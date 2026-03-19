import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-indigo-600/8 blur-[100px]" />
            </div>

            <div className="relative">
                <p className="text-8xl font-black text-indigo-500/20 mb-2 font-mono">404</p>
                <h1 className="text-3xl font-bold text-slate-100 mb-3">Page not found</h1>
                <p className="text-slate-400 text-lg mb-8 max-w-sm">
                    This URL doesn&apos;t exist — or it used to, and it moved.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
                >
                    Back home <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
