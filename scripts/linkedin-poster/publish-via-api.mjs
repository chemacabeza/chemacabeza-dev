#!/usr/bin/env node
// Publish queued LinkedIn blurbs via the official Posts REST API.
// Run locally:   LINKEDIN_ACCESS_TOKEN=... LINKEDIN_PERSON_URN=urn:li:person:xxx node scripts/linkedin-poster/publish-via-api.mjs
// Run in CI:     same env vars, sourced from repo secrets (see .github/workflows/linkedin-publish.yml).
import './_ipv4-fetch.mjs'; // must precede any fetch(); see file for why
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const POSTS_FILE = join(HERE, 'posts.json');

const TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const PERSON_URN = process.env.LINKEDIN_PERSON_URN;
const FALLBACK_API_VERSION = '202605'; // last-known-good if version probing fails
let apiVersion = process.env.LINKEDIN_API_VERSION || FALLBACK_API_VERSION;
const DRY_RUN = process.argv.includes('--dry-run');
const IN_CI = !!process.env.GITHUB_ACTIONS;

// Emit a GitHub Actions annotation (surfaces in the run summary) when in CI.
function ghAnnotate(level, msg) {
  if (IN_CI) console.log(`::${level}::${msg.replace(/\n/g, '%0A')}`);
}

function die(msg, code = 2) {
  console.error(msg);
  process.exit(code);
}

if (!TOKEN) die('Missing LINKEDIN_ACCESS_TOKEN. Run setup-auth.mjs to obtain one.');
if (!PERSON_URN) die('Missing LINKEDIN_PERSON_URN (expected form: urn:li:person:XXXX).');
if (!PERSON_URN.startsWith('urn:li:person:')) {
  die(`LINKEDIN_PERSON_URN must look like "urn:li:person:XXXX", got: ${PERSON_URN}`);
}

const posts = JSON.parse(readFileSync(POSTS_FILE, 'utf8'));
const pending = posts.filter((p) => !p.posted);

if (pending.length === 0) {
  console.log('No pending posts. Nothing to do.');
  process.exit(0);
}

console.log(`LinkedIn API publisher — ${pending.length} pending post(s).`);
if (DRY_RUN) console.log('DRY RUN — no requests will be sent.\n');

const save = () => writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2) + '\n');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// LinkedIn's Little Text only requires escaping characters that would otherwise be parsed
// as markup — primarily backslash, and the mention/hashtag markers when you want them
// as literal text. Our blurbs are plain text with intentional #hashtags and URLs, no
// @mentions, so escaping hashtags would make them render as literal `\#Foo` and kill
// discoverability (which feeds boost eligibility).
function formatCommentary(text) {
  // LinkedIn "Little Text" reserves these characters — unescaped, they can
  // truncate or mangle the post (an unescaped "(" once cut a post off
  // mid-sentence, dropping the link + hashtags). Escape each with a backslash.
  // We deliberately do NOT escape '#' so hashtags stay clickable; blurbs have
  // no @-mentions. Backslash is in the class, so it's escaped too (handled
  // in a single pass since replace() doesn't re-scan inserted text).
  return text.replace(/[\\()[\]{}<>@|~*_]/g, '\\$&');
}

// Fix 4 — validate the token up front so an expired/invalid token yields one
// loud, actionable message (and a CI annotation) instead of N cryptic per-post
// 401s. The token is opaque, so we can't count down to its expiry without the
// client secret; this catches expiry the moment it takes effect.
async function preflightToken() {
  let res;
  try {
    res = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
  } catch (e) {
    console.error(`  preflight network error (${e.cause?.code || e.message}); continuing.`);
    return;
  }
  if (res.status === 401) {
    const msg =
      'LinkedIn access token is EXPIRED or INVALID. Re-run `npm run linkedin:setup`, ' +
      'then update the LINKEDIN_ACCESS_TOKEN repository secret.';
    ghAnnotate('error', msg);
    die(`\n✗ ${msg}`, 2);
  }
}

// Fix 1 — LinkedIn retires each dated API version after ~1 year (a retired
// version returns HTTP 426 NONEXISTENT_VERSION). Rather than hardcode one,
// probe newest→oldest monthly versions and use the newest that's still active,
// so the publisher self-heals as LinkedIn rolls versions forward. Override with
// LINKEDIN_API_VERSION to pin a specific one.
async function resolveApiVersion() {
  if (process.env.LINKEDIN_API_VERSION) return process.env.LINKEDIN_API_VERSION;
  const now = new Date();
  for (let i = 0; i < 18; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const v = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    let res;
    try {
      res = await fetch('https://api.linkedin.com/rest/me', {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'LinkedIn-Version': v,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });
    } catch {
      continue; // transient network blip — try the next candidate
    }
    if (res.status !== 426) return v; // any non-426 means this version is active
  }
  console.error(`  could not detect an active API version; falling back to ${FALLBACK_API_VERSION}.`);
  return FALLBACK_API_VERSION;
}

async function publishOne(post) {
  const body = {
    author: PERSON_URN,
    commentary: formatCommentary(post.body),
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };

  if (DRY_RUN) {
    console.log(`  [dry-run] would POST ${JSON.stringify(body).slice(0, 200)}...`);
    return { ok: true, id: 'dry-run' };
  }

  const res = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': apiVersion,
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  });

  if (res.status === 201) {
    const id = res.headers.get('x-restli-id') || res.headers.get('x-linkedin-id') || '';
    return { ok: true, id };
  }

  const text = await res.text().catch(() => '');
  return { ok: false, status: res.status, error: text.slice(0, 800) };
}

if (!DRY_RUN) {
  await preflightToken();
  apiVersion = await resolveApiVersion();
  console.log(`Using LinkedIn-Version: ${apiVersion}\n`);
}

let posted = 0;
let failed = 0;
let authFailure = false;

for (let i = 0; i < pending.length; i++) {
  const p = pending[i];
  console.log(`\n[${i + 1}/${pending.length}] ${p.slug}`);

  const result = await publishOne(p);

  if (result.ok) {
    if (!DRY_RUN) {
      p.posted = true;
      p.postedAt = new Date().toISOString();
      if (result.id) p.linkedinPostId = result.id;
      save();
    }
    posted++;
    console.log(`  ✓ ${DRY_RUN ? 'would publish' : 'published'}${result.id ? ` (id=${result.id})` : ''}`);
  } else {
    failed++;
    console.error(`  ✗ HTTP ${result.status}: ${result.error}`);
    if (result.status === 401 || result.status === 403) {
      authFailure = true;
      console.error('  → Auth failure. Token likely expired. Aborting remaining posts.');
      break;
    }
    if (result.status === 429) {
      console.error('  → Rate limited. Aborting remaining posts.');
      break;
    }
  }

  if (i < pending.length - 1) await sleep(2000);
}

console.log(`\nDone. posted=${posted} failed=${failed}`);

if (authFailure) {
  ghAnnotate(
    'error',
    'LinkedIn token expired/invalid mid-run. Re-run `npm run linkedin:setup` and update the LINKEDIN_ACCESS_TOKEN secret.',
  );
  console.error('\nRe-issue an access token by running:  node scripts/linkedin-poster/setup-auth.mjs');
  console.error('Then update the LINKEDIN_ACCESS_TOKEN repository secret.');
}

process.exit(failed > 0 ? 1 : 0);
