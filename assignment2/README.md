# Assignment 2 – FakeStore API Test Suite

**Target:** [https://fakestoreapi.com](https://fakestoreapi.com)  
**Framework:** Playwright (API testing mode) + AJV (JSON Schema validation)

---

## Quick Start

```bash
cd assignment2
npm install
npm test                     # run all API tests
npm run test:cart            # Cart CRUD + auth
npm run test:data-driven     # data-driven product/cart tests
npm run test:contract        # schema contract tests
npm run report               # open HTML report
```

---

## Framework Choice — Why Playwright for API Testing?

Playwright is primarily known for UI automation, but its `APIRequestContext` is a
fully-featured HTTP client with first-class TypeScript support, and choosing it
here gives us one consistent toolchain across both assignments.

| Criterion | Playwright API | Supertest + Jest | Postman/Newman |
|---|---|---|---|
| Same framework as UI | ✅ One `package.json` | ❌ Separate stack | ❌ Separate runner |
| TypeScript support | ✅ Native | ✅ | ❌ Limited |
| Parallel execution | ✅ Built-in workers | Partial (--runInBand off) | ❌ |
| HTML report | ✅ Built-in | External (jest-html-reporters) | ✅ built-in |
| Schema validation hook | Bring your own (AJV) | Bring your own | Limited |
| CI integration | Single install step | Simple | Separate CLI tool |

**AJV over Pact for schema/contract testing:**  
Pact is the industry standard for **consumer-driven contract testing between two
separate deployed services** — it requires a Pact Broker and two collaborating
codebases. For this scenario (single consumer, public mock API), AJV with
version-controlled JSON Schema snapshots achieves the same goal with far less
infrastructure. The extension plan below explains when to upgrade to Pact.

---

## Test Coverage

| Suite | File | Tests | Focus |
|---|---|---|---|
| Cart CRUD – Positive | `cart-crud.spec.ts` | 14 | POST / GET / PUT / PATCH / DELETE |
| Cart – Negative | `cart-negative.spec.ts` | 9 | Edge cases, missing fields, bad IDs |
| Authentication | `cart-auth.spec.ts` | 12 | Login, JWT validation, token usage |
| Data-Driven | `products.spec.ts` | 13 | Same scenario × 3+ product/cart IDs |
| Contract | `cart-contract.spec.ts` | 14 | Schema snapshot, self-tests |
| **Total** | | **62** | |

---

## Data-Driven Testing

The `tests/data-driven/products.spec.ts` file uses a `for...of` loop over a typed
dataset — identical to Playwright's `test.each` pattern, but more readable for
objects with multiple fields.

```typescript
const PRODUCT_TEST_DATA = [
  { id: 1, expectedCategory: "men's clothing", minPrice: 100, maxPrice: 200 },
  { id: 2, expectedCategory: "men's clothing", minPrice: 20,  maxPrice: 30  },
  { id: 3, expectedCategory: "men's clothing", minPrice: 50,  maxPrice: 60  },
  // Add a row here → test runs automatically
];

for (const row of PRODUCT_TEST_DATA) {
  test(`Product ID ${row.id} – schema valid, category matches`, async ({ request }) => { ... });
}
```

**Three data-driven suites are included:**
1. `GET /products/:id` — 5 product IDs, validates schema + business rules
2. `POST /carts` with single product — 4 product IDs, validates cart response
3. `POST /carts` with multi-product — 3 cart builds, validates all products appear

---

## Schema Contract Testing (Senior Bonus)

The contract schemas live in `schemas/snapshot/`:

```
schemas/snapshot/
  cart-contract-v1.json     ← GET /carts/:id baseline
  product-contract-v1.json  ← GET /products/:id baseline
```

**Key design decisions:**

- `"additionalProperties": false` — any **new** undocumented field in the
  API response will immediately fail the contract, making breaking changes
  impossible to ship silently.
- **Self-verification tests** prove the validator works both ways — a valid
  object passes, an object with an extra or missing field fails as expected.
- Schema files are JSON, so diffs in PRs are human-readable.

**Version bump workflow:**

```
API team adds a new field to /carts/:id
   ↓
contract test fails in CI
   ↓
QA reviews: is this a breaking change or additive?
   ↓
If additive: update cart-contract-v2.json + bump $id
If breaking: block the PR
```

---

## Extension Plan

### Parallelisation

```typescript
// playwright.config.ts
workers: process.env.CI ? 8 : 4,   // increase for faster API runs
fullyParallel: true,                // already enabled
```

For CI sharding across multiple runners:

```yaml
strategy:
  matrix:
    shardIndex: [1, 2]
    shardTotal: [2]
steps:
  - run: npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
```

### Reporting

- **HTML** – already configured, uploaded as CI artifact.
- **Allure** – `npm i -D allure-playwright` for trend graphs + history.
- **Slack notification** – post JSON results summary to a channel on failure.

### Upgrading Contract Testing to Pact

When the API is owned by a separate team or service:

```
Consumer (this repo)  →  publishes Pact file to Pact Broker
Provider (API team)   →  runs provider verification against broker
                      →  CI blocks deploy if contract is broken
```

```bash
npm install -D @pact-foundation/pact
# Define interactions in tests, let Pact generate the contract JSON
# Share via https://pactflow.io (hosted broker)
```

### Environment Config

Use `.env` files + `dotenv` for switching between environments:

```env
# .env.staging
BASE_URL=https://staging.fakestoreapi.com
AUTH_USERNAME=test_user
```

```typescript
// playwright.config.ts
use: { baseURL: process.env.BASE_URL ?? 'https://fakestoreapi.com' }
```
