#!/usr/bin/env bash
# Print install instructions for the Medium import auto-fill helpers.
# Two options:
#   1. Tampermonkey userscript — install once, every /p/import?url=<X>
#      tab auto-fills X and clicks Import. ZERO clicks per post.
#   2. Bookmarklet — drag a bookmark into your bar; click it on each
#      Medium tab. ONE click per post.
#
# Both run in your real Chrome session (valid cf_clearance, real
# fingerprint) — that's the context where the import click actually
# reaches Medium's endpoint and isn't blocked by Cloudflare.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
USERSCRIPT="$HERE/medium-import-autofill.user.js"

cat <<EOF
=============================================================
  Medium import auto-fill helpers — install instructions
=============================================================

OPTION 1 — Tampermonkey userscript (RECOMMENDED, zero clicks)
-------------------------------------------------------------
  1. Install Tampermonkey for Chrome:
       https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
  2. Open this URL in Chrome to install the userscript:
       file://$USERSCRIPT
     Tampermonkey will pop up an Install prompt → click Install.
  3. Done. Run \`./scripts/medium-poster/open-due-import-tabs.sh\`
     and watch every tab auto-import. No clicks per post.

OPTION 2 — Bookmarklet (one click per tab, no extension)
-------------------------------------------------------------
  1. Right-click your Chrome bookmarks bar → Add page...
  2. Name:  Medium Import Auto-Fill
  3. URL:   (paste the entire one-liner below)
  4. Save.
  5. Open the tabs (open-due-import-tabs.sh), then click the
     bookmarklet on each tab. One click per post.

BOOKMARKLET URL (copy this whole line):

javascript:(function(){var u=new URLSearchParams(location.search).get('url');if(!u){alert('No ?url= in this URL');return;}var s=Date.now();var t=function(){if(Date.now()-s>10000)return;var f=document.querySelector('.js-importUrl');if(!f){setTimeout(t,150);return;}f.setAttribute('contenteditable','true');f.focus();try{var sel=window.getSelection();sel.removeAllRanges();var r=document.createRange();r.selectNodeContents(f);r.collapse(false);sel.addRange(r);if(!document.execCommand('insertText',false,u)){f.textContent=u;f.dispatchEvent(new InputEvent('input',{inputType:'insertFromPaste',bubbles:true}));}}catch(_){f.textContent=u;f.dispatchEvent(new InputEvent('input',{inputType:'insertFromPaste',bubbles:true}));}setTimeout(function(){var b=document.querySelector('button[data-action="import-url"]');if(b&&!b.disabled)b.click();},400);};setTimeout(t,400);})();

OPTION 3 — "Publish this draft" bookmarklet (auto-publish current /edit tab)
-------------------------------------------------------------
Use this on a /p/<id>/edit tab to publish the draft. Useful for the
batch of drafts already open in tabs after a bulk import — click the
bookmarklet on each one and the userscript handles the rest (it appends
#autopublish=1 and reloads, then the userscript fires Publish + Publish now).

  1. Add another bookmark — Name: Publish this draft
  2. URL: paste the one-liner below.

javascript:(function(){if(!/\/p\/[^/]+\/edit\/?$/.test(location.pathname)){alert('Not on a /p/<id>/edit page');return;}location.hash='autopublish=1';location.reload();})();

=============================================================
EOF
