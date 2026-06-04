#!/usr/bin/env bash
# Publish the next due Medium post, called twice daily (09:00, 21:00) by the
# medium-publish.timer systemd user unit (see install-cron-publish.sh).
# Medium caps publishing at 2 stories / 24h, so the cadence matches that.
#
# Flow per invocation:
#   1. Find the oldest unposted post whose scheduledFor is in the past.
#   2. If Chrome isn't running, xdg-open will launch it — we still want to
#      bail early in that case because launching Chrome cold + the
#      Tampermonkey userscript timing don't play nicely.
#   3. Open medium.com/p/import?url=<post>; the Tampermonkey userscript
#      (medium-import-autofill.user.js v2) auto-fills, clicks Import, and
#      auto-publishes once Medium redirects to /p/<id>/edit.
#   4. Wait ~70s for the chain to land.
#   5. Mark posted=true + postedAt in posts.json, commit + push [skip ci].
#
# Idempotent enough: if nothing's due, exits 0 silently. If Chrome isn't
# running, exits 0 and waits for the next slot.
set -euo pipefail

REPO="$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")/../.." && pwd)"
cd "$REPO"

LOG_TS() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(LOG_TS)] $*"; }

# Find the next due post (oldest scheduledFor first). Emit "slug<TAB>draftId"
# — draftId is set for posts that are already an unpublished Medium draft (a
# prior rate-limited publish), so we re-publish that draft instead of importing
# a duplicate.
NEXT_LINE=$(node -e "
const fs = require('node:fs');
const posts = JSON.parse(fs.readFileSync('scripts/medium-poster/posts.json','utf8'));
const now = Date.now();
const due = posts
  .filter(p => !p.posted && p.scheduledFor && new Date(p.scheduledFor).getTime() <= now)
  .sort((a,b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
if (due.length === 0) process.exit(0);
console.log(due[0].slug + '\t' + (due[0].mediumDraftId || ''));
" 2>&1)

if [ -z "$NEXT_LINE" ]; then
  log "no due posts, nothing to publish"
  exit 0
fi

NEXT=$(printf '%s' "$NEXT_LINE" | cut -f1)
DRAFT_ID=$(printf '%s' "$NEXT_LINE" | cut -f2)

# Bail if Chrome isn't running — better to skip a slot than to launch
# Chrome cold and race the userscript against extension init.
if ! pgrep -f 'google-chrome|chrome' >/dev/null 2>&1; then
  log "Chrome isn't running; skipping slot. Next attempt: next timer fire."
  exit 0
fi

# Bail if the userscript isn't likely installed (rough heuristic: just
# warn — we can't actually probe Tampermonkey from outside Chrome).
TM_EXT="$HOME/.config/google-chrome/Default/Extensions/dhdgffkkebhmkfjojejmpbldmpobfkfo"
if [ ! -d "$TM_EXT" ]; then
  log "WARN: Tampermonkey not installed; tab will open but won't auto-import."
fi

SITE_URL="${MEDIUM_SITE_URL:-https://chemacabeza.dev}"
ENCODED=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote('$SITE_URL/writing/'+sys.argv[1]))" "$NEXT")
TAB_URL="https://medium.com/p/import?url=$ENCODED"

log "publishing: $NEXT"
log "  → $TAB_URL"

# Reliable path: drive Chrome via Chrome DevTools Protocol.
# Requires Chrome to be running with --remote-debugging-port=9222
# (see start-chrome-with-cdp.sh). The userscript path was unreliable
# — Chrome would background-throttle the new tab, the userscript
# chain would stall, and we had no way to know which step failed.
# CDP gives us observable, step-by-step control of the user's real
# Chrome session (valid cf_clearance, no Cloudflare 403).
if ! curl -sS -m 2 "http://127.0.0.1:9222/json/version" >/dev/null 2>&1; then
  log "CDP not reachable; (re-)starting headed-offscreen Chrome with --remote-debugging-port=9222"
  "$REPO/scripts/medium-poster/start-chrome-with-cdp.sh" >/dev/null 2>&1 || true
  # Give it a moment to bind
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    sleep 2
    curl -sS -m 1 "http://127.0.0.1:9222/json/version" >/dev/null 2>&1 && break
  done
  if ! curl -sS -m 2 "http://127.0.0.1:9222/json/version" >/dev/null 2>&1; then
    log "SKIP: couldn't bring up CDP after 20s. Next slot retries."
    exit 0
  fi
  log "CDP came up"
fi

# CDP available — drive Publish via Playwright. The mjs script
# prints the published URL to stdout on success; non-zero exit means
# the publish chain failed (selectors gone, Cloudflare flagged the
# session, etc.). All progress / error detail goes to stderr — we
# capture it to the log so failures are debuggable.
log "CDP available; running cdp-publish.mjs${DRAFT_ID:+ (existing draft $DRAFT_ID)}"
STDERR_LOG="$(mktemp)"
# Disable errexit around the publisher: it intentionally exits non-zero (1/3/4)
# and we branch on RC below. Under `set -e` a bare assignment with a failing
# command substitution would abort the script before we handle the exit code.
set +e
PUBLISHED_URL=$(MEDIUM_SITE_URL="$SITE_URL" MEDIUM_DRAFT_ID="$DRAFT_ID" \
    node "$REPO/scripts/medium-poster/cdp-publish.mjs" "$NEXT" 2>"$STDERR_LOG")
RC=$?
set -e
# The script emits "MEDIUM_DRAFT_ID=<id>" once it has a draft (imported or
# reopened). Capture it so a failed/rate-limited publish persists the draft id
# and the next run re-publishes that draft instead of importing a duplicate.
EMITTED_DRAFT_ID=$(grep -oE 'MEDIUM_DRAFT_ID=[a-f0-9]+' "$STDERR_LOG" | tail -1 | cut -d= -f2)
[ -z "$EMITTED_DRAFT_ID" ] && EMITTED_DRAFT_ID="$DRAFT_ID"

# Persist a draft id onto the post (used by exit 1/4 paths below).
persist_draft_id() {
  [ -z "$EMITTED_DRAFT_ID" ] && return 0
  node -e "
const fs=require('node:fs');
const f='scripts/medium-poster/posts.json';
const posts=JSON.parse(fs.readFileSync(f,'utf8'));
const p=posts.find(x=>x.slug==='$NEXT');
if(p && !p.posted && p.mediumDraftId!=='$EMITTED_DRAFT_ID'){p.mediumDraftId='$EMITTED_DRAFT_ID';fs.writeFileSync(f,JSON.stringify(posts,null,2)+'\n');}
" 2>/dev/null || true
}

if [ "$RC" -eq 0 ]; then
  sed 's/^/    /' "$STDERR_LOG" >> "$HOME/.local/state/medium-publish.log"
  rm -f "$STDERR_LOG"
  log "verified ✓ → $PUBLISHED_URL"
elif [ "$RC" -eq 4 ]; then
  # Rate limited (Medium 2 stories / 24h). Not an error — the draft is fine,
  # we just can't publish more right now. Persist the draft id and back off so
  # the next slot re-publishes this exact draft (no duplicate import).
  persist_draft_id
  log "rate limited (2 stories/24h); '$NEXT' stays a draft (id ${EMITTED_DRAFT_ID:-?}). Will retry next slot."
  sed 's/^/    /' "$STDERR_LOG" >> "$HOME/.local/state/medium-publish.log"
  rm -f "$STDERR_LOG"
  exit 0
elif [ "$RC" -eq 3 ]; then
  # Session expired (Fix 3) — the one failure that needs a human. Make it loud
  # in the log AND fire a desktop notification so it doesn't rot silently.
  log "════════════════════════════════════════════════════════════════"
  log "⚠️  MEDIUM SESSION EXPIRED — auto-publish is PAUSED"
  log "    Nothing will publish until you log into medium.com in Chrome."
  log "    (stuck on: $NEXT)"
  log "════════════════════════════════════════════════════════════════"
  if command -v notify-send >/dev/null 2>&1; then
    DISPLAY="${DISPLAY:-:0}" notify-send -u critical \
      "Medium auto-publish paused" \
      "Session expired — log into medium.com in Chrome to resume." 2>/dev/null || true
  fi
  sed 's/^/    /' "$STDERR_LOG" >> "$HOME/.local/state/medium-publish.log"
  rm -f "$STDERR_LOG"
  exit 0
else
  persist_draft_id
  log "CDP publish failed; per-step detail below. posted=false; next slot retries."
  sed 's/^/    /' "$STDERR_LOG" >> "$HOME/.local/state/medium-publish.log"
  rm -f "$STDERR_LOG"
  exit 0
fi

# Mark posted with the actual published URL.
node -e "
const fs = require('node:fs');
const posts = JSON.parse(fs.readFileSync('scripts/medium-poster/posts.json','utf8'));
const p = posts.find(x => x.slug === '$NEXT');
if (!p) { console.error('slug not found: $NEXT'); process.exit(1); }
if (p.posted) { console.error('already marked posted; skipping write'); process.exit(0); }
p.posted = true;
p.postedAt = new Date().toISOString();
p.mediumStatus = 'published';
p.mediumUrl = '$PUBLISHED_URL';
delete p.mediumDraftId; // published now — no longer a pending draft
fs.writeFileSync('scripts/medium-poster/posts.json', JSON.stringify(posts, null, 2) + '\n');
"

# Commit and push — rebase-and-retry like the workflow does.
git config user.name "${GIT_AUTHOR_NAME:-Jose Cabeza}" 2>/dev/null || true
git config user.email "${GIT_AUTHOR_EMAIL:-j.cabeza-rodriguez@klarna.com}" 2>/dev/null || true
git add scripts/medium-poster/posts.json
git commit -m "chore: auto-publish $NEXT to Medium [skip ci]" >/dev/null
n=0
until git push 2>/dev/null; do
  n=$((n+1))
  if [ $n -ge 3 ]; then log "ERR: push rejected 3x; manual merge needed"; exit 1; fi
  log "push rejected (attempt $n), rebasing"
  git pull --rebase origin master
done

log "done: $NEXT"
