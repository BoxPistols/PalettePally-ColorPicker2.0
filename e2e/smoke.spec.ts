import { test, expect } from '@playwright/test';

test.describe('PalettePally smoke', () => {
  test('home page loads and shows generator UI', async ({ page }) => {
    await page.goto('/');
    // 重要 UI のいずれかが表示されること（厳密な文言は変わる可能性があるため
    // 複数の候補で確認）
    await expect(
      page.getByRole('button', { name: /export/i }).or(
        page.getByRole('button', { name: /import/i })
      )
    ).toBeVisible();
  });

  test('Help dialog opens', async ({ page }) => {
    await page.goto('/');
    const helpBtn = page.getByRole('button', { name: /^help$/i });
    if (await helpBtn.count()) {
      await helpBtn.first().click();
      await expect(page.getByRole('dialog')).toBeVisible();
    } else {
      test.skip(true, 'Help button not present in this build');
    }
  });
});

// 以下、issue #12 で挙げられた flows のスケルトン。
// 仕様確定 / data-testid 整備後に test.skip → test に切り替える。
test.describe.skip('PalettePally critical flows (TODO)', () => {
  test('Color picking → palette card updates', async () => {});
  test('Edit dialog → modify shade → persists', async () => {});
  test('Export/Import round-trip', async () => {});
  test('Harmony generator', async () => {});
  test('Undo/Redo', async () => {});
  test('localStorage persistence across reloads', async () => {});
  test('Figma connect dialog', async () => {});
});
