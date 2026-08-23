# chemacabeza.dev 🚀

Personal developer website, technical blog, and private deployment monitoring hub built with **Next.js 16**, **React 19**, and **Tailwind CSS v4**.

Live at [chemacabeza.dev](https://chemacabeza.dev).

---

## ⚡ Minimal Commands: Post Creation & Deployment

### 1. Create a New Blog Post
Create a new `.mdx` file in `content/posts/` with frontmatter:

```bash
cat << 'EOF' > content/posts/my-new-post.mdx
---
title: "My New Guide Title"
description: "A short, engaging summary of the post."
date: "2026-08-19"
tags: ["Engineering", "Guide"]
---

Write your post content using Markdown and HTML here...
EOF
```

### 2. Deploy to vercel.com (https://chemacabeza.dev)
Production deployment is owned by the configured Git/Vercel CI integration. This repository does not store a Vercel API token or trigger the Vercel API directly.

```bash
# Standard Git push (triggers the configured Vercel Git integration)
git add . && git commit -m "feat: add new post" && git push origin master
```

### 3. Propagate to LinkedIn, Medium, Substack & Dev.to
```bash
# Generate cross-posting artifacts & trigger multi-platform distribution
make propagate-posts
```

---

## 📂 What’s in this repo

- **Site & Portfolio**: Next.js App Router pages under `app/` (home, about, projects, writing, contact).
- **Blog Engine**: MDX posts in `content/posts/`, styled with standard CSS/Tailwind, rendered via `next-mdx-remote`.
- **Private Deployment Administration**: Server-only integration with `agentvercel-daily-reporter`, displayed under authenticated `/admin/deployments`.
- **Cross-posting & Propagation**: Automated scripts mirroring published technical guides to LinkedIn, Medium, Substack, and Dev.to.

For detailed architecture and AI pair programming instructions, see [`CLAUDE.md`](./CLAUDE.md).

---

## 🛠️ Makefile Commands

Use `make` to execute all common development, testing, monitoring, and deployment tasks.

```bash
# View available Makefile target summary
make help
```

### 1. Development & Building

| Command | Description |
|---------|-------------|
| `make dev` | Run Next.js local development server (`http://localhost:3000`) |
| `make build` | Compile production static bundle |
| `make start` | Serve production build locally |
| `make lint` | Run ESLint static code analysis |
| `make test` | Run workspace unit tests |

### 2. Content Propagation & Publishing

| Command | Description |
|---------|-------------|
| `make propagate-posts` | Run post propagation CLI to generate cross-posting artifacts |
| `make validate-propagation` | Validate propagation status across platforms |
| `make linkedin-publish` | Publish queued post blurbs to LinkedIn via API |
| `make medium-publish` | Publish queued post artifacts to Medium |

### 3. Deployment & Maintenance

| Command | Description |
|---------|-------------|
| `make clean` | Clean Next.js `.next`, `out`, and build caches |

---

## 🔒 Private deployment integration

The public footer fetches only aggregate telemetry from reporter `GET /api/status`. Detailed `deployment-report.v1` data is fetched server-side from reporter `GET /api/deployment-report` and displayed only at authenticated `/admin/deployments`.

```text
browser -> HttpOnly admin session -> chemacabeza-dev server
  -> Bearer-authenticated reporter request
  -> reporter Bearer-authenticated MCP request
  -> MCP read-only Vercel API request
```

The browser never receives the reporter credential, MCP credential, or Vercel credential. This repository has no Vercel access token.

### Configuration (Server-Only Environment Variables)

- `AGENTVERCEL_REPORTER_URL`: Reporter base URL.
- `AGENTVERCEL_STATUS_SECRET`: Outbound Bearer credential matching reporter `STATUS_READ_SECRET`.
- `ADMIN_DASHBOARD_SECRET`: Admin sign-in credential; at least 16 characters.

### Security & Privacy Guarantees

1. **Server-only service calls**: Requests run in Server Components with `cache: no-store` and a timeout.
2. **Private detail**: The admin session is a derived token in an HttpOnly, SameSite cookie; detailed deployment data is never placed on a public route.
3. **Runtime validation**: The site rejects malformed or unversioned report payloads, including any environment record containing a value.
4. **Fail-closed errors**: Authentication, network, timeout, non-2xx, and contract errors render generic states without upstream bodies.

### Local verification

Start the MCP server, reporter, then this site. Configure only the variable names above in an ignored local environment file, visit `/admin/login`, and use the locally configured admin credential. Confirm healthy, degraded, empty, loading, and unavailable states with reporter test fixtures or focused tests.

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```


---

## 📝 Content Authoring

Blog posts live in `content/posts/*.mdx`. The **filename is the post slug**.

Frontmatter format:
```yaml
---
title: "The Feynman Guide to Good Math"
description: "Building block analogies for numbers, infinity, logic, and Turing machines."
date: "2026-08-19"
tags: ["Math", "Computer Science", "Feynman"]
---
```

---

## 🚀 Deployment

Hosted on **Vercel**. Pushes to `master` trigger automatic deployments.

Configure the reporter URL, reporter credential, and admin credential as server-side deployment environment variables, then redeploy through the existing Git integration. Do not add a Vercel token to this project.
