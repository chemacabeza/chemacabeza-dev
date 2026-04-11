import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface PostFrontmatter {
    title: string;
    description: string;
    date: string;
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
