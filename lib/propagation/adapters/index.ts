import type { Platform, Publisher } from "../types";
import { MediumAdapter } from "./medium";
import { SubstackAdapter } from "./substack";
import { LinkedInAdapter } from "./linkedin";
import { DevToAdapter } from "./devto";

export const PLATFORMS: Platform[] = ["substack", "medium", "linkedin", "devto"];

export function getAdapter(platform: Platform): Publisher {
    switch (platform) {
        case "medium":
            return new MediumAdapter();
        case "substack":
            return new SubstackAdapter();
        case "linkedin":
            return new LinkedInAdapter();
        case "devto":
            return new DevToAdapter();
    }
}

export { MediumAdapter, SubstackAdapter, LinkedInAdapter, DevToAdapter };
