import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata";

export default function manifest(): MetadataRoute.Manifest {
    return {
        // Match the existing start_url-based identity for installed web apps.
        id: "/",
        name: siteConfig.name,
        short_name: "chemacabeza.dev",
        description: siteConfig.description,
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#020817",
        theme_color: "#020817",
        icons: [
            {
                src: "/icons/icon-192.png",
                type: "image/png",
                sizes: "192x192",
                purpose: "any",
            },
            {
                src: "/icons/icon-512.png",
                type: "image/png",
                sizes: "512x512",
                purpose: "any",
            },
            {
                src: "/icons/icon-maskable-512.png",
                type: "image/png",
                sizes: "512x512",
                purpose: "maskable",
            },
            {
                src: "/icon.svg",
                type: "image/svg+xml",
                sizes: "any",
                purpose: "any",
            },
        ],
    };
}
