# play-left — agent context

Multi-brand Playwright E2E framework. Generic by construction: four fictional
brands, placeholder hosts, no real data anywhere.

## Non-negotiables

- **Brand facts live in `knowledge/registry/brand-config.json`.** A spec that
  hardcodes a host, store ID, ZIP, or address is wrong — read `brandConfig`.
- **Specs import from `fixtures/`**, not `@playwright/test`. The base `test`
  has no `brand` option and no consent handler.
- **Never commit** credentials, card numbers, gift card numbers, real hostnames,
  real issue keys, or `.auth/` session state.
- **Stale state throws.** Feature flags past TTL, invalid execution settings —
  fail loudly rather than defaulting.
- **Generated output is review material.** Anything under `output/` needs
  curation before it becomes source.
- **Blocked ≠ failed.** Unavailable store, auth failure, consent failure, OTP,
  network, or test-environment service failure is blocked/configuration/retry
  unless there is product evidence of a real defect.

## Conventions

- Locators: test-id → role+accessible-name → label → stable CSS → XPath (last resort)
- A locator with more than one match is not stable; scope it
- Web-first assertions; no arbitrary `waitForTimeout` in specs
- Brand differences are small page-object overrides, not forked hierarchies
- Strict TypeScript, CommonJS, `npm run typecheck` must pass

## Verify before pushing

```bash
npm run typecheck
npx playwright test --project=config
npx playwright test --list
```
