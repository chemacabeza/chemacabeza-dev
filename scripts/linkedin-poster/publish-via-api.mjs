#!/usr/bin/env node
// Publish queued LinkedIn blurbs via the official Posts REST API.
// Run locally:   LINKEDIN_ACCESS_TOKEN=... LINKEDIN_PERSON_URN=urn:li:person:xxx node scripts/linkedin-poster/publish-via-api.mjs
// Run in CI:     same env vars, sourced from repo secrets (see .github/workflows/linkedin-publish.yml).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const POSTS_FILE = join(HERE, 'posts.json');

const TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const PERSON_URN = process.env.LINKEDIN_PERSON_URN;
const API_VERSION = process.env.LINKEDIN_API_VERSION || '202605';
const DRY_RUN = process.argv.includes('--dry-run');

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
  return text.replace(/\\/g, '\\\\');
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
      'LinkedIn-Version': API_VERSION,
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
  console.error('\nRe-issue an access token by running:  node scripts/linkedin-poster/setup-auth.mjs');
  console.error('Then update the LINKEDIN_ACCESS_TOKEN repository secret.');
}

process.exit(failed > 0 ? 1 : 0);
