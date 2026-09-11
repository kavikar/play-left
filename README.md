# play-left

[![CI](https://github.com/kavikar/play-left/actions/workflows/ci.yml/badge.svg)](https://github.com/kavikar/play-left/actions/workflows/ci.yml)

A multi-brand Playwright end-to-end framework built around one idea: **brand facts live in a registry, never in a spec.**

Four brands share ~70% of their web experience and differ in the rest. The naive answers are to fork the framework per brand (four copies to maintain) or to branch on brand inside every spec (unreadable within a month). This does neither — brand is a typed Playwright project option, brand data comes from a versioned JSON registry, and brand differences are small page-object overrides.

> Generic by construction. Four fictional brands, placeholder hosts, no real credentials or payment data anywhere in the repository or its history.

---

## Why this exists

This is a portfolio extraction of a framework I built and ran against a real four-brand e-commerce estate. The architecture and the engineering decisions are the real ones; the brands, hosts, store IDs and test data are fictional replacements.

The decisions worth looking at:

| Decision | Rationale |
|---|---|
| Brand injected as a typed project option, not parsed from the project name | Name-parsing gives you `string` where you want `BrandId`, and breaks the day someone adds `brand-one-chromium-mobile` |
| Stale feature-flag state **throws** | A suite running on week-old flag values produces failures nobody can reproduce and passes nobody should trust |
| Invalid `WORKERS`/`FULLY_PARALLEL` **throws** instead of defaulting | `WORKERS=four` silently becoming 4 is how a suite ends up mysteriously slow for a week |
| Card data only in git-ignored local files | Not in fixtures, not in `.env.example`, not in a committed JSON |
| Unavailable store / auth failure / consent failure → **blocked**, not failed | Calling an environment problem a product defect burns reviewer trust faster than anything else |
| Generated page objects are review material, not source | The extractor gets you 80% of a POM; committing the other 20% unread is how brittle selectors get in |
| Local runs: no trace, no video | Traces are the slowest part of a suite. On your own machine a failure screenshot is enough; CI gets the full evidence set because there is no second chance to look |
| A brand with no running host **skips**, it does not fail | The framework's own "blocked is not failed" rule, applied to itself. A red suite everyone learns to ignore is worse than an honest skip with a reason |
| The demo target ships **inside** the repo | A demo that points at a public practice site goes red the day that site changes a selector. CI has no network dependency at all |

---

## Architecture

```
knowledge/registry/brand-config.json   ← single source of truth for brand facts
            │
            ▼
      brands/index.ts                  ← typed, cached, BOM-safe loader
            │
            ├──────────────► playwright.config.ts   (one project per brand, baseURL from registry)
            │
            └──────────────► fixtures/brand.fixture.ts
                                    │
                                    ▼
                       brandConfig · flags · runnableGuard
                                    │
                                    ▼
                         tests/<brand>/*.spec.ts     ← zero hardcoded brand data
```

A spec never knows a store ID, a ZIP, a hostname, or an address. It asks `brandConfig`.

Adding a brand is a registry edit and a `BrandId` union member — no new config
file, no new fixture, no forked page-object tree. `brand-demo` is the proof:
it carries no loyalty program and no fulfillment modes because it genuinely has
neither, and the schema models that rather than forcing every brand into one
shape.

---

## Layout

| Path | What's in it |
|---|---|
| `knowledge/registry/` | Versioned, reviewed brand registry — the source of truth |
| `knowledge/inventory/`, `knowledge/offers/` | Committed release-scoped snapshots (menu, rewards) |
| `knowledge/state/` | Git-ignored, TTL-based runtime state (feature flags) |
| `brands/` | Typed registry loader and `BrandId` narrowing |
| `fixtures/` | `brand` project option, `brandConfig`, `flags`, consent handler |
| `src/config/` | Execution settings, payment and gift card providers |
| `src/pages/base/` | Brand-agnostic page objects |
| `src/pages/` | Brand-specific overrides |
| `src/flows/` | Reusable orchestration (guest checkout) |
| `src/tools/` | Selector extractor, POM generator, assertion generator, cross-brand diff |
| `src/coverage/` | Test-management CSV → coverage classification |
| `src/regression/` | Executable regression manifest |
| `tests/<brand>/` | Specs, one project per brand |
| `tests/config/` | Contract tests for the registry and execution settings — no browser |
| `demo-app/` | A dependency-free storefront the demo brand runs against, started by Playwright `webServer` |
| `output/` | Generated review material (git-ignored) |

---

## Getting started

Requires **Node 18+**.

```bash
npm install
npx playwright install chromium

cp .env.example .env                                                  # placeholders only
cp test-data/payment-cards.local.example.json test-data/payment-cards.local.json
```

Verify the install without touching a browser:

```bash
npm run typecheck
npm run test:config                      # registry + execution-settings contracts
```

Then run the real thing. Playwright starts the bundled demo storefront itself,
so this needs no network and no configuration:

```bash
npm run test:demo                        # 18 specs against demo-app/
npx playwright test                      # everything; placeholder brands skip
```

Other useful invocations:

```bash
npx playwright test --list               # what would run
BRAND=brand-two npx playwright test      # restrict which projects are defined at all
HEADED=true npx playwright test          # headed debugging
WORKERS=8 npx playwright test
npm run demo:serve                       # browse the demo storefront yourself
```

Authenticated specs need a saved session first:

```bash
npm run auth:setup                       # headed, one-time, writes .auth/brand-one.json
```

Guest specs run without it.

---

## Tooling

| Command | Purpose |
|---|---|
| `npm run extract -- --url <URL> --name <page>` | Inspect a rendered page, rank locator candidates, write `output/element-maps/<page>.json` and a draft page object |
| `npm run assert:gen -- --map output/element-maps/<page>.json` | Suggest visibility / text / state / a11y assertions from an element map |
| `npm run diff:brands` | Which selectors are shared across all brands, shared by some, unique to one; test-id coverage per brand |
| `npm run coverage` | Classify test-management CSV exports as Covered / Partial / Blocked / Not Covered |
| `npm run regression:manifest` | Filter to WEB + CROSS_PLATFORM, emit scaffolds per uncovered case |

Everything these produce lands in `output/` and is **review material**. Curate before committing.

---

## Locator strategy

1. `data-testid` / `data-qa`
2. Role + accessible name
3. Label
4. Stable CSS
5. XPath — last resort

Test-id coverage across the four brands is deliberately inconsistent (it mirrors reality), so role- and label-based locators are the normal path, not the fallback. **A locator matching more than one element is not stable** — scope it to a meaningful parent or revise it. Web-first assertions only; no arbitrary `waitForTimeout` in specs.

---

## Security

- No credentials, card numbers, gift card numbers, or real hostnames in the repository or its history
- `.auth/` (session cookies) and `*.local.json` (card data) are git-ignored
- `.env.example` carries placeholders only
- Nothing secret is printed to logs, written into reports, or embedded in generated specs
- `NODE_TLS_REJECT_UNAUTHORIZED=0` exists for corporate TLS interception and is documented as the security trade-off it is

---

## Status and known limitations

Stated plainly, because a framework README that hides its gaps is worth less than one that doesn't.

**Built and verified** — `27 passed, 4 skipped` on every push

- Registry, typed loader, brand narrowing, with contract tests
- Typed fixtures: `brand` option, `brandConfig`, `flags` with TTL enforcement, async consent handler, runnable-host guard
- Strict execution settings, with tests covering every rejection path
- Playwright config: per-brand projects, registry-driven `baseURL`, conditional storage state, CI/local evidence split, `data-test` test-id attribute
- Payment and gift card providers with clear failure messages
- **A working demo brand**: `demo-app/` is a dependency-free storefront (sign in → browse → cart → checkout → confirmation) that Playwright starts itself, with 18 specs covering authentication, sorting, cart arithmetic, validation and the consent race
- `BaseHomePage` + a Brand One override; smoke specs for Brand One and Brand Two
- Headed one-time auth setup

**Why four brands skip.** `brand-one`..`brand-four` point at placeholder hosts that serve nothing. Their specs skip with an explicit reason rather than failing, because an unrunnable host is a configuration fact and not a product defect. Point one at a real application and set `"runnable": true` in the registry, and its specs run.

**Roadmap** — specified in detail, not yet implemented

- Selector extractor, POM generator, assertion generator, cross-brand diff
- Coverage classifier and regression manifest
- Full guest checkout flow (pickup/delivery × ASAP/scheduled × card/gift-card/wallet)
- Full Brand One page-object set; Brand Three and Brand Four specs

**Constraints that will not change soon**

- Only the `test` environment is configured; `qa`/`uat` were designed for but are not wired
- Chromium only
- `@playwright/test` is pinned exactly, not floated — the browser build and the library version have to agree, and `allure-playwright` is pinned to the range that matches it
- Native mobile is out of scope — see [`shuriken`](https://github.com/kavikar/shuriken) for the Maestro and Appium side
- No OTP provider is built in; MFA accounts need manual completion during `auth:setup`
- Anti-bot challenges may require interaction, which is why `auth:setup` is headed
- Wallet payments can be selected for UI validation but not submitted
- Visual baselines are not committed

## Related

[**shuriken**](https://github.com/kavikar/shuriken) — the wider QA platform this framework plugs into: Maestro and Appium mobile automation, Jira/Xray test-management automation, API automation, menu validation tooling, and the CI/CD orchestration layer.

## License

MIT
