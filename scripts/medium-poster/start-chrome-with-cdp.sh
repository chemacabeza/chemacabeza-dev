#!/usr/bin/env bash
# Relaunch your Chrome with --remote-debugging-port=9222 so the auto-publish
# cron can drive it via Chrome DevTools Protocol.
#
# WARNING: closes your currently-open Chrome instance. If Chrome's setting
# "On startup → Continue where you left off" is enabled (chrome://settings/onStartup),
# your tabs will be restored when Chrome reopens here. Otherwise they'll be
# closed.
set -euo pipefail

PORT=9222
PROFILE_DIR="${CHROME_PROFILE_DIR:-$HOME/.config/google-chrome}"

if curl -sS -m 2 "http://127.0.0.1:$PORT/json/version" >/dev/null 2>&1; then
  echo "✓ CDP is already reachable at http://127.0.0.1:$PORT — nothing to do."
  curl -sS "http://127.0.0.1:$PORT/json/version" 2>/dev/null | head -3
  exit 0
fi

echo "→ Chrome is not currently running with --remote-debugging-port=$PORT."
echo
echo "  This script will close your existing Chrome instance and restart it"
echo "  with debug enabled. Your tabs WILL be restored IF you have"
echo "  'Continue where you left off' enabled in chrome://settings/onStartup."
echo
read -r -p "Continue? [y/N] " yn
case "$yn" in
  [yY]|[yY][eE][sS]) ;;
  *) echo "Aborted."; exit 1 ;;
esac

echo "→ closing Chrome ..."
pkill -f 'google-chrome' 2>/dev/null || true
# wait for processes to settle
for _ in 1 2 3 4 5 6 7 8 9 10; do
  pgrep -f 'google-chrome' >/dev/null 2>&1 || break
  sleep 1
done

echo "→ launching Chrome with --remote-debugging-port=$PORT ..."
DISPLAY="${DISPLAY:-:0}" nohup google-chrome \
  --remote-debugging-port="$PORT" \
  --user-data-dir="$PROFILE_DIR" \
  >/dev/null 2>&1 &
disown

# Give Chrome a few seconds to bind the port
for _ in 1 2 3 4 5 6 7 8 9 10; do
  if curl -sS -m 1 "http://127.0.0.1:$PORT/json/version" >/dev/null 2>&1; then
    echo "✓ Chrome is running with CDP enabled."
    curl -sS "http://127.0.0.1:$PORT/json/version" | head -3
    exit 0
  fi
  sleep 1
done

echo "✗ Chrome started but CDP port didn't respond. Check Chrome's stderr / try again." >&2
exit 1
