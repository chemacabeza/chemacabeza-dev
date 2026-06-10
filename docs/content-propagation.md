# Content propagation

Cross-posts every article on [`/writing`](https://chemacabeza.dev/writing) to
**Substack**, **Medium**, and **LinkedIn** — propagating the **complete article
text**, not just a title, excerpt, or link.

The website (`content/posts/*.mdx`, surfaced by `lib/mdx.ts`) is the **source of
truth**. The system reads each post, normalizes it (full body as Markdown + HTML,
absolutized URLs, canonical link, cover image, content hash), and for each
platform either publishes via a compliant API or emits a ready-to-paste
full-text draft.

> **Default is dry-run.** Nothing is published unless you pass `--publish`.
> Credentials are read only from environment variables and are never committed.

## What is automated vs manual

| Platform | Path | Full text | Notes |
|----------|------|-----------|-------|
| **Medium** | Manual artifact | ✅ artifact | Medium's Publishing API is **retired** (docs archived). We generate a full-text Markdown + HTML draft for import via `medium.com/p/import` (canonical preserved). |
| **Substack** | Manual artifact | ✅ artifact | **No official public write API.** We generate a full-text paste-ready draft. (An isolated experimental CDP automation exists at `scripts/substack-poster/`, intentionally not wired in.) |
| **LinkedIn** | API (feed) + manual artifact | ✅ artifact; teaser on platform | The Posts REST API publishes a **feed teaser** with explicit article-link metadata. LinkedIn has **no public long-form article API**, so the full-text **article** is always a manual artifact (`<slug>.article.md`). |

Because no platform offers a fully-supported full-text publishing API for this
account, the **complete article body is always written to a local artifact**, and
LinkedIn's feed teaser is the only thing posted automatically (with `--publish`).

## Commands

```bash
# Dry-run everything (safe; writes previews under out/crosspost/)
npm run propagate:posts -- --dry-run
npm run propagate:posts -- --all --dry-run

# One post
npm run propagate:posts -- --slug the-feynman-guide-to-system-design-interviews --dry-run

# One platform, one post, live
npm run propagate:posts -- --platform medium --slug <slug> --publish

# Publish everything where a supported path exists (LinkedIn feed); the rest
# produce manual full-text artifacts:
npm run propagate:posts -- --all --publish

# Push changes to already-propagated posts
npm run propagate:posts -- --all --update-existing --publish

# Only posts dated on/after a day
npm run propagate:posts -- --all --since 2026-05-01 --dry-run

# Report status across all posts/platforms
npm run validate:post-propagation
```

### Flags

`--all`, `--slug <slug>`, `--platform <substack|medium|linkedin|all>`,
`--dry-run`, `--publish`, `--update-existing`, `--since <YYYY-MM-DD>`,
`--print-body` (dump the full rendered body to the console).

`--dry-run` always wins if combined with `--publish`. Missing credentials never
crash a run — the affected platform reports `manual_required`. The command exits
non-zero only on a true runtime/API failure, never for expected missing creds.

## Generated artifacts

Under `out/crosspost/` (gitignored — regenerate any time):

```
out/crosspost/
  medium/<slug>/post.md         # full-text Markdown
  medium/<slug>/post.html       # full-text HTML
  medium/<slug>/metadata.json
  substack/<slug>/post.md
  substack/<slug>/post.html
  substack/<slug>/metadata.json
  linkedin/<slug>.post.md        # feed teaser (summary + takeaways + link + hashtags)
  linkedin/<slug>.article.md     # COMPLETE article text
  linkedin/<slug>.json
```

`metadata.json` records source URL, title, description, tags, content hash,
platform, generated timestamp, `fullTextIncluded`, and char/word counts.

## How idempotency works

State lives in `.content-propagation-state.json` (repo root, **committed** — it
holds only non-secret mapping data: slugs, content hashes, public URLs/IDs,
statuses, timestamps). Each run, per post × platform:

1. If the post's **content hash** matches the recorded one and you didn't pass
   `--update-existing` → **skip** (artifacts are still refreshed).
2. Else, if the post is found on the platform's public RSS feed but not yet in
   state → it's **mapped in** and skipped (no duplicate created).
3. Else → publish (where supported) or regenerate the artifact, and record the
   result.

Running twice with no source changes creates **no duplicates** and publishes
nothing new.

## Updating a post after editing the source

Edit `content/posts/<slug>.mdx`. The content hash changes, so the next run treats
it as changed. Use `--update-existing` to push the change to platforms that
support updates; for manual platforms, re-paste the refreshed artifact.

## Verifying full-text propagation

`npm run validate:post-propagation` prints a per-post × per-platform table with a
`FT` / `no-FT` marker and opens each artifact to confirm it contains (most of)
the article body — not just a summary. It also lists posts missing on each
platform, changed locally, requiring manual action, or missing full-text.

## Recovering from partial failures

State is saved after the run. Re-running resumes: unchanged/successful items skip,
`error` items retry, `manual_required` items regenerate their artifacts. Fix the
cause (e.g. expired LinkedIn token) and re-run the same command.

## Environment

See `.env.example`. Summary:

- `SITE_BASE_URL` — canonical base (default `https://chemacabeza.dev`).
- `MEDIUM_INTEGRATION_TOKEN`, `MEDIUM_AUTHOR_ID` (+ optional `MEDIUM_API_BASE`) —
  only used if you opt into a working Medium endpoint; otherwise manual mode.
- `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_AUTHOR_URN` — feed-teaser publishing.
- `SUBSTACK_PUBLICATION_URL` — for feed-based existing-post detection (no token;
  Substack is manual-only).

## Known limitations

- **Medium**: no live API publishing (retired). Manual import required.
- **Substack**: no public write API. Manual paste (or the experimental CDP flow).
- **LinkedIn**: full-text long-form articles have no public API — only the feed
  teaser is automated; the article is a manual artifact. Feed-post text limits
  mean the teaser is intentionally a summary + link, while the full text is
  preserved separately in `<slug>.article.md`.
- We never silently truncate: if a hard platform limit applies, the result is
  `manual_required` and the full-text artifact is still generated.

## CI

A manual GitHub Actions workflow (`.github/workflows/content-propagation.yml`)
runs `workflow_dispatch` only, **defaults to dry-run**, and reads credentials
from GitHub Secrets. It never publishes on push.
