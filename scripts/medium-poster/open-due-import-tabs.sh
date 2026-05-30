#!/usr/bin/env bash
# Open every due Medium importer URL as a tab in your default browser.
# Each tab lands on medium.com/p/import with the source URL prefilled
# — you click Import (and optionally Publish) in your real Chrome
# session, which is what Cloudflare actually accepts.
#
# Why this exists: see the comment header of medium-publish.yml.
# Medium's bot detection blocks Playwright sessions no matter the IP or
# cookies, but the same operation works fine in a real browser tab.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE="${MEDIUM_SITE_URL:-https://chemacabeza.dev}"
GAP_S="${GAP_S:-1.5}"   # seconds between opens — keep low so all tabs land fast

if ! command -v xdg-open >/dev/null 2>&1; then
  echo "✗ xdg-open not found. Install xdg-utils, or pass each URL to your browser manually." >&2
  exit 1
fi

mapfile -t slugs < <(node -e "
const posts = require('$HERE/posts.json');
const now = Date.now();
posts
  .filter((p) => !p.posted && p.scheduledFor && new Date(p.scheduledFor).getTime() <= now)
  .forEach((p) => console.log(p.slug));
")

count=${#slugs[@]}
if [ "$count" -eq 0 ]; then
  echo "Nothing due. (Check scripts/medium-poster/posts.json scheduledFor / posted.)"
  exit 0
fi

echo "→ Opening $count importer tab(s) in your default browser"
echo "  For each tab: Import → (set tags) → Publish."
echo "  Estimated browser work: ~$(( count * 5 ))s of clicking."
echo

for i in "${!slugs[@]}"; do
  slug=${slugs[$i]}
  encoded=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote('$SITE/writing/'+sys.argv[1]))" "$slug")
  url="https://medium.com/p/import?url=$encoded"
  printf '  %2d/%d  %s\n' $((i + 1)) "$count" "$slug"
  xdg-open "$url" >/dev/null 2>&1
  # don't sleep after the last one
  if [ "$i" -lt $((count - 1)) ]; then sleep "$GAP_S"; fi
done

echo
echo "✓ All $count tabs opened."
echo
echo "  IMPORTANT: Medium's /p/import?url=... DOES NOT prefill the field — each"
echo "  tab opens with an empty input. You have two options:"
echo
echo "  (a) Install the Tampermonkey userscript so tabs auto-import:"
echo "        ./scripts/medium-poster/install-helpers.sh"
echo "  (b) Manually paste the URL into each tab (it's in the tab's URL bar"
echo "      after ?url= — decode it, paste, click Import)."
echo
echo "  After publishing each post, set posted=true + postedAt in"
echo "  scripts/medium-poster/posts.json. Issue #2 updates on next */30 cron."
