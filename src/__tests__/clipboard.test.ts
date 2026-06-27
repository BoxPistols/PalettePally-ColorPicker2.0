/**
 * @jest-environment jsdom
 */
import { copyToClipboard } from '@/lib/clipboard';

describe('copyToClipboard', () => {
  it('writes the text and returns true on success', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    await expect(copyToClipboard('#1976d2')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('#1976d2');
  });

  it('returns false (does not throw) when the clipboard API rejects', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('denied'));
    Object.assign(navigator, { clipboard: { writeText } });
    await expect(copyToClipboard('x')).resolves.toBe(false);
  });
});
