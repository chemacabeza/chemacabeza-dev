#!/usr/bin/env node
// Publish due Medium queue entries by driving Medium's official "Import a story"
// flow with Playwright. Medium killed the integration-token API in 2024, so
// browser automation against the import URL is the cleanest remaining path.
//
// Auth env — one of these is required:
//   MEDIUM_COOKIE_JAR      — full `Cookie:` header value from a logged-in request
//                            (e.g. "sid=...; uid=...; xsrf=...; ..."). Preferred:
//                            replays every cookie, so Medium's session-bundle
//                            (sid + uid + signature cookies) all land together.
//   MEDIUM_SESSION_COOKIE  — fallback: just the `sid` value. Used only if
//                            MEDIUM_COOKIE_JAR is unset.
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
const DEBUG_DIR = join(HERE, 'debug');

const COOKIE_JAR = process.env.MEDIUM_COOKIE_JAR;
const SESSION_COOKIE = process.env.MEDIUM_SESSION_COOKIE;
const SITE_URL = process.env.MEDIUM_SITE_URL || 'https://chemacabeza.dev';
const AUTO_PUBLISH = (process.env.MEDIUM_AUTO_PUBLISH || 'true') === 'true';
const HEADLESS = (process.env.MEDIUM_HEADLESS || 'true') === 'true';
const NAV_TIMEOUT = parseInt(process.env.MEDIUM_NAV_TIMEOUT_MS || '60000', 10);
// Medium fronts /p/import behind Cloudflare bot detection. Empirically the
// first request from a fresh Playwright context is allowed through, but the
// second is challenged. Cap per-run throughput to 1 and rely on the cron
// (every 30 min) to drain the queue over a few hours. Override via env if
// the bot heuristics ease.
const PER_RUN_LIMIT = parseInt(process.env.MEDIUM_PER_RUN_LIMIT || '1', 10);
const DRY_RUN = process.argv.includes('--dry-run');
const VERIFY_ONLY = process.argv.includes('--verify-cookie');

function die(msg, code = 2) {
  console.error(msg);
  process.exit(code);
}

if (!DRY_RUN && !COOKIE_JAR && !SESSION_COOKIE) {
  die('Missing auth. Set either MEDIUM_COOKIE_JAR (full Cookie header — preferred) or MEDIUM_SESSION_COOKIE (sid only).');
}

// Parse a `Cookie:` header value into [{name, value}, ...].
// Input shape: "sid=abc; uid=def; xsrf=ghi".  Tolerant of extra whitespace and
// missing values; skips empty pairs.
function parseCookieJar(raw) {
  return raw
    .split(';')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const eq = segment.indexOf('=');
      if (eq < 0) return null;
      const name = segment.slice(0, eq).trim();
      const value = segment.slice(eq + 1).trim();
      if (!name) return null;
      return { name, value };
    })
    .filter(Boolean);
}

function buildCookies() {
  let pairs;
  if (COOKIE_JAR) {
    pairs = parseCookieJar(COOKIE_JAR);
    if (pairs.length === 0) {
      throw new Error(
        `MEDIUM_COOKIE_JAR is set but parsed to 0 name=value pairs. ` +
        `Expected the full Cookie header value (many "name=value" pairs separated by "; "). ` +
        `Got a value of length ${COOKIE_JAR.length} starting with: "${COOKIE_JAR.slice(0, 40)}..."`
      );
    }
  } else {
    pairs = [{ name: 'sid', value: SESSION_COOKIE }];
  }
  // Medium issues most session cookies on the apex domain. Using ".medium.com"
  // (leading dot) covers both apex and subdomains under Playwright's matcher.
  return pairs.map(({ name, value }) => ({
    name,
    value,
    domain: '.medium.com',
    path: '/',
    secure: true,
    sameSite: 'Lax',
  }));
}

async function launchBrowser() {
  const browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
  });
  const cookies = buildCookies();
  console.log(`  → replaying ${cookies.length} cookie(s): ${cookies.map((c) => c.name).join(', ')}`);
  await context.addCookies(cookies);
  return { browser, context };
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
  const url = page.url();
  if (/\/(m\/)?signin/.test(url)) {
    throw new Error(`Session cookies rejected — landed on ${url}. The cookies have likely expired or are bound to a different client; refresh MEDIUM_COOKIE_JAR.`);
  }
  console.log(`  ✓ Logged-in session valid (landed on ${url})`);
}

if (VERIFY_ONLY) {
  console.log('Cookie smoke test — opening medium.com/me with stored cookies...');
  const { browser, context } = await launchBrowser();
  const page = await context.newPage();
  let code = 0;
  try {
    await verifyLoggedIn(page);
    console.log('\n✓ Cookie is valid. Workflow is ready to publish when posts come due.');
  } catch (err) {
    console.error(`\n✗ ${err.message}`);
    await dumpDebug(page, 'verify');
    code = 1;
  } finally {
    await browser.close();
  }
  process.exit(code);
}

const posts = JSON.parse(readFileSync(POSTS_FILE, 'utf8'));
const save = () => writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2) + '\n');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const now = Date.now();
const allDue = posts.filter(
  (p) => !p.posted && p.scheduledFor && new Date(p.scheduledFor).getTime() <= now
);
const totalPending = posts.filter((p) => !p.posted).length;

// Process at most PER_RUN_LIMIT entries this run; the rest stay queued for
// the next cron tick. This is the workaround for Cloudflare flagging burst
// imports from the same Playwright context.
const due = allDue.slice(0, PER_RUN_LIMIT);

console.log(
  `Medium importer — ${allDue.length} due, ${totalPending} total pending, ` +
  `processing ${due.length} this run (limit=${PER_RUN_LIMIT}).`
);
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
  console.log(`    landed on: ${page.url()}`);

  // Cloudflare bot-detection challenge. If we landed on one, headless Playwright
  // can't solve the challenge, so bail out cleanly instead of timing out.
  if (page.url().includes('__cf_chl_rt_tk') || (await page.title()).match(/just a moment/i)) {
    await dumpDebug(page, `cf-challenge-${post.slug}`);
    throw new Error('Cloudflare bot challenge intercepted the request — headless session blocked.');
  }

  // The import URL field is a contenteditable DIV with class js-importUrl,
  // not a real <input>. fill() doesn't work on it; click+type does.
  const urlInput = page.locator('.js-importUrl').first();

  const found = await urlInput
    .waitFor({ state: 'visible', timeout: 15000 })
    .then(() => true)
    .catch(() => false);

  if (!found) {
    console.error(`    ✗ js-importUrl not found within 15s on ${page.url()}`);
    const inputCount = await page.locator('input, textarea, [contenteditable], .js-importUrl').count().catch(() => -1);
    const buttonNames = await page
      .locator('button')
      .evaluateAll((els) => els.slice(0, 20).map((e) => (e.innerText || '').trim().slice(0, 60)))
      .catch(() => []);
    console.error(`    candidate fields on page: ${inputCount}`);
    console.error(`    first few buttons: ${JSON.stringify(buttonNames)}`);
    await dumpDebug(page, `import-no-input-${post.slug}`);
    throw new Error('Import URL field (.js-importUrl) not found — selectors likely out of date.');
  }

  // The div doesn't have contenteditable in the raw HTML — Medium's JS adds
  // it on focus, but Playwright's click events don't always trigger that
  // path. Force the attribute, set textContent, and fire input/change events
  // so Medium's framework picks up the value.
  await urlInput.evaluate((el, url) => {
    el.setAttribute('contenteditable', 'true');
    el.focus();
    el.textContent = url;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, sourceUrl);

  const entered = (await urlInput.textContent().catch(() => '')) || '';
  console.log(`    field text after fill: "${entered.slice(0, 120)}"`);
  if (!entered.includes(sourceUrl)) {
    throw new Error('Could not populate the import URL field.');
  }

  // Import button is unambiguous — it has data-action="import-url".
  const importBtn = page.locator('button[data-action="import-url"]').first();
  const visible = await importBtn.isVisible({ timeout: 5000 }).catch(() => false);
  if (!visible) {
    await dumpDebug(page, `import-button-${post.slug}`);
    throw new Error('Import button (data-action="import-url") not found.');
  }
  await importBtn.click();

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

const { browser, context } = await launchBrowser();
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
      if (/Cloudflare bot challenge/.test(err.message)) {
        console.error('  → Cloudflare flagged this session; remaining posts will hit the same wall. Stopping batch.');
        break;
      }
    }
    // Wide gap between imports to give Cloudflare time to forget us between
    // requests. Medium fires the bot challenge on rapid successive imports.
    if (i < due.length - 1) await sleep(45000);
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
