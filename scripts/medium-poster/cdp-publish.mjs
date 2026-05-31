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

const page = await context.newPage();

async function shot(tag) {
  try {
    const path = `/tmp/cdp-publish-${tag}-${slug}-${Date.now()}.png`;
    await page.screenshot({ path, fullPage: true });
    log(`screenshot: ${path}`);
  } catch {}
}

try {
  log(`navigating to ${IMPORT_URL}`);
  await page.goto(IMPORT_URL, { waitUntil: 'load', timeout: 60000 });
  await page.bringToFront();

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
  log(`reached edit page: ${page.url()}`);

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

  // Wait for the prepublish dialog and the "Publish now" button. The
  // dialog can take a beat to mount its React tree, especially in a
  // headed-offscreen Chrome where rendering is slightly throttled.
  await page.waitForTimeout(5000);
  log('looking for "Publish now" button');

  // Diagnostic: log all buttons currently on the page so we can adjust
  // selectors if Medium has changed names.
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

  let finalized = false;
  const publishNowCandidates = [
    'button[data-action="publish"]',
    'button[data-testid="publishConfirmButton"]',
    'button[data-action="publishConfirm"]',
    'button:has-text("Publish now")',
  ];
  for (const sel of publishNowCandidates) {
    const loc = page.locator(sel).first();
    if (await loc.isVisible({ timeout: 2000 }).catch(() => false)) {
      await loc.click({ timeout: 5000 }).catch((e) => log(`click failed on ${sel}: ${e.message.split('\n')[0]}`));
      finalized = true;
      log(`clicked Publish-now via ${sel}`);
      break;
    }
  }
  if (!finalized) {
    const byRole = page.getByRole('button', { name: /publish now/i }).first();
    if (await byRole.isVisible({ timeout: 3000 }).catch(() => false)) {
      await byRole.click();
      finalized = true;
      log('clicked Publish-now via role match');
    }
  }
  if (!finalized) {
    await shot('publish-now-missing');
    throw new Error('Publish-now button not found in prepublish dialog');
  }

  // Wait for redirect off /edit (means the article is now live)
  log('waiting for redirect off /edit');
  await page.waitForFunction(
    () => !location.pathname.includes('/edit'),
    { timeout: 45000 },
  );

  const publishedUrl = page.url();
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
