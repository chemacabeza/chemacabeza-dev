"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

declare global {
    interface Window {
        hljs?: { highlightAll: () => void };
    }
}

export default function SyntaxHighlighter() {
    const pathname = usePathname();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const isReady = loaded || (typeof window !== "undefined" && Boolean(window.hljs));
        if (isReady && window.hljs) {
            document.querySelectorAll("pre code").forEach((block) => {
                block.removeAttribute("data-highlighted");
            });
            setTimeout(() => {
                window.hljs?.highlightAll();
            }, 50);
        }
    }, [pathname, loaded]);

    return (
        <Script
            src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"
            onLoad={() => setLoaded(true)}
        />
    );
}
