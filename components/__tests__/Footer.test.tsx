import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "../Footer";
import { siteConfig } from "@/lib/metadata";

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Github: () => <span data-testid="github-icon">GitHub</span>,
  Linkedin: () => <span data-testid="linkedin-icon">LinkedIn</span>,
  Mail: () => <span data-testid="mail-icon">Mail</span>,
  Code2: () => <span data-testid="code2-icon">Code2</span>,
}));

describe("Footer Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render without crashing", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
  });

  it("should display the current year in copyright", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
  });

  it("should display site owner name in copyright", () => {
    render(<Footer />);
    expect(screen.getByText(new RegExp(siteConfig.name))).toBeInTheDocument();
  });

  it("should render GitHub social link", () => {
    render(<Footer />);
    const githubLink = screen.getByLabelText("GitHub");
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute("href", siteConfig.author.github);
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should render LinkedIn social link", () => {
    render(<Footer />);
    const linkedinLink = screen.getByLabelText("LinkedIn");
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink).toHaveAttribute("href", siteConfig.author.linkedin);
    expect(linkedinLink).toHaveAttribute("target", "_blank");
  });

  it("should render Email social link", () => {
    render(<Footer />);
    const emailLink = screen.getByLabelText("Email");
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute("href", `mailto:${siteConfig.author.email}`);
    // mailto links should not have target="_blank"
    expect(emailLink).not.toHaveAttribute("target");
  });

  it("should render all navigation links", () => {
    render(<Footer />);

    const navLinks = [
      { text: "About", href: "/about" },
      { text: "Projects", href: "/projects" },
      { text: "Writing", href: "/writing" },
      { text: "Hobbies", href: "/hobbies" },
      { text: "Now", href: "/now" },
      { text: "Contact", href: "/contact" },
    ];

    navLinks.forEach(({ text, href }) => {
      const link = screen.getByRole("link", { name: text });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", href);
    });
  });

  it("should render brand logo link to homepage", () => {
    render(<Footer />);
    // The brand contains the text "chemacabeza.dev" split across spans
    const logoLinks = screen.getAllByRole("link", { name: /chema/ });
    const homeLink = logoLinks.find((link) => link.getAttribute("href") === "/");
    expect(homeLink).toBeInTheDocument();
  });

  it("should render tagline", () => {
    render(<Footer />);
    expect(
      screen.getByText(/Building high-performance systems and engineering teams that ship/)
    ).toBeInTheDocument();
  });

  it("should render all social icons", () => {
    render(<Footer />);
    expect(screen.getByTestId("github-icon")).toBeInTheDocument();
    expect(screen.getByTestId("linkedin-icon")).toBeInTheDocument();
    expect(screen.getByTestId("mail-icon")).toBeInTheDocument();
  });

  it("should render tech stack info in copyright", () => {
    render(<Footer />);
    expect(screen.getByText(/Built with Next.js & Tailwind CSS/)).toBeInTheDocument();
    expect(screen.getByText(/Deployed on Vercel/)).toBeInTheDocument();
  });

  it("should have correct accessibility attributes on social links", () => {
    render(<Footer />);

    const githubLink = screen.getByLabelText("GitHub");
    const linkedinLink = screen.getByLabelText("LinkedIn");
    const emailLink = screen.getByLabelText("Email");

    // All social links should have aria-label
    expect(githubLink).toHaveAttribute("aria-label", "GitHub");
    expect(linkedinLink).toHaveAttribute("aria-label", "LinkedIn");
    expect(emailLink).toHaveAttribute("aria-label", "Email");

    // External links should have rel="noopener noreferrer"
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(linkedinLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should render 3 social links in total", () => {
    render(<Footer />);
    const socialLinks = [
      screen.getByLabelText("GitHub"),
      screen.getByLabelText("LinkedIn"),
      screen.getByLabelText("Email"),
    ];
    expect(socialLinks).toHaveLength(3);
  });

  it("should render 6 navigation links in total", () => {
    render(<Footer />);
    const navLabels = ["About", "Projects", "Writing", "Hobbies", "Now", "Contact"];
    const navLinks = navLabels.map((label) => screen.getByRole("link", { name: label }));
    expect(navLinks).toHaveLength(6);
  });
});
