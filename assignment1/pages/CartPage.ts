import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  readonly page: Page;

  readonly pageTitle:        Locator;
  readonly cartItems:        Locator;
  readonly continueButton:   Locator;
  readonly checkoutButton:   Locator;
  readonly cartBadge:        Locator;

  constructor(page: Page) {
    this.page            = page;
    this.pageTitle       = page.locator('.title');
    this.cartItems       = page.locator('.cart_item');
    this.continueButton  = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton  = page.locator('[data-test="checkout"]');
    this.cartBadge       = page.locator('.shopping_cart_badge');
  }

  async goto() {
    await this.page.goto('/cart.html');
  }

  async removeItemByName(productName: string) {
    const item = this.page.locator('.cart_item', {
      has: this.page.locator('.inventory_item_name', { hasText: productName }),
    });
    await item.locator('button[data-test^="remove"]').click();
  }

  async clickContinueShopping() {
    await this.continueButton.click();
  }

  async clickCheckout() {
    await this.checkoutButton.click();
  }

  async assertOnCartPage() {
    await expect(this.page).toHaveURL('/cart.html');
    await expect(this.pageTitle).toHaveText('Your Cart');
  }

  async assertItemCount(count: number) {
    await expect(this.cartItems).toHaveCount(count);
  }

  async assertItemPresent(productName: string) {
    const item = this.page.locator('.cart_item', {
      has: this.page.locator('.inventory_item_name', { hasText: productName }),
    });
    await expect(item).toBeVisible();
  }

  async assertItemAbsent(productName: string) {
    const item = this.page.locator('.cart_item', {
      has: this.page.locator('.inventory_item_name', { hasText: productName }),
    });
    await expect(item).not.toBeVisible();
  }

  async assertItemPrice(productName: string, expectedPrice: string) {
    const item = this.page.locator('.cart_item', {
      has: this.page.locator('.inventory_item_name', { hasText: productName }),
    });
    await expect(item.locator('.inventory_item_price')).toHaveText(expectedPrice);
  }

  async assertItemQuantity(productName: string, qty: string) {
    const item = this.page.locator('.cart_item', {
      has: this.page.locator('.inventory_item_name', { hasText: productName }),
    });
    await expect(item.locator('.cart_quantity')).toHaveText(qty);
  }

  async assertCartBadge(count: number) {
    await expect(this.cartBadge).toHaveText(String(count));
  }

  async assertCartBadgeAbsent() {
    await expect(this.cartBadge).not.toBeVisible();
  }
}
