#!/usr/bin/env bash
# Dispatch the Medium publish workflow, wait for it to finish, and print
# the log of the "Publish to Medium via import" step. Useful for iterating
# on the Playwright import flow without waiting for the */30 cron.
set -euo pipefail

WORKFLOW="medium-publish.yml"
REPO_FLAG=()
# Use -R if not running from inside the repo.
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  REPO_FLAG=(-R chemacabeza/chemacabeza-dev)
fi

echo "→ Dispatching $WORKFLOW ..."
gh "${REPO_FLAG[@]}" workflow run "$WORKFLOW"

# gh workflow run returns immediately; the run appears in the list a few
# seconds later. Poll until we see a run created within the last minute.
echo "→ Waiting for the new run to register ..."
RUN_ID=""
for _ in {1..20}; do
  sleep 3
  RUN_ID=$(gh "${REPO_FLAG[@]}" run list \
    --workflow="$WORKFLOW" \
    --limit 1 \
    --json databaseId,createdAt,status \
    --jq '.[0] | select((now - (.createdAt | fromdateiso8601)) < 120) | .databaseId')
  [ -n "$RUN_ID" ] && break
done
if [ -z "$RUN_ID" ]; then
  echo "✗ Couldn't find the new run within 60s." >&2
  exit 1
fi
echo "→ Run ID: $RUN_ID"

# gh run watch blocks until the run finishes (or errors). Always proceed
# to the log dump even if the run failed.
gh "${REPO_FLAG[@]}" run watch "$RUN_ID" || true

echo
echo "================ Publish-step log ================"
gh "${REPO_FLAG[@]}" run view "$RUN_ID" --log \
  | grep -E "Publish to Medium via import" -A 200 \
  | head -200 \
  || gh "${REPO_FLAG[@]}" run view "$RUN_ID" --log
