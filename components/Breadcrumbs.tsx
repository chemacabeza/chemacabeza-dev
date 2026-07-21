import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
    name: string;
    /** Path relative to origin. Omit/empty on the current (last) page. */
    path?: string;
}

/**
 * Visible breadcrumb trail. Must be kept in sync with the BreadcrumbList
 * JSON-LD emitted on the same page (see lib/jsonld.ts breadcrumbSchema).
 */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
    return (
        <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
                {items.map((item, i) => {
                    const isLast = i === items.length - 1;
                    return (
                        <li key={item.name} className="flex items-center gap-1.5">
                            {item.path && !isLast ? (
                                <Link
                                    href={item.path}
                                    className="hover:text-slate-300 transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ) : (
                                <span
                                    className="text-slate-400"
                                    aria-current={isLast ? "page" : undefined}
                                >
                                    {item.name}
                                </span>
                            )}
                            {!isLast && (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-700" aria-hidden="true" />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
