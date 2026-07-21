import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface PostFrontmatter {
    title: string;
    description: string;
    date: string;
    /** Optional ISO date of the last meaningful content update (dateModified). */
    updated?: string;
    tags: string[];
    featured?: boolean;
}

export interface Post {
    slug: string;
    frontmatter: PostFrontmatter;
    content: string;
    readingTime: string;
    excerpt: string;
}

export function getAllPosts(): Post[] {
    if (!fs.existsSync(postsDirectory)) return [];

    const fileNames = fs
        .readdirSync(postsDirectory)
        .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

    const posts = fileNames.map((fileName) => {
        const slug = fileName.replace(/\.(mdx|md)$/, "");
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const { data, content } = matter(fileContents);
        const stats = readingTime(content);

        const excerpt = content
            .replace(/#{1,6}\s/g, "")
            .replace(/\*\*/g, "")
            .replace(/\*/g, "")
            .replace(/`/g, "")
            .replace(/\n/g, " ")
            .trim()
            .slice(0, 180);

        return {
            slug,
            frontmatter: data as PostFrontmatter,
            content,
            readingTime: stats.text,
            excerpt: excerpt + "…",
        };
    });

    return posts.sort(
        (a, b) =>
            new Date(b.frontmatter.date).getTime() -
            new Date(a.frontmatter.date).getTime()
    );
}

export function getPostBySlug(slug: string): Post | null {
    const mdxPath = path.join(postsDirectory, `${slug}.mdx`);
    const mdPath = path.join(postsDirectory, `${slug}.md`);
    const fullPath = fs.existsSync(mdxPath) ? mdxPath : mdPath;

    if (!fs.existsSync(fullPath)) return null;

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    const stats = readingTime(content);

    const excerpt = content
        .replace(/#{1,6}\s/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/`/g, "")
        .replace(/\n/g, " ")
        .trim()
        .slice(0, 180);

    return {
        slug,
        frontmatter: data as PostFrontmatter,
        content,
        readingTime: stats.text,
        excerpt: excerpt + "…",
    };
}

export function getFeaturedPosts(count = 3): Post[] {
    const all = getAllPosts();
    const featured = all.filter((p) => p.frontmatter.featured);
    return (featured.length >= count ? featured : all).slice(0, count);
}

/**
 * Posts sharing the most tags with the given slug, newest-first as a
 * tie-breaker. Used for the "Related reading" section on article pages.
 */
export function getRelatedPosts(slug: string, count = 3): Post[] {
    const all = getAllPosts();
    const current = all.find((p) => p.slug === slug);
    if (!current) return [];
    const currentTags = new Set(current.frontmatter.tags ?? []);

    return all
        .filter((p) => p.slug !== slug)
        .map((p) => ({
            post: p,
            shared: (p.frontmatter.tags ?? []).filter((t) => currentTags.has(t))
                .length,
        }))
        .filter((x) => x.shared > 0)
        .sort(
            (a, b) =>
                b.shared - a.shared ||
                new Date(b.post.frontmatter.date).getTime() -
                    new Date(a.post.frontmatter.date).getTime()
        )
        .slice(0, count)
        .map((x) => x.post);
}

/**
 * The previous (older) and next (newer) post relative to `slug` in the
 * chronologically-sorted list, for prev/next article navigation.
 */
export function getAdjacentPosts(slug: string): {
    previous: Post | null;
    next: Post | null;
} {
    const all = getAllPosts(); // newest-first
    const idx = all.findIndex((p) => p.slug === slug);
    if (idx === -1) return { previous: null, next: null };
    return {
        next: idx > 0 ? all[idx - 1] : null, // newer
        previous: idx < all.length - 1 ? all[idx + 1] : null, // older
    };
}
