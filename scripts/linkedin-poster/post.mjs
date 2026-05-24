#!/usr/bin/env node
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const HERE = dirname(fileURLToPath(import.meta.url));
const POSTS_FILE = join(HERE, 'posts.json');
const PROFILE_DIR = join(HERE, '.profile');

// LinkedIn account this script is allowed to post from.
// If the logged-in session resolves to a different vanity URL, the script aborts.
const EXPECTED_PROFILE_URL = 'https://www.linkedin.com/in/jcabeza/';
const EXPECTED_VANITY = 'jcabeza';

const rl = createInterface({ input: stdin, output: stdout });
const ask = (q) => rl.question(q);

function loadPosts() {
  return JSON.parse(readFileSync(POSTS_FILE, 'utf8'));
}

function savePosts(posts) {
  writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2) + '\n');
}

async function ensureLoggedIn(page) {
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
  const startPostBtn = page.locator(
    'button:has-text("Start a post"), button[aria-label*="Start a post"], button:has-text("Empezar publicación")'
  ).first();
  const visible = await startPostBtn.isVisible({ timeout: 6000 }).catch(() => false);
  if (!visible) {
    console.log('\n→ Not logged in. Please sign in to LinkedIn in the open browser window.');
    console.log(`  Expected account: ${EXPECTED_PROFILE_URL}`);
    console.log('  (Your session will be saved to .profile/ so you only do this once.)');
    await ask('  Press Enter once you see your LinkedIn feed... ');
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
  }

  await verifyAccount(page);
}

async function verifyAccount(page) {
  // Resolve the logged-in user. /in/me/ is supposed to redirect to the actual vanity URL,
  // but the redirect is JS-driven and sometimes never fires for the persistent-context session.
  // Strategy: try a few signals in order, take the first one that works.

  let resolvedVanity = null;

  // Strategy 1: look at the top nav "Me" link href — most reliable.
  try {
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
    const meLink = page.locator(
      'a.global-nav__me-photo, a[data-test-global-nav-link="me"], header a[href*="/in/"]'
    ).first();
    if (await meLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      const href = await meLink.getAttribute('href');
      const m = href && href.match(/\/in\/([^/?#]+)/);
      if (m) resolvedVanity = m[1];
    }
  } catch {}

  // Strategy 2: parse the profile menu — opens a panel whose links include the vanity URL.
  if (!resolvedVanity) {
    try {
      const meBtn = page.locator('button:has-text("Me"), button[aria-label*="Me"]').first();
      if (await meBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await meBtn.click();
        const profileLink = page.locator('a[href*="/in/"]:has-text("View Profile"), a[href*="/in/"]:has-text("Ver perfil")').first();
        const href = await profileLink.getAttribute('href', { timeout: 3000 });
        const m = href && href.match(/\/in\/([^/?#]+)/);
        if (m) resolvedVanity = m[1];
        await page.keyboard.press('Escape').catch(() => {});
      }
    } catch {}
  }

  // Strategy 3: visit /in/me/ and wait for the client-side redirect to settle.
  if (!resolvedVanity) {
    try {
      await page.goto('https://www.linkedin.com/in/me/', { waitUntil: 'domcontentloaded' });
      await page.waitForURL((url) => !url.toString().includes('/in/me'), { timeout: 12000 });
      const m = page.url().match(/\/in\/([^/?#]+)/);
      if (m && m[1] !== 'me') resolvedVanity = m[1];
    } catch {}
  }

  console.log(`  → Logged-in vanity resolves to: ${resolvedVanity ?? '(unresolved)'}`);

  if (resolvedVanity !== EXPECTED_VANITY) {
    console.error(`\n✗ ABORT: expected /in/${EXPECTED_VANITY}/ but got /in/${resolvedVanity ?? 'unresolved'}/`);
    console.error('  Either you are logged into a different LinkedIn account, or LinkedIn changed its UI.');
    console.error('  If this is the wrong account: log out in the browser, rerun the script, log in as jcabeza.');
    console.error('  If LinkedIn changed UI: update EXPECTED_VANITY or the selectors in verifyAccount().');
    throw new Error('Account verification failed.');
  }
  console.log(`  ✓ Account verified (${EXPECTED_VANITY}).`);
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
}

async function dumpDiagnostics(page, tag) {
  const ts = Date.now();
  const shotPath = join(HERE, `debug-${tag}-${ts}.png`);
  const htmlPath = join(HERE, `debug-${tag}-${ts}.html`);
  await page.screenshot({ path: shotPath, fullPage: true }).catch(() => {});
  const html = await page.content().catch(() => '');
  writeFileSync(htmlPath, html);

  const labels = await page
    .evaluate(() => {
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };
      const nodes = Array.from(
        document.querySelectorAll('button[aria-label], [role="button"][aria-label], [role="textbox"], [contenteditable="true"]')
      );
      return nodes
        .filter(visible)
        .slice(0, 40)
        .map((el) => ({
          tag: el.tagName.toLowerCase(),
          role: el.getAttribute('role') || '',
          label: el.getAttribute('aria-label') || '',
          editable: el.getAttribute('contenteditable') || '',
          textHead: (el.textContent || '').trim().slice(0, 80),
        }));
    })
    .catch(() => []);

  console.error(`\n  Screenshot:  ${shotPath}`);
  console.error(`  Full HTML:   ${htmlPath}`);
  console.error('  Visible button/textbox/contenteditable elements (first 40):');
  for (const l of labels) {
    console.error(`    <${l.tag} role=${l.role} contenteditable=${l.editable} aria-label="${l.label}"> "${l.textHead}"`);
  }
}

async function tryClickTrigger(page) {
  const candidates = [
    () => page.getByRole('button', { name: /start a post/i }).first(),
    () => page.getByRole('button', { name: /empezar.*publicación/i }).first(),
    () => page.getByRole('button', { name: /crear.*publicación/i }).first(),
    () => page.getByRole('button', { name: /publicar/i }).first(),
    () => page.locator('button[aria-label*="Start a post" i]').first(),
    () => page.locator('button[aria-label*="publicación" i]').first(),
    () => page.locator('[role="button"][aria-label*="post" i]').first(),
    () => page.locator('button').filter({ hasText: /Start a post/i }).first(),
    () => page.locator('[role="button"]').filter({ hasText: /Start a post|Empezar|Crear.*publicación/i }).first(),
  ];

  for (let i = 0; i < candidates.length; i++) {
    try {
      const loc = candidates[i]();
      if (await loc.isVisible({ timeout: 1500 }).catch(() => false)) {
        await loc.click({ timeout: 5000 });
        console.log(`  → trigger clicked (candidate #${i + 1})`);
        return true;
      }
    } catch {
      /* try next */
    }
  }
  return false;
}

async function findEditor(page) {
  // Wait for any composer dialog/modal to appear first.
  const dialog = page.locator('[role="dialog"], [aria-modal="true"]').first();
  await dialog.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});

  const editorSelectors = [
    'div[role="textbox"][contenteditable="true"]',
    'div[contenteditable="true"][aria-label*="editor" i]',
    'div[contenteditable="true"][aria-label*="text" i]',
    'div[contenteditable="true"][aria-label*="post" i]',
    'div.ql-editor[contenteditable="true"]',
    '[role="dialog"] [contenteditable="true"]',
    '[aria-modal="true"] [contenteditable="true"]',
    '[contenteditable="true"]',
  ];

  for (const sel of editorSelectors) {
    const ed = page.locator(sel).first();
    if (await ed.isVisible({ timeout: 2500 }).catch(() => false)) {
      await ed.click();
      console.log(`  → editor located via: ${sel}`);
      return ed;
    }
  }
  return null;
}

async function openComposer(page) {
  if (!page.url().includes('linkedin.com/feed')) {
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
  }
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});

  // Attempt 1: click an in-feed trigger button.
  let clicked = await tryClickTrigger(page);

  // Attempt 2: shareActive URL fallback.
  if (!clicked) {
    console.log('  → trigger button not found; trying shareActive URL fallback');
    await page.goto('https://www.linkedin.com/feed/?shareActive=true&mini=true', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  }

  const editor = await findEditor(page);
  if (editor) return editor;

  // Attempt 3: keyboard shortcut. LinkedIn historically supports "n" for new post on the feed.
  console.log('  → editor not found yet; trying keyboard shortcut "n"');
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.keyboard.press('n').catch(() => {});
  const editor2 = await findEditor(page);
  if (editor2) return editor2;

  console.error('\n  ✗ Could not open the LinkedIn composer.');
  await dumpDiagnostics(page, 'composer');
  throw new Error('Composer editor not found.');
}

async function typePost(page, editor, body) {
  // Type with newlines preserved — keyboard.type handles \n as Enter in contenteditable.
  await editor.focus();
  await page.keyboard.type(body, { delay: 5 });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findPostButton(page) {
  const candidates = [
    () => page.getByRole('button', { name: /^post$/i }).first(),
    () => page.getByRole('button', { name: /^publicar$/i }).first(),
    () => page.locator('[role="dialog"] button:has-text("Post")').last(),
    () => page.locator('[role="dialog"] button:has-text("Publicar")').last(),
    () => page.locator('[aria-modal="true"] button:has-text("Post")').last(),
    () => page.locator('button[aria-label="Post" i]').first(),
    () => page.locator('button[aria-label="Publicar" i]').first(),
  ];
  for (let i = 0; i < candidates.length; i++) {
    try {
      const loc = candidates[i]();
      if (await loc.isVisible({ timeout: 1500 }).catch(() => false)) {
        // Make sure it's enabled (LinkedIn disables Post until you type something).
        const disabled = await loc.getAttribute('disabled').catch(() => null);
        const ariaDisabled = await loc.getAttribute('aria-disabled').catch(() => null);
        if (disabled === null && ariaDisabled !== 'true') {
          console.log(`  → Post button found (candidate #${i + 1})`);
          return loc;
        }
      }
    } catch {}
  }
  return null;
}

async function verifyEditorContent(editor, expected) {
  const actual = (await editor.textContent().catch(() => '')) || '';
  // Normalize whitespace for comparison.
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const actualN = norm(actual);
  const expectedN = norm(expected);
  // Require ≥85% of expected length present, plus the URL.
  const lengthOk = actualN.length >= expectedN.length * 0.85;
  const urlMatch = expected.match(/https:\/\/[^\s]+/);
  const urlOk = !urlMatch || actualN.includes(urlMatch[0]);
  return { ok: lengthOk && urlOk, actualLen: actualN.length, expectedLen: expectedN.length, urlOk };
}

async function waitForPostComplete(page, timeoutMs = 30000) {
  // After publishing, LinkedIn closes the dialog. Wait for that.
  const dialog = page.locator('[role="dialog"], [aria-modal="true"]').first();
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const stillThere = await dialog.isVisible({ timeout: 500 }).catch(() => false);
    if (!stillThere) return true;
    await sleep(500);
  }
  return false;
}

async function autoPublishOne(page, post) {
  if (!page.url().includes('linkedin.com/feed')) {
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
  }

  const editor = await openComposer(page);
  await typePost(page, editor, post.body);

  console.log('  → typed; waiting 6s for link preview card to render...');
  await page.waitForTimeout(6000);

  const check = await verifyEditorContent(editor, post.body);
  if (!check.ok) {
    console.error(`  ✗ editor content check failed (actual=${check.actualLen} expected=${check.expectedLen} urlOk=${check.urlOk}). Aborting this post.`);
    // Try to close composer cleanly.
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(500);
    return false;
  }

  const postBtn = await findPostButton(page);
  if (!postBtn) {
    console.error('  ✗ Post button not found or still disabled. Skipping.');
    await dumpDiagnostics(page, 'post-button');
    await page.keyboard.press('Escape').catch(() => {});
    return false;
  }

  console.log('  → clicking Post...');
  await postBtn.click();

  const done = await waitForPostComplete(page);
  if (!done) {
    console.error('  ✗ Composer dialog did not close within 30s — uncertain if posted. NOT marking as done.');
    return false;
  }

  console.log(`  ✓ Published.`);
  return true;
}

async function run() {
  const autoMode = process.argv.includes('--auto') || process.env.LINKEDIN_AUTO === '1';
  const minDelaySec = parseInt(process.env.LINKEDIN_MIN_DELAY ?? '60', 10);
  const maxDelaySec = parseInt(process.env.LINKEDIN_MAX_DELAY ?? '180', 10);
  const maxConsecFailures = 2;

  const posts = loadPosts();
  const remaining = posts.filter((p) => !p.posted);

  console.log(`\nLinkedIn poster — ${remaining.length}/${posts.length} posts remaining.`);
  console.log(`Mode: ${autoMode ? 'AUTO (no manual confirmation)' : 'INTERACTIVE'}\n`);
  if (remaining.length === 0) {
    console.log('All posts already published. Edit posts.json to reset.');
    rl.close();
    return;
  }

  if (autoMode) {
    console.log(`⚠  AUTO MODE will click "Post" without asking.`);
    console.log(`   Inter-post delay: random ${minDelaySec}-${maxDelaySec}s.`);
    console.log(`   Aborts after ${maxConsecFailures} consecutive failures.`);
    console.log(`   You have 5 seconds to Ctrl+C if you don't want this.\n`);
    await sleep(5000);
  }

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const page = context.pages()[0] ?? (await context.newPage());

  try {
    await ensureLoggedIn(page);

    let consecFailures = 0;

    for (let i = 0; i < remaining.length; i++) {
      const post = remaining[i];
      console.log('\n────────────────────────────────────────');
      console.log(`[${i + 1}/${remaining.length}] ${post.slug}`);
      console.log('────────────────────────────────────────');
      console.log(post.body.split('\n').slice(0, 2).join('\n') + '\n  …');

      let published = false;

      if (autoMode) {
        try {
          published = await autoPublishOne(page, post);
        } catch (err) {
          console.error(`  ✗ Error while auto-publishing: ${err.message}`);
          await dumpDiagnostics(page, `auto-error-${post.slug}`).catch(() => {});
        }
      } else {
        const choice = (await ask('\n[p] prepare in composer  [s] skip  [q] quit  → ')).trim().toLowerCase();
        if (choice === 'q') break;
        if (choice === 's') continue;
        if (choice !== 'p' && choice !== '') continue;

        if (!page.url().includes('linkedin.com/feed')) {
          await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
        }
        const editor = await openComposer(page);
        await typePost(page, editor, post.body);
        console.log('  → Composer filled. Waiting ~4s for link preview card to render...');
        await page.waitForTimeout(4000);
        console.log('  → Review the post in LinkedIn, then click "Post" yourself.');

        const result = (await ask('\n  Did you publish it? [y]es / [n]o → ')).trim().toLowerCase();
        if (result === 'y') {
          published = true;
        } else {
          const cancel = page.locator('button[aria-label*="Dismiss"], button:has-text("Discard")').first();
          if (await cancel.isVisible({ timeout: 1000 }).catch(() => false)) {
            await cancel.click().catch(() => {});
          }
        }
      }

      if (published) {
        post.posted = true;
        post.postedAt = new Date().toISOString();
        savePosts(posts);
        console.log(`  ✓ Marked ${post.slug} as posted.`);
        consecFailures = 0;

        const isLast = i === remaining.length - 1;
        if (!isLast) {
          if (autoMode) {
            const range = Math.max(0, maxDelaySec - minDelaySec);
            const delay = (minDelaySec + Math.random() * range) * 1000;
            console.log(`  → sleeping ${Math.round(delay / 1000)}s before next post...`);
            await sleep(delay);
          } else {
            const cooldown = (await ask('  Pause before next post (seconds, Enter for 2)? ')).trim();
            await page.waitForTimeout((parseInt(cooldown, 10) || 2) * 1000);
          }
        }
      } else {
        console.log(`  ✗ Left ${post.slug} unposted. Will retry on next run.`);
        consecFailures++;
        if (autoMode && consecFailures >= maxConsecFailures) {
          console.error(`\n✗ Aborting AUTO mode after ${consecFailures} consecutive failures.`);
          break;
        }
      }
    }

    console.log('\nDone.');
  } finally {
    await context.close();
    rl.close();
  }
}

run().catch((err) => {
  console.error(err);
  rl.close();
  process.exit(1);
});
