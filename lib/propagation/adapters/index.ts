import type { Platform, Publisher } from "../types";
import { MediumAdapter } from "./medium";
import { SubstackAdapter } from "./substack";
import { LinkedInAdapter } from "./linkedin";

export const PLATFORMS: Platform[] = ["substack", "medium", "linkedin"];

export function getAdapter(platform: Platform): Publisher {
    switch (platform) {
        case "medium":
            return new MediumAdapter();
        case "substack":
            return new SubstackAdapter();
        case "linkedin":
            return new LinkedInAdapter();
    }
}

export { MediumAdapter, SubstackAdapter, LinkedInAdapter };
