import { serializeJsonLd } from "@/lib/jsonld";

/**
 * Renders one or more JSON-LD objects into a server-rendered <script> tag.
 * Serialization (and `<`-escaping to prevent script injection) lives in
 * lib/jsonld.ts so it can be unit-tested.
 */
export default function JsonLd({
    data,
}: {
    data: Record<string, unknown> | Record<string, unknown>[];
}) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
    );
}
