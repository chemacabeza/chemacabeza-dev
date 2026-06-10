#!/usr/bin/env bash
# Start a SECONDARY Chrome instance for the Substack auto-publisher to drive
# via Chrome DevTools Protocol. Mirrors scripts/medium-poster/start-chrome-with-cdp.sh
# but lives on its OWN port (9223) and its OWN user-data-dir so it never
# collides with the Medium automation (9222). We don't touch your main Chrome —
# it stays open with all your tabs. The secondary instance lives in a separate
# user-data-dir, opens offscreen, and copies your substack.com cookies from the
# main profile so Substack accepts it as a logged-in session.
#
# Idempotent: re-running just verifies CDP is up.
set -uo pipefail  # not -e — we want to keep going past non-fatal errors

PORT="${SUBSTACK_CDP_PORT:-9223}"
CDP_PROFILE="${CHROME_SUBSTACK_CDP_PROFILE_DIR:-$HOME/.config/google-chrome-cdp-substack}"
MAIN_PROFILE="${CHROME_PROFILE_DIR:-$HOME/.config/google-chrome}"

# Fast path: CDP already reachable, nothing to do.
if curl -sS -m 2 "http://127.0.0.1:$PORT/json/version" >/dev/null 2>&1; then
  echo "✓ CDP already reachable at http://127.0.0.1:$PORT — nothing to do."
  exit 0
fi

# One-time profile init: copy cookies + Local State (which contains the AES key
# for cookie value encryption) from the main profile so the CDP Chrome's
# Substack session is already logged in. Re-doing this on every run keeps
# cookies fresh.
echo "→ syncing cookies from main profile to CDP profile"
mkdir -p "$CDP_PROFILE/Default"
for f in Cookies "Local State" Preferences; do
  src="$MAIN_PROFILE/Default/$f"
  [ -f "$src" ] || src="$MAIN_PROFILE/$f"
  [ -f "$src" ] && cp -p "$src" "$CDP_PROFILE/Default/$f" 2>/dev/null
done
# Also copy the top-level Local State (encryption key lives there)
[ -f "$MAIN_PROFILE/Local State" ] && cp -p "$MAIN_PROFILE/Local State" "$CDP_PROFILE/Local State" 2>/dev/null

# Ensure a usable X display for the *headed* Chrome (headless is often
# bot-challenged). Prefer a real desktop session ($DISPLAY); otherwise spin up a
# virtual framebuffer (Xvfb) so Chrome can render fully offscreen.
ensure_display() {
  if [ -n "${DISPLAY:-}" ] && DISPLAY="$DISPLAY" timeout 3 xset q >/dev/null 2>&1; then
    echo "→ using existing display $DISPLAY"
    return 0
  fi
  local vd="${XVFB_DISPLAY:-:99}"
  if DISPLAY="$vd" timeout 2 xset q >/dev/null 2>&1; then
    echo "→ reusing virtual display $vd"
    export DISPLAY="$vd"
    return 0
  fi
  if ! command -v Xvfb >/dev/null 2>&1; then
    echo "✗ no usable X display and Xvfb is not installed (run: sudo apt-get install -y xvfb)"
    return 1
  fi
  echo "→ no real display; starting Xvfb on $vd"
  nohup Xvfb "$vd" -screen 0 1280x1800x24 -nolisten tcp \
    > "$CDP_PROFILE/xvfb.log" 2>&1 </dev/null &
  disown 2>/dev/null || true
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    sleep 0.5
    DISPLAY="$vd" xset q >/dev/null 2>&1 && break
  done
  if ! DISPLAY="$vd" timeout 2 xset q >/dev/null 2>&1; then
    echo "✗ Xvfb failed to come up on $vd; see $CDP_PROFILE/xvfb.log"
    return 1
  fi
  export DISPLAY="$vd"
  echo "✓ virtual display $vd up"
}

if ! ensure_display; then
  echo "✗ aborting: no X display available for Chrome"
  exit 1
fi

echo "→ launching headed Chrome with CDP at port $PORT (window pushed offscreen)"
DISPLAY="$DISPLAY" nohup google-chrome \
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
