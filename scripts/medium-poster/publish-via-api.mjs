#!/usr/bin/env node
// Publish due entries from scripts/medium-poster/posts.json to Medium.
// "Due" = scheduledFor <= now && !posted.
//
// Required env: MEDIUM_INTEGRATION_TOKEN
// Optional env:
//   MEDIUM_USER_ID         — if unset, fetched via GET /v1/me
//   MEDIUM_SITE_URL        — defaults to https://chemacabeza.dev
//   MEDIUM_PUBLISH_STATUS  — public | draft | unlisted (default: public)
//   MEDIUM_NOTIFY_FOLLOWERS — true | false (default: true)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const POSTS_FILE = join(HERE, 'posts.json');

const TOKEN = process.env.MEDIUM_INTEGRATION_TOKEN;
const SITE_URL = process.env.MEDIUM_SITE_URL || 'https://chemacabeza.dev';
const PUBLISH_STATUS = process.env.MEDIUM_PUBLISH_STATUS || 'public';
const NOTIFY_FOLLOWERS = (process.env.MEDIUM_NOTIFY_FOLLOWERS || 'true') === 'true';
const DRY_RUN = process.argv.includes('--dry-run');

function die(msg, code = 2) {
  console.error(msg);
  process.exit(code);
}

if (!TOKEN) die('Missing MEDIUM_INTEGRATION_TOKEN.');

async function mediumGet(path) {
  const res = await fetch(`https://api.medium.com${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Medium GET ${path} → HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

async function resolveUserId() {
  if (process.env.MEDIUM_USER_ID) return process.env.MEDIUM_USER_ID;
  const me = await mediumGet('/v1/me');
  const id = me?.data?.id;
  if (!id) throw new Error(`Could not resolve Medium user id from /v1/me: ${JSON.stringify(me)}`);
  return id;
}

async function fetchExportHtml(slug) {
  // We host an explicit clean-HTML export endpoint at /api/export/<slug>
  // (added in commit ce7f610) precisely so cross-posters can pull a Medium-
  // friendly payload without re-rendering MDX.
  const url = `${SITE_URL}/api/export/${slug}`;
  const res = await fetch(url, { headers: { Accept: 'text/html' } });
  if (!res.ok) throw new Error(`Export fetch ${url} → HTTP ${res.status}`);
  return res.text();
}

async function publishOne(userId, post) {
  const canonicalUrl = `${SITE_URL}/writing/${post.slug}`;
  const html = await fetchExportHtml(post.slug);

  const body = {
    title: post.title,
    contentFormat: 'html',
    content: html,
    canonicalUrl,
    tags: post.tags || [],
    publishStatus: PUBLISH_STATUS,
    notifyFollowers: NOTIFY_FOLLOWERS,
  };

  if (DRY_RUN) {
    console.log(`  [dry-run] would POST title="${body.title}" tags=${JSON.stringify(body.tags)} canonical=${canonicalUrl} htmlBytes=${html.length}`);
    return { ok: true, id: 'dry-run', url: canonicalUrl };
  }

  const res = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (res.status === 201) {
    const json = await res.json();
    return { ok: true, id: json?.data?.id, url: json?.data?.url };
  }

  const text = await res.text().catch(() => '');
  return { ok: false, status: res.status, error: text.slice(0, 800) };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const posts = JSON.parse(readFileSync(POSTS_FILE, 'utf8'));
  const save = () => writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2) + '\n');

  const now = Date.now();
  const due = posts.filter((p) => !p.posted && p.scheduledFor && new Date(p.scheduledFor).getTime() <= now);

  console.log(`Medium publisher — ${due.length} due, ${posts.filter((p) => !p.posted).length} total pending.`);
  if (DRY_RUN) console.log('DRY RUN — no Medium requests will be sent.\n');

  if (due.length === 0) {
    console.log('Nothing due yet.');
    return;
  }

  let userId;
  try {
    userId = DRY_RUN ? 'dry-run-user' : await resolveUserId();
    console.log(`Medium user id: ${userId}\n`);
  } catch (e) {
    die(`Failed to resolve Medium user id: ${e.message}`);
  }

  let posted = 0;
  let failed = 0;
  let authFailure = false;

  for (let i = 0; i < due.length; i++) {
    const p = due[i];
    console.log(`[${i + 1}/${due.length}] ${p.slug}`);

    let result;
    try {
      result = await publishOne(userId, p);
    } catch (e) {
      result = { ok: false, status: 0, error: e.message };
    }

    if (result.ok) {
      if (!DRY_RUN) {
        p.posted = true;
        p.postedAt = new Date().toISOString();
        p.mediumUrl = result.url || null;
        if (result.id) p.mediumPostId = result.id;
        save();
      }
      posted++;
      console.log(`  ✓ ${DRY_RUN ? 'would publish' : 'published'}${result.url ? ` → ${result.url}` : ''}`);
    } else {
      failed++;
      console.error(`  ✗ HTTP ${result.status}: ${result.error}`);
      if (result.status === 401 || result.status === 403) {
        authFailure = true;
        console.error('  → Auth failure. Token invalid or revoked. Aborting batch.');
        break;
      }
      if (result.status === 429) {
        console.error('  → Rate limited. Aborting batch — will retry on next cron tick.');
        break;
      }
    }

    if (i < due.length - 1) await sleep(5000); // Be polite between posts.
  }

  console.log(`\nDone. posted=${posted} failed=${failed}`);
  if (authFailure) {
    console.error('\nRotate MEDIUM_INTEGRATION_TOKEN at https://medium.com/me/settings/security');
    console.error('Then update the GitHub repository secret.');
  }
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
