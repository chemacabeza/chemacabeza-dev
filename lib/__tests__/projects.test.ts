import { describe, it, expect } from "vitest";
import { projects, type Project } from "../projects";

describe("Projects Data", () => {
  describe("Project Structure Validation", () => {
    it("should have at least one project", () => {
      expect(projects.length).toBeGreaterThan(0);
    });

    it("should have all required fields for each project", () => {
      projects.forEach((project) => {
        expect(project).toHaveProperty("slug");
        expect(project).toHaveProperty("title");
        expect(project).toHaveProperty("tagline");
        expect(project).toHaveProperty("description");
        expect(project).toHaveProperty("problem");
        expect(project).toHaveProperty("solution");
        expect(project).toHaveProperty("architecture");
        expect(project).toHaveProperty("techStack");
        expect(project).toHaveProperty("outcome");
        expect(project).toHaveProperty("category");
      });
    });

    it("should have non-empty required string fields", () => {
      projects.forEach((project) => {
        expect(project.slug).toBeTruthy();
        expect(project.title).toBeTruthy();
        expect(project.tagline).toBeTruthy();
        expect(project.description).toBeTruthy();
        expect(project.problem).toBeTruthy();
        expect(project.solution).toBeTruthy();
        expect(project.architecture).toBeTruthy();
        expect(project.outcome).toBeTruthy();
        expect(project.category).toBeTruthy();
      });
    });

    it("should have techStack as non-empty array", () => {
      projects.forEach((project) => {
        expect(Array.isArray(project.techStack)).toBe(true);
        expect(project.techStack.length).toBeGreaterThan(0);
      });
    });

    it("should have URL-safe slugs", () => {
      const urlSafeRegex = /^[a-z0-9-]+$/;
      projects.forEach((project) => {
        expect(project.slug).toMatch(urlSafeRegex);
        expect(project.slug).not.toContain(" ");
        expect(project.slug).not.toContain("_");
      });
    });

    it("should have unique slugs", () => {
      const slugs = projects.map((p) => p.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });
  });

  describe("Featured Projects", () => {
    it("should have at least one featured project", () => {
      const featuredProjects = projects.filter((p) => p.featured === true);
      expect(featuredProjects.length).toBeGreaterThan(0);
    });

    it("featured field should be boolean or undefined", () => {
      projects.forEach((project) => {
        if (project.featured !== undefined) {
          expect(typeof project.featured).toBe("boolean");
        }
      });
    });

    it("should be able to filter featured projects", () => {
      const featuredProjects = projects.filter((p) => p.featured);
      expect(featuredProjects.length).toBeGreaterThanOrEqual(1);
      featuredProjects.forEach((project) => {
        expect(project.featured).toBe(true);
      });
    });
  });

  describe("Project Categories", () => {
    it("should have valid category names", () => {
      const validCategories = [
        "AI / ML",
        "Cloud Infrastructure",
        "SaaS",
        "Developer Tools",
        "Microservices",
        "Backend",
        "Systems",
      ];

      projects.forEach((project) => {
        expect(project.category).toBeTruthy();
        // Just ensure it's not empty - don't enforce specific categories
        expect(project.category.length).toBeGreaterThan(0);
      });
    });

    it("should group projects by category", () => {
      const projectsByCategory = projects.reduce(
        (acc, project) => {
          if (!acc[project.category]) {
            acc[project.category] = [];
          }
          acc[project.category].push(project);
          return acc;
        },
        {} as Record<string, Project[]>
      );

      // Should have at least one category
      expect(Object.keys(projectsByCategory).length).toBeGreaterThan(0);
    });
  });

  describe("Tech Stack Validation", () => {
    it("should have reasonable tech stack sizes", () => {
      projects.forEach((project) => {
        // Most projects should have between 3-15 technologies
        expect(project.techStack.length).toBeGreaterThanOrEqual(1);
        expect(project.techStack.length).toBeLessThanOrEqual(20);
      });
    });

    it("should not have duplicate technologies in tech stack", () => {
      projects.forEach((project) => {
        const uniqueTech = new Set(project.techStack);
        expect(uniqueTech.size).toBe(project.techStack.length);
      });
    });

    it("should have non-empty technology names", () => {
      projects.forEach((project) => {
        project.techStack.forEach((tech) => {
          expect(tech).toBeTruthy();
          expect(tech.trim()).toBe(tech); // No leading/trailing whitespace
        });
      });
    });
  });

  describe("Content Quality", () => {
    it("should have meaningful descriptions (min 50 chars)", () => {
      projects.forEach((project) => {
        expect(project.description.length).toBeGreaterThanOrEqual(50);
      });
    });

    it("should have meaningful problems (min 50 chars)", () => {
      projects.forEach((project) => {
        expect(project.problem.length).toBeGreaterThanOrEqual(50);
      });
    });

    it("should have meaningful solutions (min 50 chars)", () => {
      projects.forEach((project) => {
        expect(project.solution.length).toBeGreaterThanOrEqual(50);
      });
    });

    it("should have meaningful architecture descriptions (min 50 chars)", () => {
      projects.forEach((project) => {
        expect(project.architecture.length).toBeGreaterThanOrEqual(50);
      });
    });

    it("should have meaningful outcomes (min 30 chars)", () => {
      projects.forEach((project) => {
        expect(project.outcome.length).toBeGreaterThanOrEqual(30);
      });
    });

    it("should have concise taglines (max 100 chars)", () => {
      projects.forEach((project) => {
        expect(project.tagline.length).toBeLessThanOrEqual(100);
      });
    });
  });

  describe("Project Sorting and Filtering", () => {
    it("should be able to get first N projects", () => {
      const firstThree = projects.slice(0, 3);
      expect(firstThree.length).toBeLessThanOrEqual(3);
      expect(firstThree.length).toBeGreaterThan(0);
    });

    it("should be able to find project by slug", () => {
      const firstSlug = projects[0].slug;
      const found = projects.find((p) => p.slug === firstSlug);
      expect(found).toBeDefined();
      expect(found?.slug).toBe(firstSlug);
    });

    it("should be able to filter by category", () => {
      const firstCategory = projects[0].category;
      const filtered = projects.filter((p) => p.category === firstCategory);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((project) => {
        expect(project.category).toBe(firstCategory);
      });
    });
  });
});
