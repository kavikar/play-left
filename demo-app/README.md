# demo-app

A dependency-free storefront that `brand-demo` runs against.

## Why this exists

A framework demo needs a target. The obvious choices are a public practice site
(saucedemo, the-internet) or nothing at all. Both are worse than this:

- **A public site** makes CI depend on somebody else's markup. The day they
  rename a `data-test` attribute, this repository goes red through no fault of
  its own — and a portfolio repo with a red badge is worse than one with none.
- **No target** means the framework can only be read, never run. Contract tests
  prove the registry loads; they prove nothing about whether the page objects,
  fixtures and flows actually work against a browser.

So the target ships with the framework. Playwright's `webServer` starts it,
tests run against `http://127.0.0.1:4173`, and the whole suite is green offline.

## What it covers

Deliberately shaped like a real commerce journey, so the page objects are
realistic rather than toys:

| Page | Exercises |
|---|---|
| `index.html` | Sign in, bad password, locked-out account, required fields |
| `inventory.html` | Product listing, five sort modes, add/remove, header cart count |
| `cart.html` | Line items, removal, empty state, disabled checkout |
| `checkout.html` | Contact validation, subtotal/tax/total arithmetic |
| `complete.html` | Order reference and total, for evidence capture |

It also renders a consent banner ~600ms after load. That delay is the point:
it reproduces the race a real consent banner creates, and proves the locator
handler in `fixtures/brand.fixture.ts` genuinely handles it rather than the
suite passing because the banner happened not to overlap anything.

## Running it by hand

```bash
npm run demo:serve      # http://127.0.0.1:4173
```

Sign in with `standard_user` / `demo_password`. `locked_out_user` is rejected
on purpose, for negative-path coverage.

## What it is not

Not a product, not a reference implementation, and not something to extend
beyond what the specs need. State lives in `localStorage`; there is no backend,
no build step, and no dependency. If a test needs a behaviour this app does not
have, add the smallest thing that makes the test meaningful.
