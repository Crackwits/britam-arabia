/* components/seo/JsonLd.tsx */

type SchemaDocument = Record<string, any>;

/**
 * Normalizes whatever came out of the Strapi `schema_markup` field into a
 * single valid JSON-LD document, or null if there's nothing usable.
 *
 * Handles:
 *   - object            -> used as-is
 *   - JSON string       -> parsed
 *   - array of nodes    -> wrapped in @graph
 *   - wrapped in <script type="application/ld+json"> tags (editors paste these)
 *   - missing @context  -> injected
 *   - null / "" / "{}"  -> null
 */
export function normalizeSchema(raw: unknown): SchemaDocument | null {
    if (raw === null || raw === undefined) return null;

    let value: any = raw;

    if (typeof value === "string") {
        let text = value.trim();
        if (!text) return null;

        // Editors often paste the whole <script> block from a generator.
        const scriptMatch = text.match(
            /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/i
        );
        if (scriptMatch) text = scriptMatch[1].trim();

        try {
            value = JSON.parse(text);
        } catch {
            if (process.env.NODE_ENV !== "production") {
                console.warn(
                    "[JsonLd] schema_markup is not valid JSON — skipping.",
                    text.slice(0, 200)
                );
            }
            return null;
        }
    }

    if (typeof value !== "object") return null;

    // Bare array of nodes -> a proper graph document.
    if (Array.isArray(value)) {
        const nodes = value.filter(
            (n) => n && typeof n === "object" && !Array.isArray(n)
        );
        if (!nodes.length) return null;
        return {
            "@context": "https://schema.org",
            "@graph": nodes.map(stripContext),
        };
    }

    // Empty object isn't worth emitting.
    if (!Object.keys(value).length) return null;

    return {
        "@context": value["@context"] ?? "https://schema.org",
        ...stripContext(value),
    };
}

function stripContext(node: Record<string, any>) {
    const { "@context": _drop, ...rest } = node;
    return rest;
}

/**
 * Escapes `<` so a string value containing `</script>` can't break out of the
 * tag. This is the real XSS vector when rendering CMS-authored JSON-LD.
 * U+2028/U+2029 are escaped because they're valid JSON but break JS parsing.
 */
function serialize(schema: SchemaDocument): string {
    return JSON.stringify(schema)
        .replace(/</g, "\\u003c")
        .replace(/\u2028/g, "\\u2028")
        .replace(/\u2029/g, "\\u2029");
}

export default function JsonLd({ data }: { data: unknown }) {
    const schema = normalizeSchema(data);
    if (!schema) return null;

    return (
        <script
            type="application/ld+json"
            // Safe: JSON.stringify output with `<` escaped above.
            dangerouslySetInnerHTML={{ __html: serialize(schema) }}
        />
    );
}