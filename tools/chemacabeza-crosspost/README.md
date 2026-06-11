# chemacabeza-crosspost

Discover every article on [chemacabeza.dev/writing](https://chemacabeza.dev/writing)
and publish — or prepare for publishing — to LinkedIn, Medium, and Substack, then
**verify** each publication before marking it complete. State lives in SQLite so
repeated runs are idempotent and never duplicate posts.

> **Honest scope.** This cannot be a "guaranteed fully-automatic publish to all
> three" using only official public APIs:
> - **LinkedIn** — publishes via the official Posts API. ✅
> - **Medium** — publishes via the official API **only if you already hold an
>   integration token**; Medium no longer issues new ones. ⚠️
> - **Substack** — has **no** official public publishing API. This tool produces
>   a paste-ready outbox (or POSTs to a webhook you control) and only marks
>   Substack done once a public URL is supplied and fetch-verifies. ⚠️
>
> Nothing is marked `verified` unless verification actually passes. In `--strict`
> mode the CLI exits non-zero if any target is unverified.

## Operational policy

| Target    | Automated publish                      | Verified publish                          |
| --------- | -------------------------------------- | ----------------------------------------- |
| LinkedIn  | Yes, via official Posts API            | Yes, if the token has read permission     |
| Medium    | Yes, only with an existing Medium token| Yes, from API response + public URL       |
| Substack  | Manual / webhook only by default       | Yes, only after a public URL is supplied  |

## Setup

```bash
cd tools/chemacabeza-crosspost
pnpm install
cp .env.example .env   # fill in what you have
```

Requires Node.js 20+.

### LinkedIn

- Scopes: **`w_member_social`** to publish. A read scope (e.g. the member-post
  read permission your app is granted) is required for API verification — without
  it, `--strict` fails with *"LinkedIn publish succeeded but API verification
  requires read permission."*
- Set `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_PERSON_URN` (`urn:li:person:…`), and
  `LINKEDIN_VERSION` (e.g. `202605`).

### Medium

- **Existing integration tokens only** — Medium retired new token issuance. Set
  `MEDIUM_TOKEN`. The tool calls `/v1/me` and refuses to publish unless the token
  belongs to `chemacabeza`. Missing token ⇒ the target fails transparently.

### Substack

- No official publishing API, so pick a mode:
  - `SUBSTACK_MODE=manual` (default): writes `outbox/substack/<slug>.{html,md,json}`
    and prints the exact `confirm-substack` command to run once you've pasted &
    published in Substack.
  - `SUBSTACK_MODE=webhook`: POSTs normalized article JSON to
    `SUBSTACK_WEBHOOK_URL` and expects `{ "url": "https://…" }` back.

## Commands

```bash
pnpm dev scan                 # fetch the writing page, list discovered articles
pnpm dev publish --dry-run    # show what would be published (no API calls)
pnpm dev publish --strict     # publish where supported, build outbox where not,
                              # verify every target, exit 1 if any is unverified
pnpm dev verify               # re-run verification for unverified records
pnpm dev verify --strict      # ...and exit 1 if anything is still unverified

# Attach a Substack URL you published by hand, then verify it:
pnpm dev confirm-substack \
  --source "https://chemacabeza.dev/writing/<slug>" \
  --url    "https://chemacabeza.substack.com/p/<slug>"
```

`DRY_RUN=true` in `.env` forces `publish` into dry-run regardless of flags;
set it `false` (or pass `--strict`) to actually publish.

## How it stays idempotent

- `source_articles` is keyed by `source_url` with a `content_hash`.
- `publications` has a `UNIQUE(source_url, target)` constraint; every write is an
  upsert, so re-running only updates rows in place.
- An article is **complete** only when all three target rows are `verified`.
  Already-verified targets are skipped on subsequent runs.

## Tests

```bash
pnpm test
```

Covers: source parsing from fixture HTML, renderers (canonical link, LinkedIn
payload contents, Medium `canonicalUrl`), the Substack manual outbox, and
idempotent re-publishing.

## Scheduled runs (GitHub Actions)

A workflow is provided at `../../.github/workflows/crosspost.yml`. It runs
`pnpm dev publish --strict` every 6 hours and on manual dispatch. Strict mode
means the job **fails loudly** when any target is unverified, rather than silently
reporting success.

```yaml
name: Crosspost
on:
  schedule:
    - cron: "0 */6 * * *"
  workflow_dispatch:
jobs:
  crosspost:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: tools/chemacabeza-crosspost
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
          cache-dependency-path: tools/chemacabeza-crosspost/pnpm-lock.yaml
      - run: pnpm install --frozen-lockfile
      - run: pnpm dev publish --strict
        env:
          LINKEDIN_ACCESS_TOKEN: ${{ secrets.LINKEDIN_ACCESS_TOKEN }}
          LINKEDIN_PERSON_URN: ${{ secrets.LINKEDIN_PERSON_URN }}
          MEDIUM_TOKEN: ${{ secrets.MEDIUM_TOKEN }}
          SUBSTACK_MODE: manual
          DRY_RUN: "false"
```

> Note: Substack will surface as `needs_manual_publish` in CI (no official API),
> so a fully-green `--strict` run requires either a working webhook or a prior
> `confirm-substack`. This is intentional — it refuses to fake success.
