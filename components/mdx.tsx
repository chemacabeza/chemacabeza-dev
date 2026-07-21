import type { ComponentPropsWithoutRef, ReactNode } from "react";

/** Extract plain text from arbitrary React children (for heading slugs). */
function textOf(node: ReactNode): string {
    if (node == null || typeof node === "boolean") return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(textOf).join("");
    if (typeof node === "object" && "props" in node) {
        return textOf((node as { props: { children?: ReactNode } }).props.children);
    }
    return "";
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

/**
 * Heading with a stable, content-derived id and a hover anchor link, so
 * article sections are individually linkable and a table of contents can point
 * at them. `#` is invisible until the heading is hovered.
 */
function heading(Tag: "h2" | "h3") {
    function Heading({ children, ...props }: ComponentPropsWithoutRef<"h2">) {
        const id = slugify(textOf(children));
        return (
            <Tag id={id} className="group scroll-mt-24" {...props}>
                {id ? (
                    <a
                        href={`#${id}`}
                        className="no-underline"
                        aria-label={`Link to this section: ${textOf(children)}`}
                    >
                        {children}
                        <span
                            aria-hidden="true"
                            className="ml-2 opacity-0 group-hover:opacity-60 text-indigo-400 transition-opacity"
                        >
                            #
                        </span>
                    </a>
                ) : (
                    children
                )}
            </Tag>
        );
    }
    Heading.displayName = `Mdx${Tag.toUpperCase()}`;
    return Heading;
}

/**
 * Content images: lazy-loaded, async-decoded, and constrained to the prose
 * column with a rounded frame. `alt` is preserved from the MDX source.
 */
function MdxImg({ alt = "", ...props }: ComponentPropsWithoutRef<"img">) {
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            alt={alt}
            loading="lazy"
            decoding="async"
            className="rounded-xl border border-slate-800/60 mx-auto h-auto max-w-full"
            {...props}
        />
    );
}

/** Component map passed to <MDXRemote components={mdxComponents} />. */
export const mdxComponents = {
    h2: heading("h2"),
    h3: heading("h3"),
    img: MdxImg,
};
