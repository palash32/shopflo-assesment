import { Page, Locator, expect } from '@playwright/test';

export class ProductDetailPage {
  readonly page: Page;

  readonly productName:        Locator;
  readonly productDescription: Locator;
  readonly productPrice:       Locator;
  readonly productImage:       Locator;
  readonly addToCartButton:    Locator;
  readonly removeButton:       Locator;
  readonly backButton:         Locator;
  readonly cartBadge:          Locator;

  constructor(page: Page) {
    this.page               = page;
    this.productName        = page.locator('.inventory_details_name');
    this.productDescription = page.locator('.inventory_details_desc');
    this.productPrice       = page.locator('.inventory_details_price');
    this.productImage       = page.locator('.inventory_details_img');
    this.addToCartButton    = page.locator('button[data-test^="add-to-cart"]');
    this.removeButton       = page.locator('button[data-test^="remove"]');
    this.backButton         = page.locator('[data-test="back-to-products"]');
    this.cartBadge          = page.locator('.shopping_cart_badge');
  }

  async addToCart() {
    await this.addToCartButton.click();
  }

  async removeFromCart() {
    await this.removeButton.click();
  }

  async goBackToProducts() {
    await this.backButton.click();
  }

  async assertProductName(name: string) {
    await expect(this.productName).toHaveText(name);
  }

  async assertProductPrice(price: string) {
    await expect(this.productPrice).toHaveText(price);
  }

  async assertImageVisible() {
    await expect(this.productImage).toBeVisible();
  }

  async assertDescriptionVisible() {
    await expect(this.productDescription).toBeVisible();
    const text = await this.productDescription.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  }

  async assertAddToCartVisible() {
    await expect(this.addToCartButton).toBeVisible();
  }

  async assertRemoveVisible() {
    await expect(this.removeButton).toBeVisible();
  }

  async assertCartBadge(count: number) {
    await expect(this.cartBadge).toHaveText(String(count));
  }
}
