// ==UserScript==
// @name         Medium Import Auto-Fill + Submit
// @namespace    https://chemacabeza.dev/
// @version      1.0.0
// @description  When visiting medium.com/p/import?url=<X>, auto-fill X into the import URL field and click Import. Works around Medium ignoring the ?url= query param.
// @match        https://medium.com/p/import*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
//
// Install in Tampermonkey (or any other userscript manager).
//
// Pair with scripts/medium-poster/open-due-import-tabs.sh — that opens
// every due post's /p/import?url=... in a Chrome tab; this script then
// auto-imports each one. Result: zero clicks per post, real-Chrome
// session so Cloudflare doesn't 403 the import.
(function () {
  'use strict';
  const url = new URLSearchParams(location.search).get('url');
  if (!url) return;

  // Try to fill the field repeatedly until Medium's JS has initialised it
  // (the empty .js-importUrl div has no contenteditable attribute until
  // Medium's bundle runs). Give up after ~10s.
  const start = Date.now();
  const TIMEOUT_MS = 10000;

  function tryFill() {
    if (Date.now() - start > TIMEOUT_MS) return;

    const field = document.querySelector('.js-importUrl');
    if (!field) { setTimeout(tryFill, 150); return; }

    // Already filled? (e.g. user re-ran on a partially-loaded page)
    if (field.textContent && field.textContent.includes(url)) {
      clickImport();
      return;
    }

    field.setAttribute('contenteditable', 'true');
    field.focus();

    // execCommand('insertText') fires a real beforeinput + input event,
    // which is what Medium's framework binds its URL-state tracker to.
    try {
      const sel = window.getSelection();
      sel.removeAllRanges();
      const range = document.createRange();
      range.selectNodeContents(field);
      range.collapse(false);
      sel.addRange(range);
      const ok = document.execCommand('insertText', false, url);
      if (!ok) {
        // Older fallback — direct textContent + synthetic input event
        field.textContent = url;
        field.dispatchEvent(new InputEvent('input', { inputType: 'insertFromPaste', bubbles: true }));
      }
    } catch (_) {
      field.textContent = url;
      field.dispatchEvent(new InputEvent('input', { inputType: 'insertFromPaste', bubbles: true }));
    }

    // Give Medium's listeners a beat to register the URL, then click.
    setTimeout(clickImport, 400);
  }

  function clickImport() {
    const btn = document.querySelector('button[data-action="import-url"]');
    if (btn && !btn.disabled) btn.click();
  }

  setTimeout(tryFill, 400);
})();
