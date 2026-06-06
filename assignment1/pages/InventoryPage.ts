import { Page, Locator, expect } from '@playwright/test';

type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly page: Page;
  readonly pageTitle:    Locator;
  readonly productCards: Locator;
  readonly sortSelect:   Locator;
  readonly cartBadge:    Locator;
  readonly cartIcon:     Locator;
  readonly burgerMenu:   Locator;

  constructor(page: Page) {
    this.page         = page;
    this.pageTitle    = page.locator('.title');
    this.productCards = page.locator('.inventory_item');
    this.sortSelect   = page.locator('[data-test="product-sort-container"]');
    this.cartBadge    = page.locator('.shopping_cart_badge');
    this.cartIcon     = page.locator('.shopping_cart_link');
    this.burgerMenu   = page.locator('#react-burger-menu-btn');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  async addToCartByName(productName: string) {
    const card = this.page.locator('.inventory_item', {
      has: this.page.locator('.inventory_item_name', { hasText: productName }),
    });
    await card.locator('button[data-test^="add-to-cart"]').click();
  }

  async removeFromInventoryByName(productName: string) {
    const card = this.page.locator('.inventory_item', {
      has: this.page.locator('.inventory_item_name', { hasText: productName }),
    });
    await card.locator('button[data-test^="remove"]').click();
  }

  async sortBy(option: SortOption) {
    await this.sortSelect.selectOption(option);
  }

  async openProductByName(productName: string) {
    await this.page.locator('.inventory_item_name', { hasText: productName }).click();
  }

  async goToCart() {
    await this.cartIcon.click();
  }

  async openBurgerMenu() {
    await this.burgerMenu.click();
  }

  async assertOnInventoryPage() {
    await expect(this.page).toHaveURL('/inventory.html');
    await expect(this.pageTitle).toHaveText('Products');
  }

  async assertProductCount(count: number) {
    await expect(this.productCards).toHaveCount(count);
  }

  async assertCartBadge(count: number) {
    await expect(this.cartBadge).toHaveText(String(count));
  }

  async assertCartBadgeAbsent() {
    await expect(this.cartBadge).not.toBeVisible();
  }

  async getProductNames(): Promise<string[]> {
    return this.page.locator('.inventory_item_name').allTextContents();
  }

  async getProductPrices(): Promise<number[]> {
    const texts = await this.page.locator('.inventory_item_price').allTextContents();
    return texts.map(t => parseFloat(t.replace('$', '')));
  }

  async assertSortedAZ() {
    const names = await this.getProductNames();
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  }

  async assertSortedZA() {
    const names = await this.getProductNames();
    const sorted = [...names].sort().reverse();
    expect(names).toEqual(sorted);
  }

  async assertSortedPriceLowHigh() {
    const prices = await this.getProductPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  }

  async assertSortedPriceHighLow() {
    const prices = await this.getProductPrices();
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sorted);
  }

  async assertProductInCart(productName: string) {
    const card = this.page.locator('.inventory_item', {
      has: this.page.locator('.inventory_item_name', { hasText: productName }),
    });
    await expect(card.locator('button[data-test^="remove"]')).toBeVisible();
  }

  async assertProductNotInCart(productName: string) {
    const card = this.page.locator('.inventory_item', {
      has: this.page.locator('.inventory_item_name', { hasText: productName }),
    });
    await expect(card.locator('button[data-test^="add-to-cart"]')).toBeVisible();
  }
}
