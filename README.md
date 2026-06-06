# Shopflo QA Assessment

**Candidate:** Palash Mishra  
**Submission:** Manual Test Cases + UI Automation (Playwright) + API Test Suite

---

## Repository Structure

```
shopflo-qa-assessment/
├── SauceDemo_Test_Cases.xlsx       ← Manual test cases (83 TCs across 7 modules)
│
├── assignment1/                    ← UI automation – saucedemo.com
│   ├── pages/                      # Page Object Model
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── ProductDetailPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutPage.ts
│   │   └── MenuPage.ts
│   ├── tests/
│   │   ├── auth/login.spec.ts
│   │   ├── inventory/inventory.spec.ts
│   │   ├── cart/cart.spec.ts
│   │   ├── checkout/checkout.spec.ts
│   │   └── e2e/purchase-flow.spec.ts
│   ├── utils/test-data.ts
│   ├── playwright.config.ts
│   └── README.md
│
├── assignment2/                    ← API automation – fakestoreapi.com
│   ├── tests/
│   │   ├── cart/cart-crud.spec.ts
│   │   ├── cart/cart-negative.spec.ts
│   │   ├── cart/cart-auth.spec.ts
│   │   ├── data-driven/products.spec.ts
│   │   └── contract/cart-contract.spec.ts
│   ├── utils/
│   │   ├── api-helpers.ts
│   │   └── schema-validator.ts
│   ├── schemas/snapshot/           # Contract baseline JSON Schemas
│   │   ├── cart-contract-v1.json
│   │   └── product-contract-v1.json
│   ├── playwright.config.ts
│   └── README.md
│
└── .github/workflows/ci.yml        ← GitHub Actions (runs on every push)
```

---

## Manual Test Cases (SauceDemo_Test_Cases.xlsx)

| Module | TCs | Positive | Negative |
|---|---|---|---|
| Login / Auth | 13 | 6 | 7 |
| Inventory | 17 | 16 | 1 |
| Product Detail | 10 | 9 | 1 |
| Cart | 13 | 11 | 2 |
| Checkout | 16 | 12 | 4 |
| Navigation | 9 | 9 | 0 |
| E2E Scenarios | 5 | 5 | — |
| **Total** | **83** | **63** | **20** |

Columns: TC ID · Module · Title · Type · Priority · Severity · Pre-conditions · Steps · Expected · Actual · Status · Comments

---

## Automated Tests

### Assignment 1 – SauceDemo UI

```bash
cd assignment1 && npm install
npx playwright install chromium firefox
npm test                      # all tests
npx playwright test --grep @positive
npx playwright test --grep @negative
npx playwright test --grep @e2e
```

| Module | Tests |
|---|---|
| Auth (login / logout) | 13 |
| Inventory | 17 |
| Cart | 13 |
| Checkout | 16 |
| E2E flows | 5 |
| **Total** | **64** |

### Assignment 2 – FakeStore API

```bash
cd assignment2 && npm install
npm test                      # all API + contract tests
npm run test:cart             # CRUD + auth
npm run test:data-driven      # 13 parameterised tests
npm run test:contract         # schema contract (senior bonus)
```

| Suite | Tests |
|---|---|
| Cart CRUD – Positive | 14 |
| Cart – Negative | 9 |
| Authentication | 12 |
| Data-Driven (products × cart) | 13 |
| Contract / Schema | 14 |
| **Total** | **62** |

---

## CI / CD

Every push to `main`, `develop`, or any `feat/**` branch triggers the workflow.

```
.github/workflows/ci.yml
  ├── assignment1-ui-tests  (matrix: chromium + firefox, parallel)
  ├── assignment2-api-tests (Cart CRUD + data-driven + contract)
  └── all-tests-passed      (gate — fails if any job failed)
```

HTML reports are uploaded as GitHub Actions artifacts and kept for 14 days.
