import { test, expect } from '@playwright/test';
import { LoginPage }     from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { USERS, PRODUCTS } from '../../utils/test-data';

test.describe('Inventory', () => {

  let login:     LoginPage;
  let inventory: InventoryPage;

  test.beforeEach(async ({ page }) => {
    login     = new LoginPage(page);
    inventory = new InventoryPage(page);
    await login.goto();
    await login.login(USERS.STANDARD.username, USERS.STANDARD.password);
  });

  test('@positive TC-INV-001 | All 6 products are displayed', async () => {
    await inventory.assertProductCount(6);
  });

  test('@positive TC-INV-002 | Every product card shows a non-empty name', async ({ page }) => {
    const names = await page.locator('.inventory_item_name').allTextContents();
    expect(names).toHaveLength(6);
    names.forEach(n => expect(n.trim().length).toBeGreaterThan(0));
  });

  test('@positive TC-INV-003 | Every product card shows a price in $X.XX format', async ({ page }) => {
    const prices = await page.locator('.inventory_item_price').allTextContents();
    expect(prices).toHaveLength(6);
    prices.forEach(p => expect(p).toMatch(/^\$\d+\.\d{2}$/));
  });

  test('@positive TC-INV-004 | Every product card renders an image', async ({ page }) => {
    const images = page.locator('.inventory_item_img img');
    await expect(images).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      expect(src).toBeTruthy();
    }
  });

  test('@positive TC-INV-005 | Add to Cart button visible for each item', async ({ page }) => {
    const addToCartButtons = page.locator('button[data-test^="add-to-cart"]');
    await expect(addToCartButtons).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      await expect(addToCartButtons.nth(i)).toBeVisible();
    }
  });

  test('@positive TC-INV-006 | Sort A → Z', async () => {
    await inventory.sortBy('az');
    await inventory.assertSortedAZ();
  });

  test('@positive TC-INV-007 | Sort Z → A', async () => {
    await inventory.sortBy('za');
    await inventory.assertSortedZA();
  });

  test('@positive TC-INV-008 | Sort price low → high', async () => {
    await inventory.sortBy('lohi');
    await inventory.assertSortedPriceLowHigh();
  });

  test('@positive TC-INV-009 | Sort price high → low', async () => {
    await inventory.sortBy('hilo');
    await inventory.assertSortedPriceHighLow();
  });

  test('@positive TC-INV-017 | Sort dropdown has 4 options', async ({ page }) => {
    const options = await page.locator('[data-test="product-sort-container"] option').allTextContents();
    expect(options).toEqual([
      'Name (A to Z)',
      'Name (Z to A)',
      'Price (low to high)',
      'Price (high to low)',
    ]);
  });

  test('@positive TC-INV-010 | Cart badge shows 1 after adding one item', async () => {
    await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
    await inventory.assertCartBadge(1);
  });

  test('@positive TC-INV-011 | Add-to-cart button becomes Remove after adding', async () => {
    await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
    await inventory.assertProductInCart(PRODUCTS.BACKPACK.name);
  });

  test('@positive TC-INV-012 | Cart badge shows 3 after adding 3 items', async () => {
    await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
    await inventory.addToCartByName(PRODUCTS.BIKE_LIGHT.name);
    await inventory.addToCartByName(PRODUCTS.BOLT_T_SHIRT.name);
    await inventory.assertCartBadge(3);
  });

  test('@positive TC-INV-013 | Remove from inventory decrements badge', async () => {
    await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
    await inventory.addToCartByName(PRODUCTS.BIKE_LIGHT.name);
    await inventory.removeFromInventoryByName(PRODUCTS.BACKPACK.name);
    await inventory.assertCartBadge(1);
  });

  test('@positive TC-INV-014 | Badge disappears when last item removed', async () => {
    await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
    await inventory.removeFromInventoryByName(PRODUCTS.BACKPACK.name);
    await inventory.assertCartBadgeAbsent();
  });

  test('@positive TC-INV-015 | Cart icon navigates to cart page', async ({ page }) => {
    await inventory.goToCart();
    await expect(page).toHaveURL('/cart.html');
  });

  test('@negative TC-INV-016 | problem_user sees identical product images', async ({ page }) => {
    await page.goto('/');
    const problemLogin = new LoginPage(page);
    await problemLogin.login(USERS.PROBLEM.username, USERS.PROBLEM.password);

    const images = page.locator('.inventory_item_img img');
    const srcs: string[] = [];
    for (let i = 0; i < 6; i++) {
      const src = await images.nth(i).getAttribute('src');
      srcs.push(src ?? '');
    }
    const uniqueSrcs = new Set(srcs);
    // problem_user shows the same image for all products
    expect(uniqueSrcs.size).toBeLessThanOrEqual(1);
  });

});
