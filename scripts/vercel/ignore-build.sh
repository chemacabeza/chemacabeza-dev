#!/bin/sh
# Vercel expects 0 to skip a build and 1 to continue it.
# The previous deployment may be outside Vercel's shallow Git history.
if [ -z "${VERCEL_GIT_PREVIOUS_SHA:-}" ] ||
  ! git cat-file -e "${VERCEL_GIT_PREVIOUS_SHA}^{commit}" 2>/dev/null; then
  echo "Previous commit unavailable; continuing build."
  exit 1
fi

if git diff --quiet "$VERCEL_GIT_PREVIOUS_SHA" HEAD -- \
  app components content lib public package.json package-lock.json \
  next.config.ts postcss.config.mjs tsconfig.json vercel.json \
  scripts/vercel/ignore-build.sh; then
  echo "No application changes; skipping build."
  exit 0
fi

# Both application changes and comparison errors must allow a build.
echo "Application changed or comparison failed; continuing build."
exit 1
