#!/usr/bin/env node
// Publish a single Substack post by attaching to a running Chrome via the
// Chrome DevTools Protocol and driving the editor step-by-step. Substack has
// no publishing API, so — like the Medium poster — we automate the real,
// logged-in editor.
//
// Content source: the site's export route (clean per-post HTML), e.g.
//   https://chemacabeza.dev/export/<slug>
// We set the title field and paste the article HTML into Substack's ProseMirror
// body via the real clipboard (the only reliable way to inject formatted HTML
// into ProseMirror under Chrome), then drive Continue → Publish.
//
// Args / env:
//   argv[2]            slug to publish (e.g. "how-system-design-fails")
//   SUBSTACK_PUB_URL   publication base, default https://chemacabeza.substack.com
//   SITE_URL           content source base, default https://chemacabeza.dev
//   CDP_URL            default http://127.0.0.1:9223
//   SUBSTACK_INSPECT=1 open the editor, dump selectors + screenshot, DON'T publish
//   SUBSTACK_DRY_RUN=1 fill title + body but STOP before publishing
//   SUBSTACK_NO_EMAIL=1 uncheck "send via email" so it only posts to web (no blast)
//
// Stdout: the published post URL (on success).
// Stderr: progress / failure diagnostics.
// Exit codes:
//   0 — success (URL on stdout), or inspect/dry-run completed
//   1 — connected but the flow failed
//   2 — couldn't connect to CDP
//   3 — Substack session expired (editor redirected to sign-in/login)
import { chromium } from 'playwright';

const slug = process.argv[2];
if (!slug) {
  console.error('usage: node cdp-publish.mjs <slug>');
  process.exit(2);
}

const PUB = (process.env.SUBSTACK_PUB_URL || 'https://chemacabeza.substack.com').replace(/\/$/, '');
const SITE = (process.env.SITE_URL || 'https://chemacabeza.dev').replace(/\/$/, '');
const CDP_URL = process.env.CDP_URL || 'http://127.0.0.1:9223';
const EXPORT_URL = `${SITE}/export/${slug}`;
const CANONICAL = `${SITE}/writing/${slug}`;
const DRAFT_ID = process.env.SUBSTACK_DRAFT_ID || '';
const NEW_POST_URL = DRAFT_ID
  ? `${PUB}/publish/post/${DRAFT_ID}`
  : `${PUB}/publish/post?type=newsletter`;
const INSPECT = process.env.SUBSTACK_INSPECT === '1';
const DRY_RUN = process.env.SUBSTACK_DRY_RUN === '1';
const NO_EMAIL = process.env.SUBSTACK_NO_EMAIL === '1';

const log = (...a) => console.error('[substack]', ...a);

// ---- fetch + parse the export HTML -----------------------------------------
function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fetchExport() {
  let lastErr;
  for (let i = 0; i < 4; i++) {
    try {
      const res = await fetch(EXPORT_URL, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(`export route ${res.status} for ${EXPORT_URL}`);
      return await res.text();
    } catch (e) {
      lastErr = e;
      log(`fetch attempt ${i + 1} failed (${e.message}); retrying`);
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw lastErr;
}

async function fetchContent() {
  const html = await fetchExport();
  const titleM = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleM ? decode(titleM[1].trim()) : slug;
  const descM = html.match(/<meta name="description" content="([\s\S]*?)"\s*\/?>/i);
  const subtitle = descM ? decode(descM[1].trim()) : '';
  // Body = everything inside <article> after the FIRST <hr/> (that hr separates
  // the title/desc/attribution preamble from the actual article body).
  const artM = html.match(/<article>([\s\S]*?)<\/article>/i);
  let body = artM ? artM[1] : html;
  const firstHr = body.search(/<hr\s*\/?>/i);
  if (firstHr !== -1) body = body.slice(firstHr).replace(/^<hr\s*\/?>/i, '');
  body = body.trim();
  // Append a canonical attribution footer.
  body += `\n<hr/>\n<p><em>Originally published at <a href="${CANONICAL}">${CANONICAL}</a>.</em></p>`;
  return { title, subtitle, body };
}

// ---- main ------------------------------------------------------------------
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
// Needed for navigator.clipboard.write (HTML paste into ProseMirror).
await context
  .grantPermissions(['clipboard-read', 'clipboard-write'], { origin: PUB })
  .catch((e) => log(`grantPermissions warning: ${e.message}`));

const page = await context.newPage();

async function shot(tag) {
  try {
    const path = `/tmp/substack-${tag}-${slug}-${Date.now()}.png`;
    await page.screenshot({ path, fullPage: true });
    log(`screenshot: ${path}`);
  } catch {}
}

async function dumpInventory(label) {
  try {
    const inv = await page.evaluate(() => {
      const textareas = Array.from(document.querySelectorAll('textarea, input[type="text"]')).map((t) => ({
        tag: t.tagName.toLowerCase(),
        placeholder: t.placeholder || '',
        name: t.getAttribute('name') || '',
        ariaLabel: t.getAttribute('aria-label') || '',
        visible: t.offsetParent !== null,
      }));
      const editables = Array.from(document.querySelectorAll('[contenteditable="true"]')).map((e) => ({
        cls: (e.className || '').toString().slice(0, 60),
        role: e.getAttribute('role') || '',
        aria: e.getAttribute('aria-label') || '',
        visible: e.offsetParent !== null,
      }));
      const buttons = Array.from(document.querySelectorAll('button, a[role="button"]'))
        .map((b) => ({
          text: (b.innerText || b.textContent || '').trim().slice(0, 40),
          aria: b.getAttribute('aria-label') || '',
          testid: b.getAttribute('data-testid') || '',
          cls: (b.className || '').toString().slice(0, 40),
          visible: b.offsetParent !== null,
        }))
        .filter((b) => b.text || b.aria || b.testid);
      return { url: location.href, textareas, editables, buttons };
    });
    log(`── inventory @ ${label} — url=${inv.url}`);
    log(`  textareas/inputs (${inv.textareas.length}):`);
    inv.textareas.forEach((t) =>
      log(`    <${t.tag}> placeholder="${t.placeholder}" name="${t.name}" aria="${t.ariaLabel}" vis=${t.visible}`),
    );
    log(`  contenteditables (${inv.editables.length}):`);
    inv.editables.forEach((e) => log(`    class="${e.cls}" role="${e.role}" aria="${e.aria}" vis=${e.visible}`));
    log(`  buttons (${inv.buttons.length}):`);
    inv.buttons.forEach((b) =>
      log(`    "${b.text}" aria="${b.aria}" testid="${b.testid}" cls="${b.cls}" vis=${b.visible}`),
    );
    return inv;
  } catch (e) {
    log(`inventory failed: ${e.message.split('\n')[0]}`);
    return null;
  }
}

async function setClipboardHtml(html, plain) {
  await page.evaluate(
    async ({ html, plain }) => {
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plain], { type: 'text/plain' }),
      });
      await navigator.clipboard.write([item]);
    },
    { html, plain },
  );
}

try {
  const { title, subtitle, body } = await fetchContent();
  log(`content ready — title="${title}" (${body.length} chars of body html)`);

  log(`opening editor ${NEW_POST_URL}`);
  await page.goto(NEW_POST_URL, { waitUntil: 'load', timeout: 60000 });
  await page.bringToFront();

  // Session health check.
  const landed = new URL(page.url());
  if (/sign-?in|\/login|\/account\/login/.test(landed.pathname) || landed.hostname === 'substack.com') {
    log(`SUBSTACK SESSION redirect → ${page.url()}`);
    log('  FIX: log into substack.com in Chrome, then re-run (cookies re-sync).');
    await shot('session');
    process.exit(3);
  }

  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2500);

  if (INSPECT) {
    await dumpInventory('editor-loaded');
    await shot('inspect');
    log('INSPECT mode — not publishing. Done.');
    process.exit(0);
  }

  // ---- Title -----------------------------------------------------------
  // The main post title is `textarea[placeholder="Title"]` (aria-label="title").
  // The `input[placeholder="Add a title..."]` seen in the inventory is the
  // audio/voiceover file-sidebar rename input (offscreen) — a decoy.
  log('filling title');
  const titleSelectors = [
    'textarea[aria-label="title"]',
    'textarea[placeholder="Title"]',
  ];
  let titleSet = false;
  for (const sel of titleSelectors) {
    const loc = page.locator(sel).first();
    if (await loc.isVisible({ timeout: 1500 }).catch(() => false)) {
      await loc.click();
      await loc.fill('').catch(() => {});
      await page.keyboard.type(title, { delay: 8 });
      titleSet = true;
      log(`  title set via ${sel}`);
      break;
    }
  }
  if (!titleSet) {
    await dumpInventory('title-not-found');
    await shot('title-missing');
    throw new Error('title field not found');
  }

  // ---- Subtitle (best effort) -----------------------------------------
  if (subtitle) {
    const subSelectors = [
      'textarea[placeholder="Add a subtitle…"]',
      'textarea[placeholder*="ubtitle"]',
      'textarea[placeholder*="ubhead"]',
    ];
    for (const sel of subSelectors) {
      const loc = page.locator(sel).first();
      if (await loc.isVisible({ timeout: 1000 }).catch(() => false)) {
        await loc.click();
        await page.keyboard.type(subtitle, { delay: 6 });
        log(`  subtitle set via ${sel}`);
        break;
      }
    }
  }

  // ---- Body: paste HTML into ProseMirror ------------------------------
  // Two ProseMirror instances exist; the article body is the `.mousetrap` one.
  log('locating body editor (ProseMirror)');
  const editorSel = 'div.ProseMirror.mousetrap';
  const editor = page.locator(editorSel).first();
  if (!(await editor.isVisible({ timeout: 5000 }).catch(() => false))) {
    await dumpInventory('editor-not-found');
    await shot('editor-missing');
    throw new Error('ProseMirror body editor not found');
  }
  await editor.click();
  await page.waitForTimeout(300);
  // Clear any pre-existing body content (when re-using a draft).
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.waitForTimeout(200);
  // Paste the article HTML.
  log('writing HTML to clipboard and pasting');
  await setClipboardHtml(body, '');
  await page.waitForTimeout(200);
  await page.keyboard.press('Control+V');
  await page.waitForTimeout(2500);

  // Verify body actually populated.
  const bodyText = await editor.innerText().catch(() => '');
  if (bodyText.trim().length < 40) {
    log(`paste looked empty (got ${bodyText.length} chars); retrying via execCommand insertHTML`);
    await editor.click();
    await page.evaluate(
      ({ sel, html }) => {
        const ed = document.querySelector(sel);
        ed.focus();
        document.execCommand('insertHTML', false, html);
      },
      { sel: editorSel, html: body },
    );
    await page.waitForTimeout(2000);
  }
  const bodyText2 = await editor.innerText().catch(() => '');
  log(`body now ~${bodyText2.length} chars`);
  if (bodyText2.trim().length < 40) {
    await shot('body-empty');
    throw new Error('body editor stayed empty after paste + fallback');
  }

  // Let Substack autosave the draft.
  await page.waitForTimeout(3500);

  // ---- Continue → Publish ---------------------------------------------
  log('clicking Continue to open send settings');
  const continueCandidates = [
    'button[data-testid="publish-button"]',
    'button:has-text("Continue")',
    'button[aria-label="Continue"]',
  ];
  let advanced = false;
  for (const sel of continueCandidates) {
    const loc = page.locator(sel).first();
    if (await loc.isVisible({ timeout: 1500 }).catch(() => false)) {
      await loc.click();
      advanced = true;
      log(`  advanced via ${sel}`);
      break;
    }
  }
  if (!advanced) {
    await dumpInventory('continue-not-found');
    await shot('continue-missing');
    throw new Error('Continue/Publish button not found in editor');
  }

  // Send-settings screen loads.
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await dumpInventory('send-settings');

  if (DRY_RUN) {
    await shot('dryrun-send-settings');
    log('DRY_RUN mode — reached send settings but NOT publishing. Done.');
    process.exit(0);
  }

  // Optionally disable the email blast (web-only publish).
  if (NO_EMAIL) {
    const emailToggle = page
      .locator('input[type="checkbox"]')
      .filter({ hasNot: page.locator('[disabled]') })
      .first();
    // best-effort; many Substack layouts use a labelled checkbox
    const cb = page.getByText(/Send to everyone|Email to|Send via email/i).first();
    if (await cb.isVisible({ timeout: 1500 }).catch(() => false)) {
      log('NO_EMAIL set — attempting to disable email send (best effort)');
      await emailToggle.uncheck().catch(() => {});
    }
  }

  // Final publish button on the send screen.
  log('clicking final Send/Publish');
  const finalCandidates = [
    'button:has-text("Send to everyone now")',
    'button:has-text("Publish now")',
    'button:has-text("Send now")',
    'button:has-text("Publish")',
    'button:has-text("Send")',
  ];
  let clickedFinal = false;
  for (const sel of finalCandidates) {
    const loc = page.locator(sel).first();
    if (await loc.isVisible({ timeout: 2000 }).catch(() => false)) {
      await loc.click();
      clickedFinal = true;
      log(`  clicked final via ${sel}`);
      break;
    }
  }
  if (!clickedFinal) {
    await dumpInventory('final-not-found');
    await shot('final-missing');
    throw new Error('final Send/Publish button not found');
  }

  // Substack interstitial: "Add subscribe buttons to your post" →
  // ["Add subscribe buttons", "Publish without buttons"]. We don't want to
  // inject subscribe buttons into the body, so click "Publish without buttons".
  // This is the click that ACTUALLY publishes.
  await page.waitForTimeout(1800);
  const withoutButtons = page.locator('button:has-text("Publish without buttons")').first();
  if (await withoutButtons.isVisible({ timeout: 4000 }).catch(() => false)) {
    await withoutButtons.click();
    log('  clicked "Publish without buttons"');
  } else {
    // Some accounts/flows skip the interstitial; a generic dialog confirm may
    // still appear. Try it, but don't treat absence as fatal.
    const confirmModal = page
      .locator('div[role="dialog"] button:has-text("Publish"), div[role="dialog"] button:has-text("Send")')
      .first();
    if (await confirmModal.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmModal.click().catch(() => {});
      log('  confirmed publish in generic dialog');
    } else {
      log('  no interstitial/dialog seen; assuming direct publish');
    }
  }

  // ---- confirm success -------------------------------------------------
  // Only a genuine signal counts: a link to the public post (/p/<slug>, not the
  // /p/coming-soon placeholder) OR the URL itself landing on /p/<slug>. We do
  // NOT match page text — "Publish" appears in buttons even on a still-draft.
  log('waiting for publish confirmation (public /p/<slug> link)');
  const publishedUrl = await page
    .waitForFunction(
      () => {
        const fromUrl = location.href.match(/https?:\/\/[^/]+\/p\/[a-z0-9-]+/i);
        if (fromUrl && !/\/p\/coming-soon\b/.test(fromUrl[0])) return fromUrl[0];
        const a = Array.from(document.querySelectorAll('a[href*="/p/"]')).find(
          (x) => /\/p\/[a-z0-9-]+/i.test(x.href) && !/\/p\/coming-soon\b/.test(x.href),
        );
        return a ? a.href.split('?')[0] : false;
      },
      { timeout: 60000 },
    )
    .then((h) => h.jsonValue())
    .catch(() => null);

  if (!publishedUrl) {
    await dumpInventory('no-confirm');
    await shot('no-confirm');
    log('FAILED: no public /p/ link appeared — post likely NOT published');
    process.exit(1);
  }

  log(`published: ${publishedUrl}`);
  await shot('published');
  process.stdout.write(publishedUrl + '\n');
  process.exit(0);
} catch (err) {
  log(`FAILED: ${err.message}`);
  await shot('failure');
  process.exit(1);
} finally {
  try {
    await page.goto('about:blank', { timeout: 5000 });
  } catch {}
}
