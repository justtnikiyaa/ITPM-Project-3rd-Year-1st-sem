import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// BUYER CREDENTIALS
const BUYER_EMAIL = 'thrulz2002@gmail.com'; // change to sudath's actual email
const BUYER_PASSWORD = '111111'; // change to sudath's actual password

// SELLER CREDENTIALS
const SELLER_EMAIL = 'it23578981@my.sliit.lk';
const SELLER_PASSWORD = '111111';

async function loginAsSeller(page) {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', SELLER_EMAIL);
    await page.fill('input[type="password"]', SELLER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
}

async function loginAsBuyer(page) {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', BUYER_EMAIL);
    await page.fill('input[type="password"]', BUYER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
}

test.describe('ChatHub - Real-time Communication', () => {

    test('1. Login page loads correctly', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'screenshots/01-login-page.png', fullPage: true });
        await expect(page).toHaveURL(`${BASE_URL}/login`);
    });

    test('2. Seller can log in successfully', async ({ page }) => {
        await loginAsSeller(page);
        await page.screenshot({ path: 'screenshots/02-seller-after-login.png', fullPage: true });
        await expect(page).not.toHaveURL(`${BASE_URL}/login`);
    });

    test('3. Chat page loads after seller login', async ({ page }) => {
        await loginAsSeller(page);
        await page.goto(`${BASE_URL}/chat`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'screenshots/03-chat-page.png', fullPage: true });
        await expect(page).toHaveURL(`${BASE_URL}/chat`);
    });

    test('4. Chat list is visible on the left panel', async ({ page }) => {
        await loginAsSeller(page);
        await page.goto(`${BASE_URL}/chat`);
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshots/04-chat-list-visible.png', fullPage: true });
        const chatList = page.locator('.w-1\\/3');
        await expect(chatList).toBeVisible();
    });

    test('5. Message area is visible on the right panel', async ({ page }) => {
        await loginAsSeller(page);
        await page.goto(`${BASE_URL}/chat`);
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshots/05-message-area-visible.png', fullPage: true });
        const messageArea = page.locator('.w-2\\/3');
        await expect(messageArea).toBeVisible();
    });

    test('6. Back button is visible on chat page', async ({ page }) => {
        await loginAsSeller(page);
        await page.goto(`${BASE_URL}/chat`);
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'screenshots/06-back-button.png', fullPage: true });
        const backButton = page.locator('button:has-text("Back")');
        await expect(backButton).toBeVisible();
    });

    test('7. Back button navigates away from chat', async ({ page }) => {
        await loginAsSeller(page);
        await page.goto(`${BASE_URL}/chat`);
        await page.waitForTimeout(1500);
        await page.click('button:has-text("Back")');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshots/07-after-back-navigation.png', fullPage: true });
        await expect(page).not.toHaveURL(`${BASE_URL}/chat`);
    });

    test('8. Buyer can open Ask Bot and see options', async ({ page }) => {
        await loginAsBuyer(page);
        await page.goto(`${BASE_URL}/chat`);
        await page.waitForTimeout(2000);

        await page.locator('.w-1\\/3 div').first().click();
        await page.waitForTimeout(1000);

        await page.click('button:has-text("Ask Bot")');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshots/08-ask-bot-opened.png', fullPage: true });

        await expect(page.locator('text=View Seller Stats')).toBeVisible();
        await expect(page.locator('text=Check Order Progress')).toBeVisible();
    });

    test('9. Buyer can click View Seller Stats from bot', async ({ page }) => {
        await loginAsBuyer(page);
        await page.goto(`${BASE_URL}/chat`);
        await page.waitForTimeout(2000);

        await page.locator('.w-1\\/3 div').first().click();
        await page.waitForTimeout(1000);

        await page.click('button:has-text("Ask Bot")');
        await page.waitForTimeout(1000);
        await page.click('text=View Seller Stats');
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'screenshots/09-bot-seller-stats.png', fullPage: true });
    });

});