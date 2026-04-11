import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ArticleCard from "../ArticleCard";
import type { Post } from "@/lib/mdx";

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  ArrowRight: () => <span data-testid="arrow-right-icon">→</span>,
  Calendar: () => <span data-testid="calendar-icon">📅</span>,
  Clock: () => <span data-testid="clock-icon">🕐</span>,
}));

describe("ArticleCard Component", () => {
  const mockPost: Post = {
    slug: "test-post",
    frontmatter: {
      title: "Test Blog Post",
      description: "A test blog post description",
      date: "2024-03-15",
      tags: ["React", "TypeScript", "Testing"],
    },
    content: "This is the full content of the post.",
    readingTime: "5 min read",
    excerpt: "This is a test excerpt that should be displayed on the card.",
  };

  it("should render without crashing", () => {
    render(<ArticleCard post={mockPost} />);
    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  it("should render post title", () => {
    render(<ArticleCard post={mockPost} />);
    expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
  });

  it("should render post excerpt", () => {
    render(<ArticleCard post={mockPost} />);
    expect(
      screen.getByText("This is a test excerpt that should be displayed on the card.")
    ).toBeInTheDocument();
  });

  it("should render reading time", () => {
    render(<ArticleCard post={mockPost} />);
    expect(screen.getByText("5 min read")).toBeInTheDocument();
  });

  it("should format date correctly", () => {
    render(<ArticleCard post={mockPost} />);
    // Date should be formatted as "15 Mar 2024" in en-GB locale
    expect(screen.getByText(/15 Mar 2024/)).toBeInTheDocument();
  });

  it("should render up to 3 tags", () => {
    render(<ArticleCard post={mockPost} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Testing")).toBeInTheDocument();
  });

  it("should limit tags to 3 even if more are provided", () => {
    const postWithManyTags: Post = {
      ...mockPost,
      frontmatter: {
        ...mockPost.frontmatter,
        tags: ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
      },
    };

    render(<ArticleCard post={postWithManyTags} />);
    expect(screen.getByText("Tag1")).toBeInTheDocument();
    expect(screen.getByText("Tag2")).toBeInTheDocument();
    expect(screen.getByText("Tag3")).toBeInTheDocument();
    expect(screen.queryByText("Tag4")).not.toBeInTheDocument();
    expect(screen.queryByText("Tag5")).not.toBeInTheDocument();
  });

  it("should link to correct post URL", () => {
    render(<ArticleCard post={mockPost} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/writing/test-post");
  });

  it("should render Read CTA", () => {
    render(<ArticleCard post={mockPost} />);
    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(screen.getByTestId("arrow-right-icon")).toBeInTheDocument();
  });

  it("should render calendar and clock icons", () => {
    render(<ArticleCard post={mockPost} />);
    expect(screen.getByTestId("calendar-icon")).toBeInTheDocument();
    expect(screen.getByTestId("clock-icon")).toBeInTheDocument();
  });

  it("should handle post without tags", () => {
    const postWithoutTags: Post = {
      ...mockPost,
      frontmatter: {
        ...mockPost.frontmatter,
        tags: [],
      },
    };

    render(<ArticleCard post={postWithoutTags} />);
    expect(screen.getByRole("article")).toBeInTheDocument();
    // Tags section should not render if there are no tags
    expect(screen.queryByText("React")).not.toBeInTheDocument();
  });

  it("should handle post without excerpt", () => {
    const postWithoutExcerpt: Post = {
      ...mockPost,
      excerpt: "",
    };

    render(<ArticleCard post={postWithoutExcerpt} />);
    // Post should still render but excerpt section should be empty/hidden
    expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
  });

  it("should apply featured styling when featured prop is true", () => {
    const { container } = render(<ArticleCard post={mockPost} featured={true} />);
    const article = container.querySelector("article");
    expect(article?.className).toContain("hover:shadow-lg");
    expect(article?.className).toContain("hover:shadow-indigo-500/10");
  });

  it("should not apply featured styling when featured prop is false", () => {
    const { container } = render(<ArticleCard post={mockPost} featured={false} />);
    const article = container.querySelector("article");
    // The featured classes should not be in the className when featured is false
    const hasFeatureStyling = article?.className.includes("hover:shadow-lg");
    expect(hasFeatureStyling).toBe(false);
  });

  it("should handle different date formats", () => {
    const postWithDifferentDate: Post = {
      ...mockPost,
      frontmatter: {
        ...mockPost.frontmatter,
        date: "2024-12-01",
      },
    };

    render(<ArticleCard post={postWithDifferentDate} />);
    expect(screen.getByText(/1 Dec 2024/)).toBeInTheDocument();
  });

  it("should render only first 3 tags when exactly 3 tags provided", () => {
    const postWith3Tags: Post = {
      ...mockPost,
      frontmatter: {
        ...mockPost.frontmatter,
        tags: ["JavaScript", "Node.js", "Express"],
      },
    };

    render(<ArticleCard post={postWith3Tags} />);
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
    expect(screen.getByText("Express")).toBeInTheDocument();
  });

  it("should render single tag when only one tag provided", () => {
    const postWith1Tag: Post = {
      ...mockPost,
      frontmatter: {
        ...mockPost.frontmatter,
        tags: ["Vue"],
      },
    };

    render(<ArticleCard post={postWith1Tag} />);
    expect(screen.getByText("Vue")).toBeInTheDocument();
  });

  it("should be wrapped in a link", () => {
    render(<ArticleCard post={mockPost} />);
    const link = screen.getByRole("link");
    const article = screen.getByRole("article");

    expect(link).toContainElement(article);
  });
});
