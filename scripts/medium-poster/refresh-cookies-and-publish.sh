#!/usr/bin/env bash
# Refresh the MEDIUMCOOKIEJAR GitHub secret with a fresh `Cookie:` header
# value, then re-dispatch the publish workflow.
#
# Tries to auto-extract from Firefox's cookies.sqlite first (no decryption
# needed). Chrome cookies on Linux are encrypted via libsecret and are
# harder to read in script form — for Chrome users, the script falls back
# to a manual paste step. Manual fallback works for any browser:
#
#   1. Open https://medium.com in a logged-in tab.
#   2. DevTools → Network → reload → click any request to medium.com.
#   3. Copy the full `Cookie:` request header value.
#   4. Paste when prompted below.
#
# The cookie value never touches stdout or any log — it's piped straight
# into `gh secret set` via stdin.
set -euo pipefail

# gh refuses to use stored credentials while $GITHUB_TOKEN is set. Strip it
# for the duration of this script so we can read the keyring login.
unset GITHUB_TOKEN

REPO=chemacabeza/chemacabeza-dev
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

require() {
  command -v "$1" >/dev/null 2>&1 || { echo "✗ '$1' not installed; install it and re-run." >&2; exit 1; }
}
require gh
require sqlite3 || true  # only needed for Firefox extraction

# Find the Firefox profile most recently modified and dump its medium.com
# cookies as a `name=value; name=value; ...` string. Looks in both the
# classic ~/.mozilla path and the snap install path.
extract_firefox() {
  local profile tmp
  profile=$(find \
      "$HOME/.mozilla/firefox" \
      "$HOME/snap/firefox/common/.mozilla/firefox" \
      -maxdepth 2 -name cookies.sqlite -printf '%T@ %p\n' 2>/dev/null \
    | sort -nr | head -1 | awk '{print $2}')
  [ -z "${profile:-}" ] && return 1
  tmp=$(mktemp)
  cp "$profile" "$tmp" 2>/dev/null || { rm -f "$tmp"; return 1; }
  local jar
  jar=$(sqlite3 "$tmp" "SELECT name || '=' || value FROM moz_cookies WHERE host LIKE '%medium.com%';" 2>/dev/null \
    | paste -sd '; ')
  rm -f "$tmp"
  printf '%s' "$jar"
}

# Decrypt medium.com cookies from Linux Chrome via the Python helper.
# Needs Python's `cryptography` library. `secret-tool` (apt: libsecret-tools)
# is preferred — Chrome encrypts with a keyring secret when one is available —
# but the helper falls back to Chrome's no-keyring default password ("peanuts"),
# which works on profiles where Chrome itself uses that fallback.
extract_chrome() {
  command -v python3 >/dev/null 2>&1 || return 1
  python3 -c 'import cryptography' >/dev/null 2>&1 || return 1
  [ -f "$HOME/.config/google-chrome/Default/Cookies" ] || return 1
  python3 "$HERE/_chrome_cookies.py" 2>/dev/null
}

echo "→ Refreshing Medium cookies and dispatching publish workflow"
echo

cookie_jar=""

# Try Chrome first (most users' default). Requires secret-tool + cryptography.
if [ -f "$HOME/.config/google-chrome/Default/Cookies" ]; then
  echo "→ Trying Chrome cookies (decrypting via libsecret + AES) ..."
  cookie_jar=$(extract_chrome || true)
  if [ -n "$cookie_jar" ] && [[ "$cookie_jar" == *sid=* ]]; then
    pair_count=$(awk -F'; ' '{print NF}' <<<"$cookie_jar")
    echo "  ✓ Extracted $pair_count cookie pairs (incl. sid) from Chrome"
  else
    cookie_jar=""
    if ! python3 -c 'import cryptography' >/dev/null 2>&1; then
      echo "  ✗ Chrome extraction skipped — Python 'cryptography' missing"
      echo "    one-time install: pip install cryptography"
    else
      echo "  ✗ Chrome extraction returned no 'sid=' cookie"
      echo "    (if your Chrome uses gnome-keyring/kwallet, install libsecret-tools:"
      echo "     sudo apt install -y libsecret-tools)"
    fi
  fi
fi

# Then Firefox as a secondary auto-extract path.
if [ -z "$cookie_jar" ] && command -v sqlite3 >/dev/null 2>&1; then
  if [ -d "$HOME/.mozilla/firefox" ] || [ -d "$HOME/snap/firefox/common/.mozilla/firefox" ]; then
    echo "→ Trying Firefox cookies.sqlite ..."
    cookie_jar=$(extract_firefox || true)
    if [ -n "$cookie_jar" ] && [[ "$cookie_jar" == *sid=* ]]; then
      pair_count=$(awk -F'; ' '{print NF}' <<<"$cookie_jar")
      echo "  ✓ Extracted $pair_count cookie pairs (incl. sid) from Firefox"
    else
      cookie_jar=""
      echo "  ✗ Firefox extraction returned no 'sid=' cookie"
    fi
  fi
fi

if [ -z "$cookie_jar" ]; then
  echo
  echo "Manual paste needed (no Firefox cookies available)."
  echo "  1. Open https://medium.com in a logged-in browser tab."
  echo "  2. DevTools → Network → reload → click any medium.com request."
  echo "  3. Copy the full 'Cookie:' request header value (one long line)."
  echo "  4. Paste below and press Enter."
  echo
  IFS= read -r cookie_jar
fi

if [[ "$cookie_jar" != *sid=* ]]; then
  echo "✗ Cookie value missing 'sid=' — refusing to update secret." >&2
  exit 1
fi

echo
echo "→ Updating MEDIUMCOOKIEJAR secret on $REPO ..."
printf '%s' "$cookie_jar" | gh secret set MEDIUMCOOKIEJAR -R "$REPO" >/dev/null
echo "  ✓ Secret updated"

echo
echo "→ Dispatching publish workflow + watching run ..."
exec "$HERE/dispatch-and-watch.sh"
