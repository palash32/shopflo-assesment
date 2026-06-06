import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { USERS, PRODUCTS } from '../../utils/test-data';

test.describe('Cart', () => {

  let login: LoginPage;
  let inventory: InventoryPage;
  let cart: CartPage;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    inventory = new InventoryPage(page);
    cart = new CartPage(page);

    await login.goto();
    await login.login(USERS.STANDARD.username, USERS.STANDARD.password);
  });

  test('@positive TC-CART-001 | Cart page accessible via cart icon', async ({ page }) => {
    await inventory.goToCart();
    await cart.assertOnCartPage();
  });

  test('@positive TC-CART-002 | Added product appears in cart', async () => {
    await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
    await inventory.goToCart();
    await cart.assertItemPresent(PRODUCTS.BACKPACK.name);
  });

  test('@positive TC-CART-003 | Cart shows quantity 1 per added item', async () => {
    await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
    await inventory.goToCart();
    await cart.assertItemQuantity(PRODUCTS.BACKPACK.name, '1');
  });

  test('@positive TC-CART-004 | Item price correct in cart', async () => {
    await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
    await inventory.goToCart();
    await cart.assertItemPrice(PRODUCTS.BACKPACK.name, `$${PRODUCTS.BACKPACK.price.toFixed(2)}`);
  });

  test('@positive TC-CART-009 | Multiple items display correctly in cart', async () => {
    await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
    await inventory.addToCartByName(PRODUCTS.BIKE_LIGHT.name);
    await inventory.addToCartByName(PRODUCTS.BOLT_T_SHIRT.name);
    await inventory.goToCart();

    await cart.assertItemCount(3);
    await cart.assertItemPresent(PRODUCTS.BACKPACK.name);
    await cart.assertItemPresent(PRODUCTS.BIKE_LIGHT.name);
    await cart.assertItemPresent(PRODUCTS.BOLT_T_SHIRT.name);
  });

  test('@positive TC-CART-005 | Remove item from cart page', async () => {
    await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
    await inventory.goToCart();
    await cart.removeItemByName(PRODUCTS.BACKPACK.name);
    await cart.assertItemAbsent(PRODUCTS.BACKPACK.name);
  });

  test('@positive TC-CART-006 | Cart badge decrements after removing one item', async () => {
    await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
    await inventory.addToCartByName(PRODUCTS.BIKE_LIGHT.name);
    await inventory.goToCart();
    await cart.removeItemByName(PRODUCTS.BACKPACK.name);
    await cart.assertCartBadge(1);
  });

  test('@positive TC-CART-007 | Cart badge disappears when cart becomes empty', async () => {
    await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
    await inventory.goToCart();
    await cart.removeItemByName(PRODUCTS.BACKPACK.name);
    await cart.assertCartBadgeAbsent();
  });

  test('@positive TC-CART-008 | Continue Shopping returns to inventory', async ({ page }) => {
    await inventory.goToCart();
    await cart.clickContinueShopping();
    await expect(page).toHaveURL('/inventory.html');
  });

  test('@positive TC-CART-011 | Checkout button navigates to checkout step 1', async ({ page }) => {
    await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
    await inventory.goToCart();
    await cart.clickCheckout();
    await expect(page).toHaveURL('/checkout-step-one.html');
  });

  test('@positive TC-CART-010 | Cart persists after navigating away', async () => {
    await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
    await inventory.openProductByName(PRODUCTS.BACKPACK.name);
    await inventory.goToCart();
    await cart.assertItemPresent(PRODUCTS.BACKPACK.name);
  });

  test('@negative TC-CART-012 | Empty cart shows no items', async () => {
    await inventory.goToCart();
    await cart.assertItemCount(0);
  });

  test('@negative TC-CART-013 | Checkout Empty cart', async ({ page }) => {
    await inventory.goToCart();
    await cart.clickCheckout();
    await expect(page).toHaveURL('/checkout-step-one.html');
  });

});
