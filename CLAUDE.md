# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> ⚠️ This repo runs **Next.js 16** (App Router, React 19). Its APIs differ from older Next.js — read the relevant guide under `node_modules/next/dist/docs/` before writing framework code (see AGENTS.md above).

## What this is

A personal site/blog (`chemacabeza.dev`) built with Next.js 16 + TypeScript + Tailwind v4. Blog posts are MDX files; on top of the site sits a **social auto-publishing pipeline** that mirrors each post to Medium and LinkedIn. The pipeline is the part of the codebase that spans many files and isn't obvious from any single one.

## Commands

```bash
npm run dev      # dev server at http://localhost:3000
npm run build    # production build (also what Vercel runs)
npm run start    # serve the production build
npm run lint     # eslint (flat config: eslint.config.mjs)
```

There is **no test framework** configured — no `test` script, no test runner. Don't invent test commands; verify changes via `npm run build` / `npm run dev`.

Node `>=20.9.0` is required (see `package.json` `engines`).

## Content model

- Blog posts live in `content/posts/*.mdx`. The **filename is the slug**. Frontmatter fields: `title`, `description`, `date` (ISO), `tags[]`, optional `featured`.
- `lib/mdx.ts` is the single content-access layer — `getAllPosts()` (sorted newest-first), `getPostBySlug()`, `getFeaturedPosts()`. Anything that needs post data goes through here; don't read `content/posts` directly elsewhere.
- `app/writing/[slug]/page.tsx` renders a post with `MDXRemote` from `next-mdx-remote/rsc` (server component) and is statically generated via `generateStaticParams()`. `app/writing/page.tsx` is the index.
- `lib/metadata.ts` (`createMetadata`) centralizes SEO/OpenGraph metadata — use it for new pages rather than hand-rolling `metadata` objects.
- `next.config.ts` sets `pageExtensions` to include `md`/`mdx` and rewrites `/feed.xml` → `/api/rss` and `/export/:slug` → `/api/export/:slug` (the export route is the canonical source Medium imports from).

## Social auto-publishing pipeline (the non-obvious system)

Two parallel pipelines (Medium, LinkedIn) publish each new blog post to social media. Both are driven by a per-platform **queue file** that is the source of truth:

- `scripts/medium-poster/posts.json`
- `scripts/linkedin-poster/posts.json`

Each entry tracks one post: `slug`, `posted`, `postedAt`, a prewritten `body` (LinkedIn) and scheduling fields. The lifecycle is **prep → publish → mark-posted**, all in GitHub Actions under `.github/workflows/`:

- **Prep** (`*-prep.yml`, triggered on push when `content/posts/**` changes): `.github/scripts/prepare-{medium,linkedin}-posts.mjs` enqueues newly-added posts into the platform's `posts.json` with a scheduled time, then commits.
- **LinkedIn publish** (`linkedin-publish.yml`, triggered on push that changes `scripts/linkedin-poster/posts.json`, or manual dispatch): runs `scripts/linkedin-poster/publish-via-api.mjs`, which POSTs every `!posted` entry to the LinkedIn API using repo secrets `LINKEDIN_ACCESS_TOKEN` + `LINKEDIN_PERSON_URN`. If those secrets are unset it **logs a warning and skips** (still succeeds). Generate the token via `npm run linkedin:setup` (one-time 3-legged OAuth helper that prints the values to paste into GitHub secrets).
- **Medium publish**: Medium retired its publishing API, so `medium-publish.yml` only maintains a GitHub Issue queue. **Actual Medium publishing happens locally**, not in CI: a systemd *user* timer (installed by `scripts/medium-poster/install-cron-publish.sh`, currently every 30 min) fires `cron-publish-next.sh`, which publishes the single oldest due post by driving an offscreen Chrome over the Chrome DevTools Protocol (`cdp-publish.mjs`) through Medium's `/p/import` flow. It needs a **logged-in Medium session**: `start-chrome-with-cdp.sh` clones cookies from your main Chrome profile into a separate CDP profile on port 9222. On success it marks `posts.json` and commits.

### Conventions that matter here

- **`[skip ci]` is load-bearing.** Every auto-publish/status commit message ends with `[skip ci]`, and the `*-publish` workflows skip commits authored by `github-actions[bot]` or containing `[skip ci]`. This is what prevents a publish workflow from re-triggering itself on its own "mark as posted" commit — preserve it on any commit that touches a `posts.json`.
- `playwright` is a devDependency used only by the Medium CDP automation; Vercel builds set `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` (see `vercel.json`).
- Manual one-off runs: `npm run medium:prep`, `npm run medium:publish`, `npm run linkedin:publish`.
