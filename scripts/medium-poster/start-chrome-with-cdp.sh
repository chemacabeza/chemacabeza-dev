#!/usr/bin/env bash
# Start a SECONDARY Chrome instance for the auto-publish cron to drive
# via Chrome DevTools Protocol. We don't touch your main Chrome — it
# stays open with all your tabs. The secondary instance lives in a
# separate user-data-dir, opens offscreen so it doesn't interrupt your
# work, and copies your medium.com cookies (including cf_clearance) from
# the main profile so Medium and Cloudflare accept it.
#
# Idempotent: re-running just verifies CDP is up.
set -uo pipefail  # not -e — we want to keep going past non-fatal errors

PORT=9222
CDP_PROFILE="${CHROME_CDP_PROFILE_DIR:-$HOME/.config/google-chrome-cdp}"
MAIN_PROFILE="${CHROME_PROFILE_DIR:-$HOME/.config/google-chrome}"

# Fast path: CDP already reachable, nothing to do.
if curl -sS -m 2 "http://127.0.0.1:$PORT/json/version" >/dev/null 2>&1; then
  echo "✓ CDP already reachable at http://127.0.0.1:$PORT — nothing to do."
  exit 0
fi

# One-time profile init: copy cookies + Local State (which contains the
# AES key for cookie value encryption) from main profile so the CDP
# Chrome's Medium session is already logged in. Re-doing this on every
# run keeps cookies fresh (cf_clearance rotates).
echo "→ syncing cookies from main profile to CDP profile"
mkdir -p "$CDP_PROFILE/Default"
# Lock files: skip Singleton* / "Last Version" etc.
for f in Cookies "Local State" Preferences; do
  src="$MAIN_PROFILE/Default/$f"
  [ -f "$src" ] || src="$MAIN_PROFILE/$f"
  [ -f "$src" ] && cp -p "$src" "$CDP_PROFILE/Default/$f" 2>/dev/null
done
# Also copy the top-level Local State (encryption key lives there)
[ -f "$MAIN_PROFILE/Local State" ] && cp -p "$MAIN_PROFILE/Local State" "$CDP_PROFILE/Local State" 2>/dev/null

echo "→ launching headed Chrome with CDP at port $PORT (window pushed offscreen)"
# Headless was 403'd by Cloudflare's bot challenge — we need real GUI
# rendering. --window-position=-2400,-2400 puts the window offscreen so
# you don't see it; it still renders correctly for Cloudflare/Medium.
# --disable-blink-features=AutomationControlled hides webdriver flag.
DISPLAY="${DISPLAY:-:0}" nohup google-chrome \
  --remote-debugging-port="$PORT" \
  --user-data-dir="$CDP_PROFILE" \
  --no-first-run \
  --no-default-browser-check \
  --disable-blink-features=AutomationControlled \
  --window-position=-2400,-2400 \
  --window-size=1280,1800 \
  about:blank \
  > "$CDP_PROFILE/chrome.stdout.log" 2> "$CDP_PROFILE/chrome.stderr.log" </dev/null &
disown 2>/dev/null || true

# Wait for port
for i in $(seq 1 20); do
  sleep 1
  if curl -sS -m 1 "http://127.0.0.1:$PORT/json/version" >/dev/null 2>&1; then
    echo "✓ CDP up after ${i}s"
    curl -sS "http://127.0.0.1:$PORT/json/version" 2>/dev/null | head -3
    exit 0
  fi
done

echo "✗ CDP didn't come up. Last 20 stderr lines:"
tail -20 "$CDP_PROFILE/chrome.stderr.log" 2>/dev/null
exit 1
