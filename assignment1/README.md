# Assignment 1 – SauceDemo UI Automation

**Target:** [https://www.saucedemo.com](https://www.saucedemo.com)  
**Framework:** Playwright + TypeScript  
**Pattern:** Page Object Model (POM)

---

## Quick Start

```bash
cd assignment1
npm install
npx playwright install chromium firefox   # install browsers
npm test                                   # run all tests
npm run report                             # open HTML report
```

**Run by tag:**

```bash
npx playwright test --grep @positive    # positive tests only
npx playwright test --grep @negative    # negative tests only
npx playwright test --grep @e2e         # end-to-end flows
```

**Run by module:**

```bash
npm run test:auth       # login / authentication
npm run test:inventory  # product listing & sorting
npm run test:cart       # cart CRUD
npm run test:checkout   # checkout forms & flows
npm run test:e2e        # full purchase scenarios
```

---

## Framework Choice — Why Playwright?

| Criterion | Playwright | Selenium |
|---|---|---|
| Auto-wait | Built-in smart waiting; zero `Thread.sleep` | Explicit waits required everywhere |
| Selectors | `data-test` attrs, role-based, text — resilient by default | XPath / CSS only |
| TypeScript | First-class support; full IntelliSense | Limited |
| Parallelisation | `fullyParallel: true` in config; per-file workers | External Grid/TestNG needed |
| Debugging | Trace Viewer, Playwright Inspector, video replay | Remote debugging complexity |
| CI Integration | Single `npx playwright install` step | Driver management, binary path issues |
| Network | Intercept/mock at network level natively | Third-party proxy needed |
| Cross-browser | Chromium, Firefox, WebKit from same API | Driver per browser |

**Design decisions:**

- **POM** (`pages/`) decouples locators from test logic. Changing a selector means editing one file.  
- **`data-test` attributes** used throughout — the most stable selectors on SauceDemo.  
- **`utils/test-data.ts`** keeps all credentials, URLs, and expected strings in one place — easy to update for a different environment.  
- **Tags** (`@positive`, `@negative`, `@e2e`) enable selective runs without separate config files.

---

## Test Coverage

| Module | Total | Positive | Negative |
|---|---|---|---|
| Authentication | 13 | 6 | 7 |
| Inventory | 17 | 16 | 1 |
| Cart | 13 | 11 | 2 |
| Checkout | 16 | 12 | 4 |
| E2E Flows | 5 | 5 | — |
| **Total** | **64** | **50** | **14** |

---

## Extension Plan

### Parallelisation

The config already sets `fullyParallel: true`. To scale:

```typescript
// playwright.config.ts
workers: process.env.CI ? 8 : 4,   // increase worker count
```

For even more speed, shard across machines (GitHub Actions matrix):

```yaml
# ci.yml
strategy:
  matrix:
    shardIndex: [1, 2, 3, 4]
    shardTotal: [4]
steps:
  - run: npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
```

### Reporting

- **HTML** – already configured; artifacts uploaded in CI.  
- **Allure** – add `allure-playwright` for rich history, trend graphs, and screenshots attached to failures.  

```bash
npm install -D allure-playwright
# playwright.config.ts → reporter: [['allure-playwright']]
npx allure generate allure-results --clean && npx allure open
```

- **Slack / Teams notifications** – pipe the JSON results (`test-results/results.json`) into a notification action post-run.

### Cross-Browser

Uncomment the `webkit` and `mobile-chrome` projects in `playwright.config.ts` to expand coverage to Safari and mobile viewports with zero extra test code.

### Visual Regression

```bash
npm install -D @playwright/test  # already there
# Use page.screenshot() + toMatchSnapshot() for pixel-diff baseline testing
```
