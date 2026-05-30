// ==UserScript==
// @name         Medium Import Auto-Fill + Submit + Publish
// @namespace    https://chemacabeza.dev/
// @version      2.0.0
// @description  Auto-fill /p/import URL field, click Import, and (when armed) auto-Publish the resulting /p/<id>/edit draft.
// @match        https://medium.com/p/import*
// @match        https://medium.com/p/*/edit*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
//
// Two phases, picked by URL pathname:
//
//   1. /p/import?url=<X>  → fill X into the URL field, click Import.
//      Sets sessionStorage.medium-just-imported='1' so the resulting
//      /p/<id>/edit page (loaded in the SAME tab, so the storage carries
//      over) knows it's part of an automated chain.
//
//   2. /p/<id>/edit       → if sessionStorage flag is set OR the URL hash
//      contains 'autopublish=1', click Publish, wait for the prepublish
//      dialog, click "Publish now". Otherwise do nothing.
//
// The sessionStorage path covers freshly-imported drafts in the same tab.
// The hash path lets you trigger publish on an existing draft tab via a
// bookmarklet that appends #autopublish=1 and reloads — see
// install-helpers.sh for that bookmarklet.
(function () {
  'use strict';
  const FLAG_KEY = 'medium-just-imported';
  const path = location.pathname;

  if (path === '/p/import') {
    runImport();
  } else if (/^\/p\/[^/]+\/edit\/?$/.test(path)) {
    const armed = sessionStorage.getItem(FLAG_KEY) === '1' || /autopublish=1/.test(location.hash);
    if (armed) {
      sessionStorage.removeItem(FLAG_KEY);
      runPublish();
    }
  }

  function runImport() {
    const url = new URLSearchParams(location.search).get('url');
    if (!url) return;
    const started = Date.now();
    const tryFill = () => {
      if (Date.now() - started > 10000) return;
      const field = document.querySelector('.js-importUrl');
      if (!field) { setTimeout(tryFill, 150); return; }
      if (field.textContent && field.textContent.includes(url)) {
        return clickImport();
      }
      field.setAttribute('contenteditable', 'true');
      field.focus();
      try {
        const sel = window.getSelection();
        sel.removeAllRanges();
        const range = document.createRange();
        range.selectNodeContents(field);
        range.collapse(false);
        sel.addRange(range);
        if (!document.execCommand('insertText', false, url)) {
          field.textContent = url;
          field.dispatchEvent(new InputEvent('input', { inputType: 'insertFromPaste', bubbles: true }));
        }
      } catch (_) {
        field.textContent = url;
        field.dispatchEvent(new InputEvent('input', { inputType: 'insertFromPaste', bubbles: true }));
      }
      setTimeout(clickImport, 400);
    };
    setTimeout(tryFill, 400);
  }

  function clickImport() {
    const btn = document.querySelector('button[data-action="import-url"]');
    if (btn && !btn.disabled) {
      sessionStorage.setItem(FLAG_KEY, '1');  // arm the /edit handler
      btn.click();
    }
  }

  function runPublish() {
    const started = Date.now();
    const tryOpenDialog = () => {
      if (Date.now() - started > 15000) return;
      // Prepublish dialog open button — try multiple selectors as Medium
      // varies them across editor versions.
      const candidates = [
        () => document.querySelector('button[data-action="show-prepublish"]'),
        () => Array.from(document.querySelectorAll('button')).find((b) =>
          /^publish$/i.test((b.innerText || '').trim()) && !b.disabled
        ),
        () => Array.from(document.querySelectorAll('[role="button"]')).find((b) =>
          /^publish$/i.test((b.innerText || '').trim())
        ),
      ];
      for (const get of candidates) {
        const el = get();
        if (el) { el.click(); return setTimeout(tryFinalize, 800); }
      }
      setTimeout(tryOpenDialog, 200);
    };

    const tryFinalize = () => {
      const finStarted = Date.now();
      const tick = () => {
        if (Date.now() - finStarted > 15000) return;
        // "Publish now" button in the prepublish modal
        const candidates = [
          () => document.querySelector('button[data-action="publish"]'),
          () => Array.from(document.querySelectorAll('button')).find((b) =>
            /publish now/i.test((b.innerText || '').trim()) && !b.disabled
          ),
        ];
        for (const get of candidates) {
          const el = get();
          if (el) { el.click(); return; }
        }
        setTimeout(tick, 200);
      };
      tick();
    };

    setTimeout(tryOpenDialog, 1500);
  }
})();
