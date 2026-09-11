# Roadmap

Ordered by what unblocks the most downstream work. Each item is fully specified
in the build prompt this framework was extracted from.

## 1. Selector tooling
- [ ] `src/tools/dom-extract.ts` — in-page DOM inspection
- [ ] `src/tools/selector-extractor.ts` — rank candidates by test-id → role+name → label → CSS → XPath, record visibility and uniqueness
- [ ] `src/tools/pom-generator.ts` — draft page object from an element map
- [ ] `src/tools/extract-cli.ts` — `--url --name [--auth] [--headed] [--wait-for]`
- [ ] `src/types/element.ts`

## 2. Assertion generation
- [ ] `src/tools/assertion-generator.ts` — visibility, text, state, attribute, negative, API status, visual, a11y via `@axe-core/playwright`
- [ ] `src/tools/assertion-cli.ts`
- [ ] `src/types/assertion.ts`

## 3. Cross-brand analysis
- [ ] `src/tools/cross-brand-diff.ts` — shared / partial / unique selectors, test-id coverage %, low-coverage warnings
- [ ] `src/tools/cross-brand-diff-cli.ts`

## 4. Page objects and flows
- [ ] Brand One set: auth, menu, PLP, PDP, ordering, combo, checkout, confirmation, store selection, rewards, login, locations, gift cards, bag
- [ ] `src/flows/GuestCheckoutFlow.ts` — pickup/delivery × ASAP/scheduled × card/gift-card/wallet, with explicit errors for invalid combinations
- [ ] Brand Three and Brand Four smoke specs

## 5. Coverage and regression
- [ ] `src/coverage/jiraCoverage.ts` — CSV parsing that survives BOM, duplicate headers, multiline descriptions, variable column counts
- [ ] Platform classification: APP / WEB / CROSS_PLATFORM / UNKNOWN
- [ ] Step → page-object capability mapping
- [ ] `src/regression/regressionManifest.ts` — WEB + CROSS_PLATFORM only, scaffold per uncovered case

## 6. Knowledge cache
- [ ] `src/knowledge/cache.ts` — `getFresh()` / `writeCache()`, cache-first with explicit staleness
- [ ] `src/tools/menu-catalog-cli.ts`, `src/tools/rewards-catalog-cli.ts`

## 7. CI
- [ ] Workflow running `typecheck` + the `config` project on every push
- [ ] Allure history retention across runs
