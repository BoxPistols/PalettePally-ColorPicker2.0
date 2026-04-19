/**
 * verifyAuth の dev escape hatch のみ単体テスト。
 * 本物のトークン検証経路（firebase-admin/auth.verifyIdToken）は
 * 統合環境テストの範囲とする。
 */

import type { NextApiRequest } from 'next';

describe('verifyAuth (dev escape hatch)', () => {
  beforeEach(() => {
    jest.resetModules();
    delete process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    delete process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    delete process.env.FIREBASE_ADMIN_PROJECT_ID;
    // ts-jest 5+ では NODE_ENV が readonly なので Object.defineProperty で書き込む
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', configurable: true });
  });

  it('admin env 未設定 + 非 production では fail-open し dev-anonymous を返す', async () => {
    const { verifyAuth } = await import('@/lib/firebase/admin');
    const req = { headers: {} } as NextApiRequest;
    const result = await verifyAuth(req);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.uid).toBe('dev-anonymous');
    }
  });
});
