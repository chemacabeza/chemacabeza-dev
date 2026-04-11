import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAllPosts, getPostBySlug, getFeaturedPosts } from "../mdx";
import fs from "fs";
import path from "path";

// Mock fs module
vi.mock("fs");
vi.mock("path");

describe("MDX Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllPosts", () => {
    it("should return an empty array if posts directory does not exist", () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = getAllPosts();

      expect(result).toEqual([]);
    });

    it("should return posts sorted by date (newest first)", () => {
      const mockPostsDir = "/fake/content/posts";
      vi.mocked(path.join).mockReturnValue(mockPostsDir);
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        "post1.mdx",
        "post2.mdx",
      ] as any);

      const post1Content = `---
title: Post 1
description: First post
date: 2024-01-01
tags: [test]
---
This is the first post content with some text.`;

      const post2Content = `---
title: Post 2
description: Second post
date: 2024-02-01
tags: [test]
---
This is the second post content with more text.`;

      vi.mocked(fs.readFileSync)
        .mockReturnValueOnce(post1Content)
        .mockReturnValueOnce(post2Content);

      const result = getAllPosts();

      expect(result).toHaveLength(2);
      expect(result[0].frontmatter.title).toBe("Post 2"); // Newest first
      expect(result[1].frontmatter.title).toBe("Post 1");
    });

    it("should filter out non-MDX/MD files", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        "post1.mdx",
        "readme.txt",
        "post2.md",
        "image.png",
      ] as any);

      const postContent = `---
title: Test Post
description: Test
date: 2024-01-01
tags: [test]
---
Content here.`;

      vi.mocked(fs.readFileSync).mockReturnValue(postContent);

      const result = getAllPosts();

      expect(result).toHaveLength(2); // Only .mdx and .md files
    });

    it("should generate excerpt of approximately 180 characters", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue(["post.mdx"] as any);

      const longContent = `---
title: Test Post
description: Test
date: 2024-01-01
tags: [test]
---
${"Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(10)}`;

      vi.mocked(fs.readFileSync).mockReturnValue(longContent);

      const result = getAllPosts();

      expect(result[0].excerpt).toBeDefined();
      expect(result[0].excerpt.length).toBeLessThanOrEqual(184); // 180 + "…" + some buffer
      expect(result[0].excerpt).toMatch(/…$/); // Ends with ellipsis
    });

    it("should include reading time", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue(["post.mdx"] as any);

      const postContent = `---
title: Test Post
description: Test
date: 2024-01-01
tags: [test]
---
This is some test content for reading time calculation.`;

      vi.mocked(fs.readFileSync).mockReturnValue(postContent);

      const result = getAllPosts();

      expect(result[0].readingTime).toBeDefined();
      expect(typeof result[0].readingTime).toBe("string");
    });
  });

  describe("getPostBySlug", () => {
    it("should return null for non-existent post", () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = getPostBySlug("non-existent");

      expect(result).toBeNull();
    });

    it("should return post data for valid slug", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const postContent = `---
title: Test Post
description: A test post
date: 2024-01-01
tags: [test, demo]
---
This is the post content.`;

      vi.mocked(fs.readFileSync).mockReturnValue(postContent);

      const result = getPostBySlug("test-post");

      expect(result).not.toBeNull();
      expect(result?.frontmatter.title).toBe("Test Post");
      expect(result?.frontmatter.description).toBe("A test post");
      expect(result?.frontmatter.tags).toEqual(["test", "demo"]);
      expect(result?.slug).toBe("test-post");
    });

    it("should try .mdx first, then .md", () => {
      vi.mocked(fs.existsSync)
        .mockReturnValueOnce(false) // .mdx doesn't exist
        .mockReturnValueOnce(true); // .md exists

      const postContent = `---
title: Markdown Post
description: Test
date: 2024-01-01
tags: [md]
---
Content.`;

      vi.mocked(fs.readFileSync).mockReturnValue(postContent);

      const result = getPostBySlug("markdown-post");

      expect(result).not.toBeNull();
      expect(result?.frontmatter.title).toBe("Markdown Post");
    });

    it("should generate excerpt for single post", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const postContent = `---
title: Test Post
description: Test
date: 2024-01-01
tags: [test]
---
${"Some content with enough text to generate an excerpt. ".repeat(5)}`;

      vi.mocked(fs.readFileSync).mockReturnValue(postContent);

      const result = getPostBySlug("test-post");

      expect(result?.excerpt).toBeDefined();
      expect(result?.excerpt.length).toBeLessThanOrEqual(184);
      expect(result?.excerpt).toMatch(/…$/);
    });
  });

  describe("getFeaturedPosts", () => {
    it("should return featured posts when available", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        "post1.mdx",
        "post2.mdx",
        "post3.mdx",
      ] as any);

      const featuredPost = `---
title: Featured
description: Featured post
date: 2024-01-01
tags: [test]
featured: true
---
Content.`;

      const normalPost = `---
title: Normal
description: Normal post
date: 2024-01-02
tags: [test]
---
Content.`;

      vi.mocked(fs.readFileSync)
        .mockReturnValueOnce(featuredPost)
        .mockReturnValueOnce(normalPost)
        .mockReturnValueOnce(normalPost);

      const result = getFeaturedPosts(3);

      expect(result).toHaveLength(1); // Only one featured
      expect(result[0].frontmatter.title).toBe("Featured");
    });

    it("should return most recent posts if not enough featured posts", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        "post1.mdx",
        "post2.mdx",
      ] as any);

      const post1 = `---
title: Post 1
description: Test
date: 2024-02-01
tags: [test]
---
Content.`;

      const post2 = `---
title: Post 2
description: Test
date: 2024-01-01
tags: [test]
---
Content.`;

      vi.mocked(fs.readFileSync)
        .mockReturnValueOnce(post1)
        .mockReturnValueOnce(post2);

      const result = getFeaturedPosts(3);

      expect(result).toHaveLength(2); // Returns all available
      expect(result[0].frontmatter.title).toBe("Post 1"); // Most recent
    });

    it("should limit results to requested count", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        "post1.mdx",
        "post2.mdx",
        "post3.mdx",
        "post4.mdx",
      ] as any);

      const postTemplate = (num: number) => `---
title: Post ${num}
description: Test
date: 2024-0${num}-01
tags: [test]
featured: true
---
Content.`;

      vi.mocked(fs.readFileSync)
        .mockReturnValueOnce(postTemplate(1))
        .mockReturnValueOnce(postTemplate(2))
        .mockReturnValueOnce(postTemplate(3))
        .mockReturnValueOnce(postTemplate(4));

      const result = getFeaturedPosts(2);

      expect(result).toHaveLength(2); // Limited to 2
    });
  });
});
