import { describe, it, expect } from "vitest";
import { siteConfig, createMetadata } from "../metadata";

describe("Metadata Utilities", () => {
  describe("siteConfig", () => {
    it("should have all required configuration fields", () => {
      expect(siteConfig.name).toBeDefined();
      expect(siteConfig.title).toBeDefined();
      expect(siteConfig.description).toBeDefined();
      expect(siteConfig.url).toBeDefined();
      expect(siteConfig.ogImage).toBeDefined();
      expect(siteConfig.author).toBeDefined();
    });

    it("should have valid author information", () => {
      expect(siteConfig.author.name).toBe("José María Cabeza Rodríguez");
      expect(siteConfig.author.email).toContain("@");
      expect(siteConfig.author.github).toContain("github.com");
      expect(siteConfig.author.linkedin).toContain("linkedin.com");
      expect(siteConfig.author.twitter).toContain("twitter.com");
    });

    it("should have valid URL format", () => {
      expect(siteConfig.url).toMatch(/^https:\/\//);
      expect(() => new URL(siteConfig.url)).not.toThrow();
    });

    it("should have valid OG image URL", () => {
      expect(siteConfig.ogImage).toMatch(/^https:\/\//);
      expect(siteConfig.ogImage).toContain(".png");
    });
  });

  describe("createMetadata", () => {
    it("should generate metadata with default values when no args provided", () => {
      const metadata = createMetadata({});

      expect(metadata.title).toBe(siteConfig.title);
      expect(metadata.description).toBe(siteConfig.description);
      expect(metadata.metadataBase?.toString()).toBe(siteConfig.url + "/");
    });

    it("should generate correct title with template when title provided", () => {
      const metadata = createMetadata({ title: "About" });

      expect(metadata.title).toBe(`About — ${siteConfig.name}`);
    });

    it("should use custom description when provided", () => {
      const customDesc = "Custom page description";
      const metadata = createMetadata({ description: customDesc });

      expect(metadata.description).toBe(customDesc);
    });

    it("should construct correct URL with path", () => {
      const metadata = createMetadata({ path: "/about" });

      expect(metadata.openGraph?.url).toBe(`${siteConfig.url}/about`);
      expect(metadata.alternates?.canonical).toBe(`${siteConfig.url}/about`);
    });

    it("should use custom OG image when provided", () => {
      const customImage = "https://example.com/custom.png";
      const metadata = createMetadata({ ogImage: customImage });

      expect(metadata.openGraph?.images?.[0]).toMatchObject({
        url: customImage,
        width: 1200,
        height: 630,
      });
    });

    it("should include OpenGraph metadata", () => {
      const metadata = createMetadata({ title: "Test Page" });

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBe(`Test Page — ${siteConfig.name}`);
      expect(metadata.openGraph?.siteName).toBe(siteConfig.name);
      expect(metadata.openGraph?.type).toBe("website");
      expect(metadata.openGraph?.locale).toBe("en_US");
    });

    it("should include Twitter Card metadata", () => {
      const metadata = createMetadata({ title: "Test Page" });

      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBe("summary_large_image");
      expect(metadata.twitter?.title).toBe(`Test Page — ${siteConfig.name}`);
      expect(metadata.twitter?.creator).toBe("@chemacabeza");
    });

    it("should set robots to index and follow", () => {
      const metadata = createMetadata({});

      expect(metadata.robots).toBeDefined();
      expect(metadata.robots?.index).toBe(true);
      expect(metadata.robots?.follow).toBe(true);
      expect(metadata.robots?.googleBot?.index).toBe(true);
      expect(metadata.robots?.googleBot?.follow).toBe(true);
    });

    it("should set correct image dimensions", () => {
      const metadata = createMetadata({});

      const ogImage = metadata.openGraph?.images?.[0];
      expect(ogImage).toMatchObject({
        width: 1200,
        height: 630,
      });
    });

    it("should set canonical URL correctly", () => {
      const metadata = createMetadata({ path: "/writing/my-post" });

      expect(metadata.alternates?.canonical).toBe(
        `${siteConfig.url}/writing/my-post`
      );
    });

    it("should handle empty path correctly", () => {
      const metadata = createMetadata({ path: "" });

      expect(metadata.openGraph?.url).toBe(siteConfig.url);
      expect(metadata.alternates?.canonical).toBe(siteConfig.url);
    });

    it("should use default title when title is not provided", () => {
      const metadata = createMetadata({ description: "Test" });

      expect(metadata.title).toBe(siteConfig.title);
    });

    it("should use description as OpenGraph and Twitter description", () => {
      const desc = "Consistent description";
      const metadata = createMetadata({ description: desc });

      expect(metadata.description).toBe(desc);
      expect(metadata.openGraph?.description).toBe(desc);
      expect(metadata.twitter?.description).toBe(desc);
    });

    it("should include metadataBase for proper URL resolution", () => {
      const metadata = createMetadata({});

      expect(metadata.metadataBase).toBeInstanceOf(URL);
      expect(metadata.metadataBase?.toString()).toBe(siteConfig.url + "/");
    });

    it("should set image alt text to page title", () => {
      const metadata = createMetadata({ title: "Test Page" });

      const ogImage = metadata.openGraph?.images?.[0];
      expect(ogImage?.alt).toBe(`Test Page — ${siteConfig.name}`);
    });
  });
});
