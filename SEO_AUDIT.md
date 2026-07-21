# SEO & Discoverability Audit — chemacabeza.dev

_Technical SEO, structured-data, social-sharing and crawlability pass over the
Next.js 16 (App Router) site. All changes are implemented in the codebase; this
document records what was found, what changed, and what still needs the owner._

---

## 1. Executive summary

The site already had a reasonable metadata foundation (a `createMetadata`
helper, a sitemap, a robots route, an RSS feed and a default OG image). The work
here closed the gaps that actually move organic visibility:

- **Fixed a title-duplication bug** that produced titles like
  `About — José María Cabeza Rodríguez — José María Cabeza Rodríguez` on every
  child page (home was fine, all others were doubled).
- **Added the missing `<h1>`** on the Writing and Projects index pages (they
  previously had zero), and removed a **duplicate `<h1>`** inside two articles.
- **Built a typed JSON-LD system** (`WebSite`, `Person`, `ProfilePage`, `Blog`,
  `BlogPosting`, `CollectionPage`, `CreativeWork`, `BreadcrumbList`) rendered
  server-side and linked through stable `@id`s into one knowledge graph.
- **Improved crawl/index files**: robots now blocks the duplicate-content
  `/export/` route; the sitemap uses real content dates instead of a per-request
  clock and drops invented priority/changefreq values.
- **Added internal linking** — breadcrumbs, related articles, prev/next
  navigation, an author bio, and contextual cross-links.
- **Added site-identity assets**: web manifest, generated Apple touch icon,
  theme color, a stable `/rss.xml`, and an experimental `/llms.txt`.
- **Added env-based Google/Bing verification** support (no secrets committed).
- **Added an automated SEO test suite** (23 checks) alongside the existing tests.

Everything is validated: `lint` clean, **39/39 tests pass**, production build
succeeds, and a crawl of all 37 routes shows exactly one `<h1>` each and zero
broken internal links.

---

## 2. Initial issues discovered

| # | Severity | Issue |
|---|----------|-------|
| 1 | High | Duplicated `<title>` on every child route (`… — Name — Name`) — the layout `title.template` re-wrapped an already-full title from `createMetadata`. |
| 2 | High | Writing index and Projects index had **no `<h1>`** (only `SectionHeader` `<h2>`s). |
| 3 | High | Two articles (`monolith-vs-microservices`, `performance-is-a-product-feature`) repeated their title as a Markdown `# ` H1 inside the body → two `<h1>`s. |
| 4 | High | No `Person` / `WebSite` / `ProfilePage` / `Blog` / breadcrumb structured data. Only a basic `BlogPosting` existed, with no `dateModified`, `articleSection`, `inLanguage`, or graph linkage. Project pages had no structured data. |
| 5 | Medium | Sitemap used `new Date()` for every static/project entry → `lastmod` changed on every build; invented `priority`/`changeFrequency` values. |
| 6 | Medium | `robots` did not block `/export/:slug` (raw article markdown = duplicate content of `/writing/[slug]`). |
| 7 | Medium | No breadcrumbs, related-article links, prev/next navigation, or author bio. |
| 8 | Medium | No web manifest, Apple touch icon, or theme-color; no search-console verification hook. |
| 9 | Low | Article dates rendered as plain text (no `<time datetime>`); no `dateModified` support. |
| 10 | Low | MDX content images had no `loading="lazy"`, and headings had no anchor IDs. |
| 11 | Low | RSS only at `/feed.xml`; items lacked author (`dc:creator`); values not XML-escaped outside CDATA. |
| 12 | Review | Project case-study metrics and some About-page figures may be illustrative — see §15. |

---

## 3. Implemented changes (by phase)

- **Centralized metadata** — `createMetadata` now returns `title.absolute`
  (ignores the parent template → no duplication), plus canonical, OG, Twitter,
  RSS alternate, `noindex`, `modifiedTime`, `section`, and `ogImageAlt` options.
  `siteConfig` expanded with locale, language, jobTitle, location, profile URLs.
- **Per-route metadata** — unique, human-written titles/descriptions for home,
  about, writing, projects, articles (from frontmatter) and projects (from
  project data). No shared default descriptions.
- **Semantic HTML** — `SectionHeader` takes an `as="h1"` prop; index pages use
  it. Duplicate in-body `# ` H1s removed from two posts. MDX `h2`/`h3` get
  content-derived anchor IDs; `<html lang="en">` retained.
- **Structured data** — `lib/jsonld.ts` typed builders + `<JsonLd>` renderer
  with `<`-escaping; wired into every template.
- **Crawling/indexing** — `robots` blocks `/api/` + `/export/`, adds `host`;
  `sitemap` uses real content dates, no fake priorities, auto-includes new posts.
- **Social/identity** — `app/manifest.ts`, generated `app/apple-icon.tsx`,
  `viewport.themeColor`, per-article OG images (from cover image), OG/Twitter
  cards with alt text.
- **RSS & discovery** — stable `/rss.xml` (plus legacy `/feed.xml`), `dc:creator`
  per item, XML-escaped channel values, footer + writing-page subscribe links,
  and an auto-generated `/llms.txt` content map.
- **Internal linking** — breadcrumbs (visible + JSON-LD), related-by-tag
  articles, prev/next, author bio, About→projects/writing cross-links,
  project→article links.
- **Content signals** — `<time datetime>`, optional `updated` frontmatter →
  `dateModified`, reading time, author bio + About link, related content.
- **Verification/analytics** — env-based Google/Bing meta tags; Vercel Analytics
  + Speed Insights already present and retained.
- **Automated checks** — `tests/seo.test.ts` (23 checks).

---

## 4. Files changed

**New**
- `lib/jsonld.ts` — typed Schema.org builders + `serializeJsonLd`.
- `components/JsonLd.tsx` — safe JSON-LD `<script>` renderer.
- `components/Breadcrumbs.tsx` — visible breadcrumb trail.
- `components/AuthorBio.tsx` — article author bio + About link.
- `components/mdx.tsx` — MDX component map (heading anchors, lazy images).
- `app/manifest.ts` — web app manifest.
- `app/apple-icon.tsx` — generated 180×180 Apple touch icon.
- `app/llms.txt/route.ts` — experimental content map.
- `tests/seo.test.ts` — automated SEO checks.

**Modified**
- `lib/metadata.ts` — title-dedup fix, expanded config & options.
- `lib/mdx.ts` — `updated` frontmatter, `getRelatedPosts`, `getAdjacentPosts`.
- `app/layout.tsx` — verification, viewport/theme-color, RSS alternate, cleanup.
- `app/page.tsx` — Person + WebSite JSON-LD; name-first homepage title.
- `app/about/page.tsx` — ProfilePage + Person JSON-LD, metadata, cross-links.
- `app/writing/page.tsx` — `<h1>`, Blog + Breadcrumb JSON-LD, RSS link, intro.
- `app/writing/[slug]/page.tsx` — Breadcrumb + BlogPosting JSON-LD, `<time>`,
  related, prev/next, author bio, MDX components.
- `app/projects/page.tsx` — `<h1>`, CollectionPage + Breadcrumb JSON-LD.
- `app/projects/[slug]/page.tsx` — CreativeWork + Breadcrumb JSON-LD,
  breadcrumbs, related writing, `Technologies` heading.
- `app/sitemap.ts` — real dates, no fake priorities.
- `app/robots.ts` — block `/export/`, add `host`.
- `app/api/rss/route.ts` — `dc:creator`, XML escaping, stable self link.
- `app/opengraph-image.tsx` — removed `edge` runtime (now prerendered static).
- `components/Footer.tsx` — RSS link.
- `components/SectionHeader.tsx` — `as` heading-level prop.
- `content/posts/monolith-vs-microservices.mdx`,
  `content/posts/performance-is-a-product-feature.mdx` — removed duplicate H1.
- `next.config.ts` — `/rss.xml` rewrite.
- `.env.example` — Google/Bing verification vars.

**Removed**
- `components/ArticleJsonLd.tsx` — superseded by `lib/jsonld.ts`.

---

## 5. Metadata strategy

- One helper (`createMetadata`) is the only place metadata is built; pages pass
  a short, human-readable `title` (no site suffix) and a unique `description`.
- Titles use `title.absolute` (`"<Page> — José María Cabeza Rodríguez"`), so the
  parent template can never re-append the name. The homepage uses the name-first
  brand title. All titles land at ~55–66 characters.
- Every indexable route gets a self-referencing canonical, OG (`website` /
  `article` / `profile`), Twitter `summary_large_image` with alt text, an RSS
  alternate, and explicit index/follow directives. The 404 page is `noindex`.
- No large global keyword list (search engines rely on visible content); topic
  terms appear naturally in titles, descriptions and body copy.

---

## 6. Structured-data strategy

- Stable entities via `@id` fragments: `…/#person` and `…/#website`. Everything
  references them so Google merges pages into one graph.
- Home → `WebSite` + `Person` (jobTitle, city/country, `knowsAbout`, `sameAs`).
- About → `ProfilePage` whose `mainEntity` is the same `Person`.
- Writing index → `Blog` (references its posts) + `BreadcrumbList`.
- Article → `BlogPosting` (headline, description, dates, `articleSection`,
  keywords, image, author/publisher = Person, `isPartOf` = WebSite) +
  `BreadcrumbList`. Visible breadcrumbs match the structured trail.
- Projects index → `CollectionPage` + `BreadcrumbList`.
- Project → `CreativeWork` (deliberately **not** `SoftwareApplication`: these are
  case studies, not commercial products — no offers/prices/ratings asserted).
- `Person.sameAs` includes only verified profiles (GitHub, LinkedIn, Medium,
  Substack). Twitter/X is **not** included (see §15). No employer is asserted.
- All JSON-LD is serialized with `<` escaped to `<` to prevent injection.

---

## 7. Sitemap & robots strategy

- **Sitemap** (`/sitemap.xml`): every indexable page — static routes, all
  articles, all projects. `lastModified` comes from frontmatter `updated`/`date`
  (articles) and the newest post (writing hub); other pages omit it rather than
  fake it. No `priority`/`changeFrequency`. New posts appear automatically.
  Excludes `/api/*`, `/export/*`, the 404, and preview/feed endpoints.
- **Robots** (`/robots.txt`): `Allow: /`, `Disallow: /api/` and `/export/`
  (duplicate content), `Host` and `Sitemap` declared. CSS/JS/images stay
  crawlable. No arbitrary per-crawler rules.
- **Canonicalization**: HTTPS, `chemacabeza.dev`, lowercase, **no** trailing
  slash (enforced by canonical URLs + a test). Host redirects (apex/www, http→
  https) are handled at the Vercel/DNS layer — see §11.

---

## 8. Performance changes

- Content images now `loading="lazy"` + `decoding="async"` with a max-width
  container (reduces below-the-fold work and CLS). Author-provided `<img>` tags
  already carried `width`/`alt`.
- OG image no longer uses the `edge` runtime, so it prerenders to a static asset
  instead of rendering on demand.
- Fonts already use `next/font` (`Geist`/`Geist_Mono`, `display: swap`).
- Almost all routes are static (`○`) or SSG (`●`); no route is server-rendered
  on demand after these changes.
- Lab metrics: see §10 (measured where the environment allowed).

---

## 9. Internal-linking changes

- Breadcrumbs on articles and projects (visible `<nav aria-label="Breadcrumb">`
  + matching `BreadcrumbList`).
- Related articles by shared tags; project→article links by tech/category match.
- Prev/next article navigation with `rel="prev"`/`rel="next"`.
- Author bio linking to About on every article; About links to projects/writing/
  now/contact with descriptive anchor text.
- Writing hub and footer expose the RSS feed; homepage links to cornerstone
  projects and writing (pre-existing, retained).
- **Tag pages**: intentionally **not** created. Tags remain visible labels;
  generating a route per tag would produce thin, low-value pages (explicitly to
  be avoided). Revisit only if a tag accumulates enough articles to warrant a
  curated, described hub.

---

## 10. Validation results

Commands run from the repo root:

| Command | Result |
|---|---|
| `npm run lint` | ✅ clean (0 errors, 0 warnings) |
| `npm run test` | ✅ **39/39 pass** (16 pre-existing + 23 new SEO checks) |
| `npm run build` | ✅ succeeds; all routes static/SSG |
| Crawl of 37 routes | ✅ every page exactly **one `<h1>`**; **0 broken internal links** (55 unique links, all 200) |
| `/sitemap.xml` | ✅ well-formed XML, 37 URLs, all on canonical host, no `/api` or `/export` |
| `/robots.txt` | ✅ references sitemap; blocks `/api/`, `/export/` |
| `/rss.xml` + `/feed.xml` | ✅ well-formed, 24 items, `dc:creator` on each, both 200 |
| `/llms.txt`, `/manifest.webmanifest`, `/apple-icon`, `/opengraph-image` | ✅ all 200 |
| Rendered HTML per page | ✅ unique title/description, absolute self-canonical, correct OG/Twitter, correct JSON-LD `@type`s |

**Rendered-HTML spot checks**

- Home: title `José María Cabeza Rodríguez — Engineering Manager & System
  Architect`; JSON-LD `WebSite` + `Person`.
- About: `About — Engineering Manager in Berlin — …`; `ProfilePage` + `Person`.
- Writing: `Writing — System Design & Engineering — …`; `Blog` + `BreadcrumbList`.
- Projects: `Projects — Engineering Case Studies — …`; `CollectionPage` + breadcrumb.
- Article: `BlogPosting` with `datePublished`/`dateModified`, `articleSection`,
  `author`/`publisher` → `#person`, `isPartOf` → `#website`; `<time datetime>`.
- Project: `CreativeWork` + breadcrumb; no offers/ratings.

**Lighthouse**

A full Lighthouse run could **not be completed in this build environment** — no
`lighthouse`/`lhci` is installed, and a one-off `npx lighthouse@12` run against
the local production server did not finish within a 280 s bound (headless Chrome
under a VPN was too slow). Lab scores should be measured against the **deployed**
site, where they are also more representative. Run it with:

```bash
npm run build && npm run start &                 # serve production build
npx lighthouse@12 https://chemacabeza.dev/ \
  --preset=desktop --only-categories=performance,seo,accessibility,best-practices \
  --view
# or, mobile field-representative:
npx lighthouse@12 https://chemacabeza.dev/ --view
```

What the changes structurally favor (pending measurement):

- **SEO**: single H1 per page, unique titles/descriptions, canonical + robots +
  sitemap + structured data present → SEO should sit at/near 100.
- **Performance**: every route prerenders as static/SSG; content images are
  lazy/async; fonts via `next/font` with `swap`; OG image is now a static asset;
  minimal client JS (only the newsletter iframe + analytics are client-side).
- **Accessibility**: skip-link, landmarks, `aria-label`ed nav/social links,
  breadcrumb `aria-current`, focus-visible skip target retained.

Lab (Lighthouse) vs. field (Search Console Core Web Vitals / CrUX) data are
distinct — treat the numbers above as lab targets and confirm field data in
Search Console after ~28 days of traffic.

---

## 11. Remaining manual actions

1. **Host redirects** — ensure `www.chemacabeza.dev` and `http://` 301-redirect
   to `https://chemacabeza.dev` (Vercel Domains → set `chemacabeza.dev` primary;
   Vercel forces HTTPS automatically). Not configurable in the repo.
2. **Set verification env vars** in Vercel (see §12/§13) and redeploy.
3. **Submit the sitemap** to Google Search Console and Bing (see §12/§13).
4. **Review the flagged content** in §15 and correct/soften any figure that is
   not verifiable.
5. Optionally add a real `Person` photo and set it as the JSON-LD `image` /
   a dedicated OG image for stronger entity signals.

---

## 12. Google Search Console submission

1. Deploy with `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` set in Vercel
   (Project → Settings → Environment Variables). Value = the `content` of the
   HTML-tag verification method in Search Console (not the whole tag).
2. In Search Console choose the **URL-prefix** property `https://chemacabeza.dev`,
   verify via **HTML tag** (the meta tag is now rendered in `<head>`).
3. Sitemaps → add `sitemap.xml` → Submit.
4. Use **URL Inspection** on the homepage and 1–2 articles → Request indexing.
5. Confirm `Person`/`BlogPosting` in the **Rich Results Test**
   (`https://search.google.com/test/rich-results`).

---

## 13. Bing Webmaster Tools submission

1. Set `NEXT_PUBLIC_BING_SITE_VERIFICATION` in Vercel (the `msvalidate.01`
   content value) and redeploy — or simply **import the site from Google Search
   Console** (fastest; skips manual verification).
2. Add site `https://chemacabeza.dev`; verify via the meta tag.
3. Sitemaps → Submit `https://chemacabeza.dev/sitemap.xml`.

---

## 14. Suggested keyword-to-page map

_A content-planning map — not a stuffing checklist. Terms should appear
naturally in the target page's visible copy._

| Intent / query | Primary page(s) |
|---|---|
| José María Cabeza Rodríguez (name / identity) | Home, About |
| Engineering Manager Berlin / Software Engineering Manager | Home, About |
| System Architect | Home, About |
| System design | Writing hub + system-design guides (`…system-design-fundamentals`, `…system-design-interviews`, `how-system-design-fails`) |
| Distributed systems | Writing hub + `…the-cap-theorem`, `…apache-kafka`, `why-microservices-fail` |
| Java / Spring Boot architecture | `…java-modules`, `Java + Spring Boot In Depth` project, DDD content |
| Microservices & software architecture | `monolith-vs-microservices`, `…microservices`, `…software-architecture`, `why-microservices-fail` |
| Engineering leadership | About + `…okrs`, `performance-is-a-product-feature` |
| Backend engineering / architecture | Home, Projects, backend/architecture articles |
| Technical writing (Feynman guides) | Writing hub + individual guides |
| Platform engineering / observability | `microservices-observability-dashboard` project |

---

## 15. Content requiring owner review

These are **existing** claims in the repo. They were **not** modified, and no
unverifiable figure was encoded into structured data. Please confirm or soften:

1. **Project case-study metrics** (`lib/projects.ts`) read as illustrative:
   e.g. "50k+ daily requests", "P95 latency 180ms", "Three enterprise clients
   onboarded within the first month", "500 active users within 60 days", "78%
   day-30 retention", "MTTR ~4h → <15 min", "on-call satisfaction 3.2 → 4.7/5".
   If not verifiable, soften them — fabricated results are an SEO/E-E-A-T risk.
   (Structured data intentionally omits all of these numbers.)
2. **About-page employment figures** (`app/about/page.tsx`): Klarna Engineering
   Manager since Sept 2020, "team of 8", "1,700+ merchants weekly", "1.4M+
   requests per week", plus NCR/Amadeus details. Confirm these are current and
   accurate. The `Person` JSON-LD deliberately omits `worksFor`/employer so no
   current-employer claim is asserted programmatically.
3. **Positioning tension**: the homepage badge "Available for engineering
   leadership roles" vs. About "today I lead a team of 8". Reconcile the wording.
4. **Twitter/X**: `@chemacabeza` is used as `twitter:creator`/`site` but is
   **not** in `Person.sameAs` because the account wasn't verified as active.
   Add it to `sameAsProfiles` in `lib/metadata.ts` if the profile is live.
5. **`/hobbies` title** is `AI Image Generation Platform` — accurate for the
   content, but consider whether a "Hobbies —" framing better matches intent.

---

## 16. How to re-validate

```bash
npm run lint          # eslint
npm run test          # 39 tests incl. tests/seo.test.ts
npm run build         # production build
npm run start         # then curl http://localhost:3000/sitemap.xml, /robots.txt, /rss.xml
```

The SEO test suite (`tests/seo.test.ts`) guards the invariants above: title
dedup, absolute canonicals, single-H1 rule (incl. no in-body H1), sitemap
host/coverage/uniqueness, robots sitemap reference, required JSON-LD fields,
JSON-LD escaping, unique descriptions, and internal-linking logic. It runs as
part of `npm run test` and in CI.
