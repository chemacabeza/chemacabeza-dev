#!/usr/bin/env node
// Publish a single Medium post by attaching to a running Chrome via the
// Chrome DevTools Protocol and driving Import → Publish step-by-step.
// Unlike the xdg-open + Tampermonkey path, every action here is observed
// and acknowledged — we know exactly which step failed if anything does,
// and the tab is explicitly brought to front so Chrome's background-tab
// throttling can't stall the chain.
//
// Required env / args:
//   argv[2]   slug to publish (e.g. "how-system-design-fails")
//   CDP_URL   optional; defaults to http://127.0.0.1:9222
//   MEDIUM_SITE_URL  optional; defaults to https://chemacabeza.dev
//
// Stdout: the published article URL (when successful).
// Stderr: progress / failure diagnostics.
// Exit codes:
//   0 — published successfully (URL on stdout)
//   1 — connected but the publish chain failed
//   2 — couldn't connect to CDP at all
import { chromium } from 'playwright';

const slug = process.argv[2];
if (!slug) {
  console.error('usage: node cdp-publish.mjs <slug>');
  process.exit(2);
}

const SITE = process.env.MEDIUM_SITE_URL || 'https://chemacabeza.dev';
const CDP_URL = process.env.CDP_URL || 'http://127.0.0.1:9222';
const SOURCE = `${SITE}/writing/${slug}`;
const IMPORT_URL = `https://medium.com/p/import?url=${encodeURIComponent(SOURCE)}`;
// When set, publish this EXISTING draft (open its editor) instead of importing
// — avoids creating duplicate drafts when a prior publish was rate-limited.
const DRAFT_ID = process.env.MEDIUM_DRAFT_ID || '';
const EDIT_URL = (id) => `https://medium.com/p/${id}/edit`;

const log = (...a) => console.error('[cdp]', ...a);

let browser;
try {
  log(`connecting to CDP at ${CDP_URL}`);
  browser = await chromium.connectOverCDP(CDP_URL);
} catch (err) {
  console.error(`CDP connect failed: ${err.message}`);
  process.exit(2);
}

const context = browser.contexts()[0];
if (!context) {
  console.error('no browser context found on CDP endpoint');
  process.exit(2);
}

const COOKIE_JAR = process.env.MEDIUM_COOKIE_JAR || '';
if (COOKIE_JAR) {
  log(`injecting ${COOKIE_JAR.length} chars of cookies from MEDIUM_COOKIE_JAR`);
  const cookies = COOKIE_JAR.split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const eq = s.indexOf('=');
      if (eq < 0) return null;
      return {
        name: s.slice(0, eq).trim(),
        value: s.slice(eq + 1).trim(),
        domain: '.medium.com',
        path: '/',
        secure: true,
        sameSite: 'Lax',
      };
    })
    .filter(Boolean);
  await context.addCookies(cookies);
}

const page = await context.newPage();

async function shot(tag) {
  try {
    const path = `/tmp/cdp-publish-${tag}-${slug}-${Date.now()}.png`;
    await page.screenshot({ path, fullPage: true });
    log(`screenshot: ${path}`);
  } catch {}
}

// Medium caps publishing at 2 stories per 24h. When exceeded it manifests two
// ways: (1) a transient red banner toast, and (2) the Publish button rendered
// disabled (data-action="show-disabled-button-info") whose tooltip explains
// why. Detect both so we back off (exit 4) rather than mistake a blocked
// publish for success.
const RATE_RE = /two stories in the past 24 hours|publish or schedule again in 24 hours/i;
async function rateLimited() {
  try {
    // (1) transient toast banner
    const body = await page.evaluate(() => document.body?.innerText || '');
    if (RATE_RE.test(body)) return true;
    // (2) disabled Publish button — hover to reveal the reason tooltip
    const disabled = page.locator('button[data-action="show-disabled-button-info"]').first();
    if (await disabled.isVisible({ timeout: 500 }).catch(() => false)) {
      await disabled.hover().catch(() => {});
      await page.waitForTimeout(800);
      const withTip = await page.evaluate(() => document.body?.innerText || '');
      if (RATE_RE.test(withTip)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

try {
  if (DRAFT_ID) {
    log(`opening existing draft ${DRAFT_ID} (no re-import)`);
    await page.goto(EDIT_URL(DRAFT_ID), { waitUntil: 'load', timeout: 60000 });
  } else {
    log(`navigating to ${IMPORT_URL}`);
    await page.goto(IMPORT_URL, { waitUntil: 'load', timeout: 60000 });
  }
  await page.bringToFront();

  // Health check (Fix 3): if Medium bounced us to a sign-in / login page,
  // the logged-in session cookies have expired. Fail fast with a distinct
  // exit code (3) and a loud, actionable message instead of silently timing
  // out 30s on .js-importUrl every slot. The cron wrapper turns code 3 into
  // a prominent "auto-publish paused" warning.
  const landedPath = new URL(page.url()).pathname;
  if (/(^|\/)(m\/)?(signin|login)(\/|$)/.test(landedPath)) {
    log('MEDIUM SESSION EXPIRED — import page redirected to sign-in:');
    log(`  ${page.url()}`);
    log('  FIX: open Chrome, log into medium.com, then the next run re-syncs cookies.');
    await shot('session-expired');
    process.exit(3);
  }

  if (!DRAFT_ID) {
    log('waiting for .js-importUrl field');
    await page.waitForSelector('.js-importUrl', { state: 'attached', timeout: 30000 });

    // Let Medium's framework JS init the contenteditable. If it doesn't,
    // force it ourselves and keep going.
    await page
      .waitForFunction(
        () => {
          const el = document.querySelector('.js-importUrl');
          return el && el.hasAttribute('contenteditable');
        },
        { timeout: 10000 },
      )
      .catch(() => log('contenteditable not auto-set; forcing'));

    await page.evaluate(() => {
      const el = document.querySelector('.js-importUrl');
      el.setAttribute('contenteditable', 'true');
      el.focus();
    });

    log(`typing source URL: ${SOURCE}`);
    await page.keyboard.type(SOURCE, { delay: 25 });
    await page.waitForTimeout(1500);

    // Click Import. Wait for it to be visible AND enabled.
    log('waiting for enabled Import button');
    const importBtn = page.locator('button[data-action="import-url"]:not([disabled])').first();
    await importBtn.waitFor({ state: 'visible', timeout: 10000 });
    await importBtn.click();
    log('clicked Import — waiting for redirect to /p/<id>/edit');

    await page.waitForURL(/\/p\/[^/]+\/edit/, { timeout: 90000 });
  }
  log(`reached edit page: ${page.url()}`);
  // Emit the post id so the caller can persist it — if publishing then fails
  // (e.g. rate limit), the next run reuses this draft instead of re-importing.
  const _idMatch = page.url().match(/\/p\/([a-f0-9]+)/);
  if (_idMatch) log(`MEDIUM_DRAFT_ID=${_idMatch[1]}`);

  // Editor needs time to load its toolbar
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(3000);

  // Medium sometimes shows an onboarding/tooltip overlay
  // (`<div class="overlay" data-action-scope="...">`) that intercepts
  // clicks on the Publish button. Dismiss it: try Escape first, then
  // remove ONLY elements with class "overlay" (NOT the toolbar, which
  // is also position:fixed). The previous aggressive cleanup removed
  // the publish toolbar itself.
  log('dismissing any onboarding/tooltip overlays');
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(400);
  await page
    .evaluate(() => {
      // Target very specifically: only divs with class CONTAINING "overlay"
      // AND a data-action-scope attribute (the tooltip pattern). The toolbar
      // and other UI bits don't match this combination.
      const overlays = document.querySelectorAll('div.overlay[data-action-scope]');
      let removed = 0;
      for (const el of overlays) {
        el.remove();
        removed++;
      }
      return removed;
    })
    .then((n) => log(`removed ${n} overlay element(s)`))
    .catch(() => {});

  // Wait for the editor's "Saving..." → "Publish" state transition.
  // The toolbar Publish button (data-action="show-prepublish") shows
  // "Saving..." while Medium is persisting the imported draft; clicking
  // it during that state silently no-ops and we end up with no dialog.
  log('waiting for editor save to settle');
  await page
    .waitForFunction(
      () => {
        const btn = document.querySelector('button[data-action="show-prepublish"]');
        if (!btn) return false;
        const t = (btn.innerText || '').trim();
        return t !== 'Saving...' && t !== '' && !btn.disabled;
      },
      { timeout: 30000 },
    )
    .catch(() => log('save state never cleared in 30s; trying anyway'));

  // Open prepublish dialog
  log('opening prepublish dialog');
  const publishCandidates = [
    'button[data-action="show-prepublish"]',
    'button[aria-label="Publish"]',
  ];
  let opened = false;
  for (const sel of publishCandidates) {
    const loc = page.locator(sel).first();
    if (await loc.isVisible({ timeout: 1500 }).catch(() => false)) {
      await loc.click();
      opened = true;
      log(`clicked Publish via ${sel}`);
      break;
    }
  }
  if (!opened) {
    // Last-resort role/name match
    const byRole = page.getByRole('button', { name: /^publish$/i }).first();
    if (await byRole.isVisible({ timeout: 2000 }).catch(() => false)) {
      await byRole.click();
      opened = true;
      log('clicked Publish via role match');
    }
  }
  if (!opened) {
    await shot('publish-missing');
    throw new Error('Publish button not found on the editor');
  }

  // Wait for the prepublish dialog and the "Publish" button. The dialog
  // can take a beat to mount its React tree; React's StrictMode-like
  // double-render also briefly destroys the JS execution context, so
  // any page.evaluate fired too early throws "context destroyed".
  await page.waitForTimeout(5000);
  log('looking for the dialog Publish button');

  // Diagnostic: log all buttons currently on the page so we can adjust
  // selectors if Medium has changed names. Non-fatal — if the inventory
  // throws on a transient navigation, we just press on with the selectors.
  try {
    const buttonInventory = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button'))
        .map((b) => ({
          text: (b.innerText || '').trim().slice(0, 50),
          action: b.getAttribute('data-action') || '',
          testid: b.getAttribute('data-testid') || '',
          visible: b.offsetParent !== null,
        }))
        .filter((b) => b.text || b.action || b.testid)
        .slice(0, 40),
    );
    log(`button inventory (${buttonInventory.length}):`);
    for (const b of buttonInventory) {
      log(`    "${b.text}" data-action=${b.action} testid=${b.testid} vis=${b.visible}`);
    }
  } catch (e) {
    log(`inventory dump skipped: ${e.message.split('\n')[0]}`);
  }
  // Settle once more before clicking
  await page.waitForTimeout(1500);

  // The new Medium prepublish dialog has the button labelled exactly
  // "Publish" (not "Publish now"). Confirmed via button inventory:
  // ["Change preview image", "Submit", "Publish", "Schedule for later"].
  // The toolbar Publish that opened the dialog is no longer in the
  // tab order while the modal is open, so the role+exact-name match
  // is unambiguous.
  let finalized = false;
  const byRoleExact = page.getByRole('button', { name: 'Publish', exact: true }).last();
  if (await byRoleExact.isVisible({ timeout: 4000 }).catch(() => false)) {
    await byRoleExact.click({ timeout: 5000 });
    finalized = true;
    log('clicked dialog Publish via role+exact name');
  }
  if (!finalized) {
    // Fallback to text-based locator
    const byText = page.locator('div[role="dialog"] button:has-text("Publish")').first();
    if (await byText.isVisible({ timeout: 2000 }).catch(() => false)) {
      await byText.click({ timeout: 5000 });
      finalized = true;
      log('clicked dialog Publish via text in dialog');
    }
  }
  if (!finalized) {
    // Final fallback: any visible button whose text is exactly "Publish"
    const handle = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(
        (b) => (b.innerText || '').trim() === 'Publish' && b.offsetParent !== null && !b.disabled,
      );
    });
    if (handle) {
      const found = await handle.evaluate((el) => !!el);
      if (found) {
        await handle.asElement()?.click();
        finalized = true;
        log('clicked dialog Publish via JS scan');
      }
    }
  }
  if (!finalized) {
    await shot('publish-now-missing');
    throw new Error('Publish button (in prepublish dialog) not found');
  }

  // Fast rate-limit check: Medium's "2 stories / 24h" banner appears within a
  // second or two of clicking Publish. Catch it before the long URL wait.
  await page.waitForTimeout(2500);
  if (await rateLimited()) {
    log('RATE LIMITED — Medium 2-stories/24h cap hit; post left as draft, retry next slot.');
    await shot('rate-limited');
    process.exit(4);
  }

  // A successful publish lands on either the canonical /@user/slug-id URL OR
  // /p/<id>?postPublishedType=... (Medium's immediate post-publish confirmation,
  // which doesn't always redirect to the slug within our wait). Accept either —
  // but ONLY these signals, so a still-draft never counts as published.
  log('waiting for publish confirmation (canonical URL or postPublishedType)');
  const confirmed = await page
    .waitForFunction(
      () => {
        const u = new URL(location.href);
        return (
          u.searchParams.has('postPublishedType') ||
          /^\/@[^/]+\/.+-[a-f0-9]{6,}$/.test(u.pathname)
        );
      },
      { timeout: 60000 },
    )
    .then(() => true)
    .catch(() => false);

  if (!confirmed) {
    if (await rateLimited()) {
      log('RATE LIMITED — Medium 2-stories/24h cap hit; post left as draft, retry next slot.');
      await shot('rate-limited');
      process.exit(4);
    }
    log(`FAILED: no publish confirmation (still ${page.url()}); left as draft.`);
    await shot('not-published');
    process.exit(1);
  }

  // Publish confirmed — resolve the canonical public URL (the post-publish URL
  // is /p/<id>?postPublishedType=...). Using /p/<id> is safe here because we
  // only reach this after a genuine publish signal, never for a draft.
  let publishedUrl = page.url();
  if (!/^\/@[^/]+\/.+-[a-f0-9]{6,}$/.test(new URL(publishedUrl).pathname)) {
    const idm = publishedUrl.match(/\/p\/([a-f0-9]+)/);
    const pid = idm ? idm[1] : DRAFT_ID;
    if (pid) {
      for (let i = 0; i < 3; i++) {
        await page.goto(`https://medium.com/p/${pid}`, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
        await page.waitForTimeout(2000);
        if (/^\/@[^/]+\/.+-[a-f0-9]{6,}$/.test(new URL(page.url()).pathname)) break;
      }
      publishedUrl = page.url();
    }
  }
  log(`published: ${publishedUrl}`);
  process.stdout.write(publishedUrl + '\n');
  process.exit(0);
} catch (err) {
  log(`FAILED: ${err.message}`);
  await shot('failure');
  process.exit(1);
} finally {
  // Navigate the tab to about:blank rather than closing it. Closing
  // the LAST tab makes Chrome exit, which kills CDP for the next run.
  try { await page.goto('about:blank', { timeout: 5000 }); } catch {}
}
