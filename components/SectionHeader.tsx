interface SectionHeaderProps {
    label?: string;
    title: string;
    description?: string;
    align?: "left" | "center";
    className?: string;
    /**
     * Heading level for the title. Defaults to "h2" (section heading). Set to
     * "h1" on index/landing pages that need a single top-level page heading.
     * Visual styling is identical regardless of level.
     */
    as?: "h1" | "h2";
}

export default function SectionHeader({
    label,
    title,
    description,
    align = "left",
    className = "",
    as: Heading = "h2",
}: SectionHeaderProps) {
    return (
        <div
            className={`mb-12 ${align === "center" ? "text-center" : ""} ${className}`}
        >
            {label && (
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">
                    {label}
                </span>
            )}
            <Heading className="text-3xl sm:text-4xl font-bold text-slate-100 leading-tight mb-3">
                {title}
            </Heading>
            {description && (
                <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                    {description}
                </p>
            )}
        </div>
    );
}
