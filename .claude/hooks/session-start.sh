#!/bin/bash
#
# SessionStart hook — prepare the framework so tests run immediately.
#
# Without this, a fresh session starts with no node_modules and a Chromium
# build that may not match the pinned Playwright version, and the first
# `npx playwright test` fails for reasons that have nothing to do with the code.
set -euo pipefail

# Local machines already have a working checkout; only the remote container
# starts empty.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

echo "[session-start] Installing dependencies"
npm install --no-audit --no-fund

# @playwright/test is pinned exactly because the library and the browser build
# have to agree. If the environment ships a matching Chromium this is a no-op;
# if it does not, this fetches the right one.
echo "[session-start] Ensuring Chromium matches the pinned Playwright version"
npx playwright install chromium

# The demo storefront needs no build, but say so rather than leaving the next
# session to rediscover it.
echo "[session-start] Ready. Verify with:"
echo "  npm run typecheck"
echo "  npx playwright test        # expect 27 passed, 4 skipped"
