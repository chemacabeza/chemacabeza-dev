# chemacabeza.dev 🚀

Personal developer website, technical blog, and engineering monitoring hub built with **Next.js 16**, **React 19**, **Tailwind CSS v4**, and integrated with a **Vercel Read-Only MCP Server**.

Live at [chemacabeza.dev](https://chemacabeza.dev).

---

## ⚡ Minimal Commands: Post Creation & Vercel Deployment

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
Run a single command to trigger production deployment directly on Vercel:

```bash
# Option A: One-line direct Vercel API deployment
make deploy-vercel

# Option B: Standard Git push (triggers Vercel GitHub CI/CD integration)
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
- **Vercel MCP Monitor Integration**: Connected to `/home/chemacabeza/Repositories/vercel-mcp-server.git` via Streamable HTTP (SSE) and automated Git hooks (`post-commit`, `post-merge`) for real-time status and health audits.
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

### 2. Vercel MCP Server & Health Monitoring

| Command | Description |
|---------|-------------|
| `make mcp-start` | Start the Vercel MCP Monitor Server (`http://localhost:3001`) |
| `make mcp-health` | Run live MCP health audit for `chemacabeza-dev` against Vercel REST API |
| `make mcp-verify` | Verify MCP server tool listing and Streamable HTTP (SSE) transport |
| `make mcp-test` | Run 14 Vitest unit tests inside `vercel-mcp-server` |

### 3. Content Propagation & Publishing

| Command | Description |
|---------|-------------|
| `make propagate-posts` | Run post propagation CLI to generate cross-posting artifacts |
| `make validate-propagation` | Validate propagation status across platforms |
| `make linkedin-publish` | Publish queued post blurbs to LinkedIn via API |
| `make medium-publish` | Publish queued post artifacts to Medium |

### 4. Deployment & Maintenance

| Command | Description |
|---------|-------------|
| `make deploy-vercel` | Trigger production build & deployment directly via Vercel REST API |
| `make clean` | Clean Next.js `.next`, `out`, and build caches |

---

## 🔗 Automatic Git Hooks Integration

The workspace includes active Git hooks linked to the Vercel MCP Server:

- **`.git/hooks/post-commit`**: Automatically triggers `make mcp-health` after every git commit.
- **`.git/hooks/post-merge`**: Automatically triggers `make mcp-health` after pulling or merging code.

If the MCP server is active on `http://localhost:3001`, your deployment status, build states, and error events are audited instantly.

---

## 🔒 AgentVercel Reporter Status Integration

The site includes a restrained, server-side status indicator in the footer that fetches telemetry from the protected `GET /api/status` endpoint of the `agentvercel-daily-reporter`.

### Configuration (Server-Only Environment Variables)

- `AGENTVERCEL_REPORTER_URL`: Base URL of the deployed daily reporter service (e.g. `https://reporter.example.com`).
- `AGENTVERCEL_STATUS_SECRET`: Shared Bearer authorization secret.

```bash
# Add to .env.local for local testing
AGENTVERCEL_REPORTER_URL=https://agentvercel-daily-reporter.example.com
AGENTVERCEL_STATUS_SECRET=your-secure-status-secret
```

### Security & Privacy Guarantees

1. **Server-Side Execution**: Requests run entirely on the server inside Next.js Server Components. Secrets are never sent to the browser or included in client JavaScript bundles.
2. **Minimal Telemetry**: Renders only availability, last report timestamp, change count, and warning count (if non-zero). No Vercel project names, deployments, domains, email addresses, or internal URLs are exposed.
3. **Fail-Closed Behavior**: Network failures, timeouts (3s limit), 40x/50x HTTP status codes, or malformed schemas return a neutral "Status temporarily unavailable" state without leaking raw error traces.


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

Minimal direct API deployment command:
```bash
make deploy-vercel
```
