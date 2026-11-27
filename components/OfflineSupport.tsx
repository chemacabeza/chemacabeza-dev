"use client";

import { useEffect } from "react";

/** Install a public offline message without caching the application itself. */
export default function OfflineSupport() {
    useEffect(() => {
        if (process.env.NODE_ENV !== "production" || !window.isSecureContext ||
            !("serviceWorker" in navigator)) {
            return;
        }

        void navigator.serviceWorker.register("/sw.js", {
            scope: "/",
            updateViaCache: "none",
        }).catch(() => {
            // Offline support is optional; registration must not break the site.
            console.warn("The offline page could not be enabled.");
        });
    }, []);

    return null;
}
