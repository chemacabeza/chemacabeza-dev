#!/usr/bin/env node
// Publish due Medium queue entries by driving Medium's official "Import a story"
// flow with Playwright. Medium killed the integration-token API in 2024, so
// browser automation against the import URL is the cleanest remaining path.
//
// Required env:
//   MEDIUM_SESSION_COOKIE  — value of the `sid` cookie from medium.com (HttpOnly)
//
// Optional env:
//   MEDIUM_SITE_URL        — defaults to https://chemacabeza.dev
//   MEDIUM_AUTO_PUBLISH    — 'true' (default) clicks Publish; 'false' leaves as draft
//   MEDIUM_HEADLESS        — 'false' to open a visible browser (local debugging only)
//   MEDIUM_NAV_TIMEOUT_MS  — per-step navigation timeout (default 60000)
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const POSTS_FILE = join(HERE, 'posts.json');
const DEBUG_DIR = join(HERE, '.debug');

const SESSION_COOKIE = process.env.MEDIUM_SESSION_COOKIE;
const SITE_URL = process.env.MEDIUM_SITE_URL || 'https://chemacabeza.dev';
const AUTO_PUBLISH = (process.env.MEDIUM_AUTO_PUBLISH || 'true') === 'true';
const HEADLESS = (process.env.MEDIUM_HEADLESS || 'true') === 'true';
const NAV_TIMEOUT = parseInt(process.env.MEDIUM_NAV_TIMEOUT_MS || '60000', 10);
const DRY_RUN = process.argv.includes('--dry-run');

function die(msg, code = 2) {
  console.error(msg);
  process.exit(code);
}

if (!DRY_RUN && !SESSION_COOKIE) {
  die('Missing MEDIUM_SESSION_COOKIE. Copy the `sid` cookie value from medium.com and set it as a repo secret.');
}

const posts = JSON.parse(readFileSync(POSTS_FILE, 'utf8'));
const save = () => writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2) + '\n');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const now = Date.now();
const due = posts.filter(
  (p) => !p.posted && p.scheduledFor && new Date(p.scheduledFor).getTime() <= now
);
const totalPending = posts.filter((p) => !p.posted).length;

console.log(`Medium importer — ${due.length} due, ${totalPending} total pending.`);
if (DRY_RUN) console.log('DRY RUN — no browser will be launched.\n');
if (due.length === 0) {
  console.log('Nothing due yet.');
  process.exit(0);
}

if (DRY_RUN) {
  for (const p of due) {
    const sourceUrl = `${SITE_URL}/writing/${p.slug}`;
    console.log(`  [dry-run] would import ${sourceUrl} (autoPublish=${AUTO_PUBLISH}, tags=${JSON.stringify(p.tags || [])})`);
  }
  console.log('\nDry run complete — exiting without browser launch.');
  process.exit(0);
}

async function dumpDebug(page, tag) {
  try {
    mkdirSync(DEBUG_DIR, { recursive: true });
    const ts = Date.now();
    const shot = join(DEBUG_DIR, `medium-${tag}-${ts}.png`);
    const html = join(DEBUG_DIR, `medium-${tag}-${ts}.html`);
    await page.screenshot({ path: shot, fullPage: true }).catch(() => {});
    writeFileSync(html, await page.content().catch(() => ''));
    console.error(`  Screenshot: ${shot}`);
    console.error(`  HTML:       ${html}`);
  } catch {}
}

async function verifyLoggedIn(page) {
  await page.goto('https://medium.com/me', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
  // If the cookie is bad, Medium redirects to /m/signin or /signin.
  const url = page.url();
  if (/\/(m\/)?signin/.test(url)) {
    throw new Error(`Session cookie rejected — landed on ${url}. The 'sid' cookie has likely expired; regenerate it.`);
  }
  console.log(`  ✓ Logged-in session valid (landed on ${url})`);
}

async function clickFirstVisible(page, locators, label) {
  for (let i = 0; i < locators.length; i++) {
    const loc = locators[i]();
    if (await loc.isVisible({ timeout: 1500 }).catch(() => false)) {
      await loc.click({ timeout: 5000 });
      console.log(`    → clicked ${label} (candidate #${i + 1})`);
      return true;
    }
  }
  return false;
}

async function importOne(page, post) {
  const sourceUrl = `${SITE_URL}/writing/${post.slug}`;
  console.log(`  → opening importer for ${sourceUrl}`);

  await page.goto('https://medium.com/p/import', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });

  // URL input — Medium has used a few shapes for this; try them in order.
  const urlInput = page.locator(
    'input[type="url"], input[placeholder*="URL" i], input[name*="url" i], input[aria-label*="URL" i]'
  ).first();
  await urlInput.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
  await urlInput.fill(sourceUrl);

  // Import button
  const clicked = await clickFirstVisible(page, [
    () => page.getByRole('button', { name: /^import$/i }).first(),
    () => page.locator('button:has-text("Import")').first(),
    () => page.locator('button[type="submit"]').first(),
  ], 'Import');
  if (!clicked) {
    await dumpDebug(page, `import-button-${post.slug}`);
    throw new Error('Could not find the Import button.');
  }

  // Wait for Medium to fetch the URL and produce a draft. Medium routes to
  // /p/<storyId>/edit when import finishes. Allow generous time for long posts.
  await page.waitForURL(/medium\.com\/p\/[^/]+\/edit/, { timeout: 180000 });
  const draftUrl = page.url();
  console.log(`    ✓ import complete → ${draftUrl}`);

  if (!AUTO_PUBLISH) {
    return { url: draftUrl, status: 'draft' };
  }

  // Click Publish in top-right.
  await sleep(2000); // let the editor settle
  const opened = await clickFirstVisible(page, [
    () => page.getByRole('button', { name: /^publish$/i }).first(),
    () => page.locator('button[data-action="show-prepublish"]').first(),
    () => page.locator('button:has-text("Publish")').first(),
  ], 'Publish (open dialog)');
  if (!opened) {
    await dumpDebug(page, `publish-open-${post.slug}`);
    throw new Error('Could not find the Publish button to open the dialog.');
  }

  // Wait for prepublish dialog. Tag input is a contenteditable or text input.
  const tags = (post.tags || []).slice(0, 5);
  if (tags.length) {
    const tagInput = page.locator(
      'div[data-testid="storyPreviewTagsInput"] input, input[placeholder*="tag" i], div[contenteditable="true"][data-testid*="tag" i]'
    ).first();
    if (await tagInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      for (const t of tags) {
        await tagInput.fill('');
        await tagInput.type(t, { delay: 20 });
        await page.keyboard.press('Enter');
        await sleep(300);
      }
      console.log(`    → tags entered: ${tags.join(', ')}`);
    } else {
      console.warn('    ⚠ tag input not found — publishing without tags');
    }
  }

  // Final publish click.
  const published = await clickFirstVisible(page, [
    () => page.getByRole('button', { name: /publish now/i }).first(),
    () => page.locator('button[data-action="publish"]').first(),
    () => page.locator('button:has-text("Publish now")').first(),
  ], 'Publish now');
  if (!published) {
    await dumpDebug(page, `publish-now-${post.slug}`);
    throw new Error('Could not find the final "Publish now" button.');
  }

  // Medium redirects to the published post URL after a successful publish.
  await page.waitForURL((u) => !u.toString().includes('/edit'), { timeout: 60000 }).catch(() => {});
  const finalUrl = page.url();
  console.log(`    ✓ published → ${finalUrl}`);
  return { url: finalUrl, status: 'published' };
}

const browser = await chromium.launch({ headless: HEADLESS });
const context = await browser.newContext({
  userAgent:
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  viewport: { width: 1280, height: 900 },
});
await context.addCookies([
  {
    name: 'sid',
    value: SESSION_COOKIE,
    domain: '.medium.com',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
  },
]);

const page = await context.newPage();

let posted = 0;
let failed = 0;
let sessionFailure = false;

try {
  await verifyLoggedIn(page);

  for (let i = 0; i < due.length; i++) {
    const p = due[i];
    console.log(`\n[${i + 1}/${due.length}] ${p.slug}`);
    try {
      const result = await importOne(page, p);
      p.posted = true;
      p.postedAt = new Date().toISOString();
      p.mediumUrl = result.url;
      p.mediumStatus = result.status;
      save();
      posted++;
    } catch (err) {
      failed++;
      console.error(`  ✗ ${p.slug}: ${err.message}`);
      await dumpDebug(page, `error-${p.slug}`);
      if (/Session cookie rejected/.test(err.message)) {
        sessionFailure = true;
        break;
      }
    }
    if (i < due.length - 1) await sleep(8000); // gap between imports
  }
} finally {
  await browser.close();
}

console.log(`\nDone. posted=${posted} failed=${failed}`);
if (sessionFailure) {
  console.error('\nRefresh the MEDIUM_SESSION_COOKIE secret:');
  console.error('  1. Log into medium.com in your browser.');
  console.error('  2. DevTools → Application → Cookies → medium.com → copy the `sid` value.');
  console.error('  3. Update the repository secret MEDIUM_SESSION_COOKIE.');
}
process.exit(failed > 0 ? 1 : 0);
