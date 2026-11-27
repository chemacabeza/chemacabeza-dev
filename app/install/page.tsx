import type { Metadata } from "next";
import Image from "next/image";
import InstallApp from "@/components/InstallApp";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
    title: "Install the app",
    description: "Install chemacabeza.dev on your Android phone and open projects and articles from your home screen.",
    path: "/install",
});

export default function InstallPage() {
    return (
        <div className="mx-auto max-w-2xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
            <header className="mb-8">
                <Image
                    src="/icons/icon-192.png"
                    alt=""
                    width={80}
                    height={80}
                    unoptimized
                    className="mb-6 rounded-2xl"
                />
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-indigo-300">
                    chemacabeza.dev
                </p>
                <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-100 sm:text-5xl">
                    Your website.<br />On your home screen.
                </h1>
                <p className="mt-5 text-lg leading-relaxed text-slate-300">
                    Keep the latest projects and writing a tap away with the chemacabeza.dev app.
                </p>
            </header>
            <InstallApp />
        </div>
    );
}
