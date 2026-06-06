import { test, expect } from '@playwright/test';
import { LoginPage }     from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage }      from '../../pages/CartPage';
import { CheckoutPage }  from '../../pages/CheckoutPage';
import { MenuPage }      from '../../pages/MenuPage';
import { USERS, PRODUCTS, CHECKOUT, INVALID_CREDS } from '../../utils/test-data';

async function completePurchase(
  inventory: InventoryPage,
  cart:      CartPage,
  checkout:  CheckoutPage,
  productNames: string[],
) {
  for (const name of productNames) {
    await inventory.addToCartByName(name);
  }
  await inventory.goToCart();
  await cart.clickCheckout();
  await checkout.fillAndContinue(
    CHECKOUT.VALID.firstName,
    CHECKOUT.VALID.lastName,
    CHECKOUT.VALID.postalCode
  );
  await checkout.clickFinish();
  await checkout.assertOnComplete();
  await checkout.assertCompleteHeader('Thank you for your order!');
}

test.describe('E2E - Purchase Flows', () => {

  let login:     LoginPage;
  let inventory: InventoryPage;
  let cart:      CartPage;
  let checkout:  CheckoutPage;
  let menu:      MenuPage;

  test.beforeEach(async ({ page }) => {
    login     = new LoginPage(page);
    inventory = new InventoryPage(page);
    cart      = new CartPage(page);
    checkout  = new CheckoutPage(page);
    menu      = new MenuPage(page);

    await login.goto();
    await login.login(USERS.STANDARD.username, USERS.STANDARD.password);
    await inventory.assertOnInventoryPage();
  });

  test('@e2e E2E-001 | Complete purchase - single item (Backpack)', async () => {
    await completePurchase(inventory, cart, checkout, [PRODUCTS.BACKPACK.name]);
  });

  test('@e2e E2E-002 | Complete purchase - multiple items (3 products)', async ({ page }) => {
    const items = [PRODUCTS.BACKPACK.name, PRODUCTS.BIKE_LIGHT.name, PRODUCTS.BOLT_T_SHIRT.name];
    for (const name of items) await inventory.addToCartByName(name);
    await inventory.assertCartBadge(3);
    await inventory.goToCart();
    await cart.assertItemCount(3);
    await cart.clickCheckout();
    await checkout.fillAndContinue(
      CHECKOUT.VALID.firstName, CHECKOUT.VALID.lastName, CHECKOUT.VALID.postalCode
    );
    await checkout.assertCorrectTotalCalculation();
    await checkout.clickFinish();
    await checkout.assertOnComplete();
  });

  test('@e2e E2E-003 | Cart management - add, remove, re-add, then purchase', async ({ page }) => {
    await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
    await inventory.removeFromInventoryByName(PRODUCTS.BACKPACK.name);
    await inventory.assertCartBadgeAbsent();

    await inventory.addToCartByName(PRODUCTS.BIKE_LIGHT.name);
    await inventory.goToCart();
    await cart.removeItemByName(PRODUCTS.BIKE_LIGHT.name);
    await cart.clickContinueShopping();

    await inventory.addToCartByName(PRODUCTS.ONESIE.name);
    await inventory.goToCart();
    await cart.assertItemCount(1);
    await cart.assertItemPresent(PRODUCTS.ONESIE.name);

    await cart.clickCheckout();
    await checkout.fillAndContinue(
      CHECKOUT.VALID.firstName, CHECKOUT.VALID.lastName, CHECKOUT.VALID.postalCode
    );
    await checkout.clickFinish();
    await checkout.assertOnComplete();
  });

  test('@e2e E2E-004 | Sort by price (low→high) and purchase cheapest item', async ({ page }) => {
    await inventory.sortBy('lohi');
    await inventory.assertSortedPriceLowHigh();
    const firstItem = page.locator('.inventory_item').first();
    const firstName = await firstItem.locator('.inventory_item_name').textContent();
    expect(firstName?.trim()).toBe(PRODUCTS.ONESIE.name);

    await inventory.addToCartByName(PRODUCTS.ONESIE.name);
    await inventory.goToCart();
    await cart.clickCheckout();
    await checkout.fillAndContinue(
      CHECKOUT.VALID.firstName, CHECKOUT.VALID.lastName, CHECKOUT.VALID.postalCode
    );
    await checkout.assertItemTotalText('$7.99');
    await checkout.clickFinish();
    await checkout.assertOnComplete();
  });

  test('@e2e E2E-005 | Navigate product detail -> add from detail -> purchase', async ({ page }) => {
    await inventory.openProductByName(PRODUCTS.BACKPACK.name);
    await expect(page).toHaveURL(/inventory-item/);
    const productName = page.locator('.inventory_details_name');
    await expect(productName).toHaveText(PRODUCTS.BACKPACK.name);
    await page.locator('button[data-test^="add-to-cart"]').click();
    await page.locator('.shopping_cart_link').click();
    await cart.assertOnCartPage();
    await cart.assertItemPresent(PRODUCTS.BACKPACK.name);

    await cart.clickCheckout();
    await checkout.fillAndContinue(
      CHECKOUT.VALID.firstName, CHECKOUT.VALID.lastName, CHECKOUT.VALID.postalCode
    );
    await checkout.clickFinish();
    await checkout.assertOnComplete();
  });

});
