import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton:   Locator;
  readonly errorBanner:   Locator;
  readonly errorClose:    Locator;

  constructor(page: Page) {
    this.page          = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton   = page.locator('[data-test="login-button"]');
    this.errorBanner   = page.locator('[data-test="error"]');
    this.errorClose    = page.locator('.error-button');
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async dismissError() {
    await this.errorClose.click();
  }

  async assertOnLoginPage() {
    await expect(this.loginButton).toBeVisible();
    await expect(this.page).toHaveURL('/');
  }

  async assertErrorContains(message: string) {
    await expect(this.errorBanner).toBeVisible();
    await expect(this.errorBanner).toContainText(message);
  }

  async assertErrorDismissed() {
    await expect(this.errorBanner).not.toBeVisible();
  }
}
