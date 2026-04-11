import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectCard from "../ProjectCard";
import type { Project } from "@/lib/projects";

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  ArrowRight: () => <span data-testid="arrow-right-icon">→</span>,
  ExternalLink: () => <span data-testid="external-link-icon">↗</span>,
}));

describe("ProjectCard Component", () => {
  const mockProject: Project = {
    slug: "test-project",
    title: "Test Project",
    tagline: "A test project tagline that describes the project briefly",
    description: "Full project description",
    problem: "The problem statement",
    solution: "The solution approach",
    architecture: "The architecture details",
    techStack: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    outcome: "The project outcome",
    category: "SaaS",
  };

  it("should render without crashing", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  it("should render project title", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("Test Project")).toBeInTheDocument();
  });

  it("should render project tagline", () => {
    render(<ProjectCard project={mockProject} />);
    expect(
      screen.getByText("A test project tagline that describes the project briefly")
    ).toBeInTheDocument();
  });

  it("should render category badge", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("SaaS")).toBeInTheDocument();
  });

  it("should link to correct project URL", () => {
    render(<ProjectCard project={mockProject} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/projects/test-project");
  });

  it("should render first 4 tech stack items", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
    expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
  });

  it("should show '+N more' when tech stack has more than 4 items", () => {
    const projectWithManyTechs: Project = {
      ...mockProject,
      techStack: ["Tech1", "Tech2", "Tech3", "Tech4", "Tech5", "Tech6", "Tech7"],
    };

    render(<ProjectCard project={projectWithManyTechs} />);
    expect(screen.getByText("Tech1")).toBeInTheDocument();
    expect(screen.getByText("Tech2")).toBeInTheDocument();
    expect(screen.getByText("Tech3")).toBeInTheDocument();
    expect(screen.getByText("Tech4")).toBeInTheDocument();
    expect(screen.getByText("+3 more")).toBeInTheDocument();
    expect(screen.queryByText("Tech5")).not.toBeInTheDocument();
  });

  it("should not show '+N more' when tech stack has exactly 4 items", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.queryByText(/more/)).not.toBeInTheDocument();
  });

  it("should not show '+N more' when tech stack has fewer than 4 items", () => {
    const projectWithFewTechs: Project = {
      ...mockProject,
      techStack: ["React", "TypeScript"],
    };

    render(<ProjectCard project={projectWithFewTechs} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.queryByText(/more/)).not.toBeInTheDocument();
  });

  it("should render View case study CTA", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("View case study")).toBeInTheDocument();
    expect(screen.getByTestId("arrow-right-icon")).toBeInTheDocument();
  });

  it("should apply grid variant styling by default", () => {
    const { container } = render(<ProjectCard project={mockProject} />);
    const title = screen.getByText("Test Project");
    expect(title.className).toContain("text-lg");
  });

  it("should apply featured variant styling when specified", () => {
    const { container } = render(<ProjectCard project={mockProject} variant="featured" />);
    const title = screen.getByText("Test Project");
    expect(title.className).toContain("text-xl");
  });

  it("should handle single tech in stack", () => {
    const projectWithOneTech: Project = {
      ...mockProject,
      techStack: ["Python"],
    };

    render(<ProjectCard project={projectWithOneTech} />);
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.queryByText(/more/)).not.toBeInTheDocument();
  });

  it("should handle project with 5 tech stack items", () => {
    const projectWith5Techs: Project = {
      ...mockProject,
      techStack: ["React", "Vue", "Angular", "Svelte", "Solid"],
    };

    render(<ProjectCard project={projectWith5Techs} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Vue")).toBeInTheDocument();
    expect(screen.getByText("Angular")).toBeInTheDocument();
    expect(screen.getByText("Svelte")).toBeInTheDocument();
    expect(screen.getByText("+1 more")).toBeInTheDocument();
    expect(screen.queryByText("Solid")).not.toBeInTheDocument();
  });

  it("should be wrapped in a link", () => {
    render(<ProjectCard project={mockProject} />);
    const link = screen.getByRole("link");
    const article = screen.getByRole("article");

    expect(link).toContainElement(article);
  });

  it("should render different category badges", () => {
    const projectWithDifferentCategory: Project = {
      ...mockProject,
      category: "AI / ML",
    };

    render(<ProjectCard project={projectWithDifferentCategory} />);
    expect(screen.getByText("AI / ML")).toBeInTheDocument();
  });

  it("should handle featured projects", () => {
    const featuredProject: Project = {
      ...mockProject,
      featured: true,
    };

    render(<ProjectCard project={featuredProject} variant="featured" />);
    expect(screen.getByText("Test Project")).toBeInTheDocument();
    // Featured variant should use larger text
    const title = screen.getByText("Test Project");
    expect(title.className).toContain("text-xl");
  });

  it("should calculate tech overflow correctly", () => {
    const projectWith10Techs: Project = {
      ...mockProject,
      techStack: Array.from({ length: 10 }, (_, i) => `Tech${i + 1}`),
    };

    render(<ProjectCard project={projectWith10Techs} />);
    expect(screen.getByText("+6 more")).toBeInTheDocument();
  });

  it("should handle empty tech stack gracefully", () => {
    const projectWithNoTech: Project = {
      ...mockProject,
      techStack: [],
    };

    // This should ideally not happen, but testing edge case
    render(<ProjectCard project={projectWithNoTech} />);
    expect(screen.queryByText(/more/)).not.toBeInTheDocument();
  });

  it("should display tagline in muted color", () => {
    const { container } = render(<ProjectCard project={mockProject} />);
    const tagline = screen.getByText(
      "A test project tagline that describes the project briefly"
    );
    expect(tagline.className).toContain("text-slate-400");
  });

  it("should have hover effect classes", () => {
    const { container } = render(<ProjectCard project={mockProject} />);
    const article = container.querySelector("article");
    expect(article?.className).toContain("hover:border-indigo-500/40");
    expect(article?.className).toContain("hover:bg-slate-900/70");
  });
});
