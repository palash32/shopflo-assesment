import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;

  readonly firstNameInput:  Locator;
  readonly lastNameInput:   Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton:  Locator;
  readonly cancelStep1:     Locator;
  readonly errorBanner:     Locator;
  readonly errorClose:      Locator;
  readonly summaryItems:    Locator;
  readonly itemTotal:       Locator;
  readonly taxTotal:        Locator;
  readonly grandTotal:      Locator;
  readonly finishButton:    Locator;
  readonly cancelStep2:     Locator;
  readonly completeHeader:  Locator;
  readonly completeText:    Locator;
  readonly backHomeButton:  Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput  = page.locator('[data-test="firstName"]');
    this.lastNameInput   = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton  = page.locator('[data-test="continue"]');
    this.cancelStep1     = page.locator('[data-test="cancel"]');
    this.errorBanner     = page.locator('[data-test="error"]');
    this.errorClose      = page.locator('.error-button');
    this.summaryItems    = page.locator('.cart_item');
    this.itemTotal       = page.locator('.summary_subtotal_label');
    this.taxTotal        = page.locator('.summary_tax_label');
    this.grandTotal      = page.locator('.summary_total_label');
    this.finishButton    = page.locator('[data-test="finish"]');
    this.cancelStep2     = page.locator('[data-test="cancel"]');
    this.completeHeader  = page.locator('.complete-header');
    this.completeText    = page.locator('.complete-text');
    this.backHomeButton  = page.locator('[data-test="back-to-products"]');
  }

  async fillStep1(firstName: string, lastName: string, postalCode: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async clickContinue() {
    await this.continueButton.click();
  }

  async fillAndContinue(firstName: string, lastName: string, postalCode: string) {
    await this.fillStep1(firstName, lastName, postalCode);
    await this.clickContinue();
  }

  async clickFinish() {
    await this.finishButton.click();
  }

  async clickCancelStep1() {
    await this.cancelStep1.click();
  }

  async clickCancelStep2() {
    await this.cancelStep2.click();
  }

  async clickBackHome() {
    await this.backHomeButton.click();
  }

  async dismissError() {
    await this.errorClose.click();
  }

  async assertOnStep1() {
    await expect(this.page).toHaveURL('/checkout-step-one.html');
    await expect(this.firstNameInput).toBeVisible();
  }

  async assertOnStep2() {
    await expect(this.page).toHaveURL('/checkout-step-two.html');
  }

  async assertOnComplete() {
    await expect(this.page).toHaveURL('/checkout-complete.html');
  }

  async assertErrorContains(message: string) {
    await expect(this.errorBanner).toBeVisible();
    await expect(this.errorBanner).toContainText(message);
  }

  async assertErrorDismissed() {
    await expect(this.errorBanner).not.toBeVisible();
  }

  async assertSummaryItemCount(count: number) {
    await expect(this.summaryItems).toHaveCount(count);
  }

  async assertItemTotalText(text: string) {
    await expect(this.itemTotal).toContainText(text);
  }

  async assertCorrectTotalCalculation() {
    const itemText  = (await this.itemTotal.textContent()) ?? '';
    const taxText   = (await this.taxTotal.textContent()) ?? '';
    const totalText = (await this.grandTotal.textContent()) ?? '';

    const itemVal  = parseFloat(itemText.replace(/[^0-9.]/g, ''));
    const taxVal   = parseFloat(taxText.replace(/[^0-9.]/g, ''));
    const totalVal = parseFloat(totalText.replace(/[^0-9.]/g, ''));

    expect(Math.abs((itemVal + taxVal) - totalVal)).toBeLessThan(0.01);
  }

  async assertCompleteHeader(text: string) {
    await expect(this.completeHeader).toHaveText(text);
  }
}
