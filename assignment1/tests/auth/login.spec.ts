import { test, expect } from '@playwright/test';
import { LoginPage }     from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { USERS, INVALID_CREDS, ERROR_MSGS, URLS } from '../../utils/test-data';

test.describe('Authentication', () => {

  let login:     LoginPage;
  let inventory: InventoryPage;

  test.beforeEach(async ({ page }) => {
    login     = new LoginPage(page);
    inventory = new InventoryPage(page);
    await login.goto();
  });

  test('@positive TC-AUTH-001 | Login with standard_user redirects to inventory', async ({ page }) => {
    await login.login(USERS.STANDARD.username, USERS.STANDARD.password);
    await inventory.assertOnInventoryPage();
    await expect(page.locator('#react-burger-menu-btn')).toBeVisible();
  });

  test('@positive TC-AUTH-002 | Login with performance_glitch_user succeeds (slow)', async ({ page }) => {
    test.slow(); 
    await login.login(USERS.PERFORMANCE_GLITCH.username, USERS.PERFORMANCE_GLITCH.password);
    await inventory.assertOnInventoryPage();
  });

  test('@positive TC-AUTH-003 | Login with visual_user succeeds', async ({ page }) => {
    test.slow(); 
    await login.login(USERS.VISUAL.username, USERS.VISUAL.password);
    await inventory.assertOnInventoryPage();
  });

  test('@positive TC-AUTH-004 | Login with problem_user succeeds', async () => {
    await login.login(USERS.PROBLEM.username, USERS.PROBLEM.password);
    await inventory.assertOnInventoryPage();
  });

  test('@positive TC-AUTH-005 | Login with error_user succeeds', async () => {
    await login.login(USERS.ERROR_USER.username, USERS.ERROR_USER.password);
    await inventory.assertOnInventoryPage();
  });

  test('@positive TC-AUTH-013 | Logout via burger menu returns to login page', async ({ page }) => {
    await login.login(USERS.STANDARD.username, USERS.STANDARD.password);
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('.bm-menu-wrap').waitFor({ state: 'visible' });
    await page.locator('#logout_sidebar_link').click();
    await login.assertOnLoginPage();
  });

  test('@negative TC-AUTH-006 | Locked-out user shows error message', async () => {
    await login.login(USERS.LOCKED_OUT.username, USERS.LOCKED_OUT.password);
    await login.assertErrorContains(ERROR_MSGS.LOCKED_OUT);
    await login.assertOnLoginPage();
  });

  test('@negative TC-AUTH-007 | Empty username and password shows error', async () => {
    await login.login(INVALID_CREDS.EMPTY_BOTH.username, INVALID_CREDS.EMPTY_BOTH.password);
    await login.assertErrorContains(ERROR_MSGS.USERNAME_REQ);
  });

  test('@negative TC-AUTH-008 | Empty username only shows error', async () => {
    await login.login(INVALID_CREDS.EMPTY_USERNAME.username, INVALID_CREDS.EMPTY_USERNAME.password);
    await login.assertErrorContains(ERROR_MSGS.USERNAME_REQ);
  });

  test('@negative TC-AUTH-009 | Empty password only shows error', async () => {
    await login.login(INVALID_CREDS.EMPTY_PASSWORD.username, INVALID_CREDS.EMPTY_PASSWORD.password);
    await login.assertErrorContains(ERROR_MSGS.PASSWORD_REQ);
  });

  test('@negative TC-AUTH-010 | Wrong password shows mismatch error', async () => {
    await login.login(INVALID_CREDS.WRONG_PASSWORD.username, INVALID_CREDS.WRONG_PASSWORD.password);
    await login.assertErrorContains(ERROR_MSGS.MISMATCH);
  });

  test('@negative TC-AUTH-011 | Wrong username shows mismatch error', async () => {
    await login.login(INVALID_CREDS.WRONG_USERNAME.username, INVALID_CREDS.WRONG_USERNAME.password);
    await login.assertErrorContains(ERROR_MSGS.MISMATCH);
  });

  test('@negative TC-AUTH-012 | Direct URL access to inventory without session', async ({ page }) => {
    await page.goto(URLS.INVENTORY);
    await login.assertErrorContains(ERROR_MSGS.INVENTORY_BYPASS);
    await expect(page).toHaveURL('/');
  });

});
