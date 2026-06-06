import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { USERS, PRODUCTS, CHECKOUT, CHECKOUT_ERRORS } from '../../utils/test-data';

test.describe('Checkout', () => {

  let login: LoginPage;
  let inventory: InventoryPage;
  let cart: CartPage;
  let checkout: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    inventory = new InventoryPage(page);
    cart = new CartPage(page);
    checkout = new CheckoutPage(page);

    await login.goto();
    await login.login(USERS.STANDARD.username, USERS.STANDARD.password);
    await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
    await inventory.goToCart();
    await cart.clickCheckout();
    await checkout.assertOnStep1();
  });

  test('@positive TC-CO-001 | Checkout step 1 form is visible', async ({ page }) => {
    await expect(page.locator('[data-test="firstName"]')).toBeVisible();
    await expect(page.locator('[data-test="lastName"]')).toBeVisible();
    await expect(page.locator('[data-test="postalCode"]')).toBeVisible();
    await expect(page.locator('[data-test="continue"]')).toBeVisible();
    await expect(page.locator('[data-test="cancel"]')).toBeVisible();
  });

  test('@positive TC-CO-002 | Valid info navigates to step 2 overview', async () => {
    await checkout.fillAndContinue(
      CHECKOUT.VALID.firstName,
      CHECKOUT.VALID.lastName,
      CHECKOUT.VALID.postalCode
    );
    await checkout.assertOnStep2();
  });

  test('@positive TC-CO-008 | Step 2 shows cart item', async () => {
    await checkout.fillAndContinue(
      CHECKOUT.VALID.firstName, CHECKOUT.VALID.lastName, CHECKOUT.VALID.postalCode
    );
    await checkout.assertSummaryItemCount(1);
  });

  test('@positive TC-CO-0009 | Step 2 shows item total, tax, and grand total', async ({ page }) => {
    await checkout.fillAndContinue(
      CHECKOUT.VALID.firstName, CHECKOUT.VALID.lastName, CHECKOUT.VALID.postalCode
    );
    await expect(page.locator('.summary_subtotal_label')).toBeVisible();
    await expect(page.locator('.summary_tax_label')).toBeVisible();
    await expect(page.locator('.summary_total_label')).toBeVisible();
  });

  test('@positive TC-CO-010 | Grand total equals item total plus tax', async () => {
    await checkout.fillAndContinue(
      CHECKOUT.VALID.firstName, CHECKOUT.VALID.lastName, CHECKOUT.VALID.postalCode
    );
    await checkout.assertCorrectTotalCalculation();
  });

  test('@positive TC-CO-011 | Finish button completes the order', async () => {
    await checkout.fillAndContinue(
      CHECKOUT.VALID.firstName, CHECKOUT.VALID.lastName, CHECKOUT.VALID.postalCode
    );
    await checkout.clickFinish();
    await checkout.assertOnComplete();
    await checkout.assertCompleteHeader('Thank you for your order!');
  });

  test('@positive TC-CO-012 | Order confirmation page shows success message', async ({ page }) => {
    await checkout.fillAndContinue(
      CHECKOUT.VALID.firstName, CHECKOUT.VALID.lastName, CHECKOUT.VALID.postalCode
    );
    await checkout.clickFinish();
    await checkout.assertOnComplete();
    await checkout.assertCompleteHeader('Thank you for your order!');
    await expect(page.locator('.complete-text')).toBeVisible();
    await expect(page.locator('.complete-text')).toContainText('Your order has been dispatched');
    await expect(page.locator('img.pony_express')).toBeVisible();
  });

  test('@positive TC-CO-013 | Back Home returns to inventory after order', async ({ page }) => {
    await checkout.fillAndContinue(
      CHECKOUT.VALID.firstName, CHECKOUT.VALID.lastName, CHECKOUT.VALID.postalCode
    );
    await checkout.clickFinish();
    await checkout.clickBackHome();
    await expect(page).toHaveURL('/inventory.html');
  });

  test('@positive TC-CO-016 | Cart is cleared after order completion', async () => {
    await checkout.fillAndContinue(
      CHECKOUT.VALID.firstName, CHECKOUT.VALID.lastName, CHECKOUT.VALID.postalCode
    );
    await checkout.clickFinish();
    await checkout.clickBackHome();
    const inventoryPage = new InventoryPage(checkout.page);
    await inventoryPage.assertCartBadgeAbsent();
  });

  test('@positive TC-CO-007 | Cancel on step 1 returns to cart', async ({ page }) => {
    await checkout.clickCancelStep1();
    await expect(page).toHaveURL('/cart.html');
  });

  test('@positive TC-CO-014 | Cancel on step 2 returns to inventory', async ({ page }) => {
    await checkout.fillAndContinue(
      CHECKOUT.VALID.firstName, CHECKOUT.VALID.lastName, CHECKOUT.VALID.postalCode
    );
    await checkout.clickCancelStep2();
    await expect(page).toHaveURL('/inventory.html');
  });

  test('@positive TC-CO-015 | Error banner dismissed via X button', async () => {
    await checkout.clickContinue();  // no fields filled → triggers error
    await checkout.assertErrorContains(CHECKOUT_ERRORS.FIRST_NAME);
    await checkout.dismissError();
    await checkout.assertErrorDismissed();
  });

  test('@negative TC-CO-003 | Empty first name shows validation error', async () => {
    await checkout.fillAndContinue(
      CHECKOUT.INVALID.EMPTY_FIRST.firstName,
      CHECKOUT.INVALID.EMPTY_FIRST.lastName,
      CHECKOUT.INVALID.EMPTY_FIRST.postalCode
    );
    await checkout.assertErrorContains(CHECKOUT_ERRORS.FIRST_NAME);
    await checkout.assertOnStep1();
  });

  test('@negative TC-CO-004 | Empty last name shows validation error', async () => {
    await checkout.fillAndContinue(
      CHECKOUT.INVALID.EMPTY_LAST.firstName,
      CHECKOUT.INVALID.EMPTY_LAST.lastName,
      CHECKOUT.INVALID.EMPTY_LAST.postalCode
    );
    await checkout.assertErrorContains(CHECKOUT_ERRORS.LAST_NAME);
    await checkout.assertOnStep1();
  });

  test('@negative TC-CO-005 | Empty postal code shows validation error', async () => {
    await checkout.fillAndContinue(
      CHECKOUT.INVALID.EMPTY_ZIP.firstName,
      CHECKOUT.INVALID.EMPTY_ZIP.lastName,
      CHECKOUT.INVALID.EMPTY_ZIP.postalCode
    );
    await checkout.assertErrorContains(CHECKOUT_ERRORS.POSTAL_CODE);
    await checkout.assertOnStep1();
  });

  test('@negative TC-CO-006 | All empty fields shows first-name error', async () => {
    await checkout.fillAndContinue(
      CHECKOUT.INVALID.ALL_EMPTY.firstName,
      CHECKOUT.INVALID.ALL_EMPTY.lastName,
      CHECKOUT.INVALID.ALL_EMPTY.postalCode
    );
    await checkout.assertErrorContains(CHECKOUT_ERRORS.FIRST_NAME);
    await checkout.assertOnStep1();
  });

});
