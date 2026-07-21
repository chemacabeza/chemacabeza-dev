import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: siteConfig.name,
        short_name: "chemacabeza.dev",
        description: siteConfig.description,
        start_url: "/",
        display: "standalone",
        background_color: "#020817",
        theme_color: "#020817",
        icons: [
            {
                src: "/icon.svg",
                type: "image/svg+xml",
                sizes: "any",
                purpose: "any",
            },
        ],
    };
}
