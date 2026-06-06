import { Page, Locator, expect } from '@playwright/test';

export class MenuPage {
  readonly page: Page;

  readonly burgerMenuButton: Locator;
  readonly closeMenuButton:  Locator;
  readonly allItemsLink:     Locator;
  readonly aboutLink:        Locator;
  readonly logoutLink:       Locator;
  readonly resetAppLink:     Locator;
  readonly menuWrapper:      Locator;

  constructor(page: Page) {
    this.page             = page;
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.closeMenuButton  = page.locator('#react-burger-cross-btn');
    this.allItemsLink     = page.locator('#inventory_sidebar_link');
    this.aboutLink        = page.locator('#about_sidebar_link');
    this.logoutLink       = page.locator('#logout_sidebar_link');
    this.resetAppLink     = page.locator('#reset_sidebar_link');
    this.menuWrapper      = page.locator('.bm-menu-wrap');
  }

  async open() {
    await this.burgerMenuButton.click();
    await this.menuWrapper.waitFor({ state: 'visible' });
  }

  async close() {
    await this.closeMenuButton.click();
  }

  async logout() {
    await this.open();
    await this.logoutLink.click();
  }

  async resetAppState() {
    await this.open();
    await this.resetAppLink.click();
  }

  async goToAllItems() {
    await this.open();
    await this.allItemsLink.click();
  }

  async assertMenuOpen() {
    await expect(this.menuWrapper).toBeVisible();
  }

  async assertMenuClosed() {
    await expect(this.menuWrapper).toHaveAttribute('aria-hidden', 'true');
  }

  async assertLogoutLinkVisible() {
    await expect(this.logoutLink).toBeVisible();
  }
}
