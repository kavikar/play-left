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

## The demo brand

`brand-demo` is the only brand with a real host: `demo-app/`, a dependency-free
storefront started by Playwright's `webServer`. It is what makes CI meaningful.

- Keep `demo-app/` dependency-free and build-step-free.
- Add to it only what a spec genuinely needs — it is a test target, not a product.
- A brand with `runnable !== true` skips rather than fails. Do not "fix" a
  skipped placeholder brand by pointing it at the demo app.

## Verify before pushing

```bash
npm run typecheck
npm run test:config          # contracts, no browser
npx playwright test          # expect: 27 passed, 4 skipped, 0 failed
```

The four skips are the placeholder brands. A failure there means the runnable
guard broke, not that the brands need hosts.
