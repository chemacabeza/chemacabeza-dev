interface SectionHeaderProps {
    label?: string;
    title: string;
    description?: string;
    align?: "left" | "center";
    className?: string;
}

export default function SectionHeader({
    label,
    title,
    description,
    align = "left",
    className = "",
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
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 leading-tight mb-3">
                {title}
            </h2>
            {description && (
                <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                    {description}
                </p>
            )}
        </div>
    );
}
