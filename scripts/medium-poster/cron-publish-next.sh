#!/usr/bin/env bash
# Publish the next due Medium post, called 3x daily (09:00, 15:00,
# 21:00 local) by the medium-publish.timer systemd user unit (see
# install-cron-publish.sh).
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

# Find the next due post (oldest scheduledFor first).
NEXT=$(node -e "
const fs = require('node:fs');
const posts = JSON.parse(fs.readFileSync('scripts/medium-poster/posts.json','utf8'));
const now = Date.now();
const due = posts
  .filter(p => !p.posted && p.scheduledFor && new Date(p.scheduledFor).getTime() <= now)
  .sort((a,b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
if (due.length === 0) process.exit(0);
console.log(due[0].slug);
" 2>&1)

if [ -z "$NEXT" ]; then
  log "no due posts, nothing to publish"
  exit 0
fi

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

xdg-open "$TAB_URL" >/dev/null 2>&1 &

# Give the import + publish chain time to complete. Medium typically
# settles in 20-40s; 70s leaves margin for slow responses.
sleep 70

# Mark posted optimistically. If Medium rejected, the user can revert
# this entry manually.
node -e "
const fs = require('node:fs');
const posts = JSON.parse(fs.readFileSync('scripts/medium-poster/posts.json','utf8'));
const p = posts.find(x => x.slug === '$NEXT');
if (!p) { console.error('slug not found: $NEXT'); process.exit(1); }
if (p.posted) { console.error('already marked posted; skipping write'); process.exit(0); }
p.posted = true;
p.postedAt = new Date().toISOString();
p.mediumStatus = 'published';
p.mediumUrl = 'https://medium.com/@chemacabeza';
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
