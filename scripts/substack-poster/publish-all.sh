#!/usr/bin/env bash
# Publish every not-yet-posted entry in scripts/substack-poster/posts.json to
# Substack, live, one at a time, marking the queue after each success so a
# mid-run failure never loses progress or double-publishes.
#
# Substack has no publishing API, so each post is driven through the real
# logged-in editor via Chrome DevTools Protocol (see cdp-publish.mjs +
# start-chrome-with-cdp.sh). A fresh draft is created per post, filled from the
# site's /export/<slug> HTML, and published with "Send to everyone now".
#
# Env:
#   SLEEP_BETWEEN   seconds to wait between posts (default 25) — be gentle.
#   SITE_URL, SUBSTACK_PUB_URL, CDP_URL  forwarded to cdp-publish.mjs.
set -uo pipefail

REPO="$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")/../.." && pwd)"
cd "$REPO"
QUEUE="scripts/substack-poster/posts.json"
SLEEP_BETWEEN="${SLEEP_BETWEEN:-25}"
export NODE_OPTIONS="${NODE_OPTIONS:-} --dns-result-order=ipv4first"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

# Ensure the CDP Chrome (logged-in Substack session) is up.
if ! curl -sS -m 2 "${CDP_URL:-http://127.0.0.1:9223}/json/version" >/dev/null 2>&1; then
  log "CDP not reachable; starting headed-offscreen Chrome"
  "$REPO/scripts/substack-poster/start-chrome-with-cdp.sh" >/dev/null 2>&1 || true
  for _ in $(seq 1 10); do
    sleep 2
    curl -sS -m 1 "${CDP_URL:-http://127.0.0.1:9223}/json/version" >/dev/null 2>&1 && break
  done
fi

# Pull the ordered list of unposted slugs.
mapfile -t SLUGS < <(node -e '
const fs=require("node:fs");
const a=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
for (const p of a) if (!p.posted) console.log(p.slug);
' "$QUEUE")

TOTAL=${#SLUGS[@]}
if [ "$TOTAL" -eq 0 ]; then
  log "nothing to publish — all posts already marked posted."
  exit 0
fi
log "publishing $TOTAL post(s) to Substack…"

OK=0
FAIL=0
FAILED_SLUGS=()
i=0
for slug in "${SLUGS[@]}"; do
  i=$((i+1))
  log "[$i/$TOTAL] → $slug"
  STDERR_LOG="$(mktemp)"
  URL=$(node "$REPO/scripts/substack-poster/cdp-publish.mjs" "$slug" 2>"$STDERR_LOG")
  RC=$?
  if [ "$RC" -eq 0 ] && [ -n "$URL" ]; then
    OK=$((OK+1))
    log "    ✓ $URL"
    node -e '
const fs=require("node:fs");
const [f,slug,url]=process.argv.slice(1);
const a=JSON.parse(fs.readFileSync(f,"utf8"));
const p=a.find(x=>x.slug===slug);
if(p && !p.posted){p.posted=true;p.postedAt=new Date().toISOString();p.substackStatus="published";p.substackUrl=url;
  fs.writeFileSync(f,JSON.stringify(a,null,2)+"\n");}
' "$QUEUE" "$slug" "$URL"
  else
    FAIL=$((FAIL+1))
    FAILED_SLUGS+=("$slug")
    log "    ✗ FAILED (rc=$RC) — last lines:"
    tail -6 "$STDERR_LOG" | sed 's/^/        /'
    if [ "$RC" -eq 3 ]; then
      log "    SESSION EXPIRED — aborting run. Log into substack.com in Chrome and re-run."
      rm -f "$STDERR_LOG"
      break
    fi
  fi
  # append full stderr to a run log for debugging
  cat "$STDERR_LOG" >> "$REPO/scripts/substack-poster/publish-all.log" 2>/dev/null || true
  rm -f "$STDERR_LOG"
  [ "$i" -lt "$TOTAL" ] && sleep "$SLEEP_BETWEEN"
done

log "──────────────────────────────────────────"
log "done: $OK published, $FAIL failed"
if [ "$FAIL" -gt 0 ]; then
  log "failed slugs: ${FAILED_SLUGS[*]}"
  exit 1
fi
