# chemacabeza.dev

Personal site and engineering blog built with **Next.js 16**, **React 19**, and **Tailwind CSS v4**.

Live at [chemacabeza.dev](https://chemacabeza.dev).

## What’s in this repo

- **Site** — App Router pages under `app/` (home, about, projects, writing, contact, etc.)
- **Blog** — MDX posts in `content/posts/`; rendered via `lib/mdx.ts` and `next-mdx-remote`
- **Cross-posting** — Scripts and GitHub Actions that mirror new posts to LinkedIn, Medium, and Substack

For agent/AI context and pipeline details, see [`CLAUDE.md`](./CLAUDE.md).

## Requirements

- Node.js **≥ 20.9.0**

## Commands

```bash
npm run dev      # http://localhost:3000
npm run build    # production build (same as Vercel)
npm run start    # serve the production build
npm run lint     # ESLint (flat config)
npm run test     # propagation layer tests (Node test runner + tsx)
```

## Content

Blog posts live in `content/posts/*.mdx`. The **filename is the slug**.

Frontmatter fields: `title`, `description`, `date` (ISO), `tags[]`, optional `featured`.

## Cross-posting (short version)

New MDX posts trigger prep workflows that enqueue LinkedIn/Medium entries. LinkedIn publishes via API in CI; Medium is manual import; Substack uses local CDP automation or the `tools/chemacabeza-crosspost` package.

See [`CLAUDE.md`](./CLAUDE.md) and [`docs/content-propagation.md`](./docs/content-propagation.md) for the full picture.

## Deploy

Hosted on [Vercel](https://vercel.com). Pushes to `master` deploy automatically.
