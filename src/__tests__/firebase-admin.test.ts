/**
 * verifyAuth の dev escape hatch のみ単体テスト。
 * 本物のトークン検証経路（firebase-admin/auth.verifyIdToken）は
 * 統合環境テストの範囲とする。
 */

import type { NextApiRequest } from 'next';

describe('verifyAuth', () => {
  const clearEnv = () => {
    delete process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    delete process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    delete process.env.FIREBASE_ADMIN_PROJECT_ID;
  };
  const setNodeEnv = (v: string) =>
    Object.defineProperty(process.env, 'NODE_ENV', { value: v, configurable: true });

  beforeEach(() => {
    jest.resetModules();
    clearEnv();
  });

  it('admin env 未設定 + 非 production では fail-open し dev-anonymous を返す', async () => {
    setNodeEnv('test');
    const { verifyAuth } = await import('@/lib/firebase/admin');
    const req = { headers: {} } as NextApiRequest;
    const result = await verifyAuth(req);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.uid).toBe('dev-anonymous');
    }
  });

  it('admin env 未設定 + production では 503 (opt-in 機能として無効)', async () => {
    setNodeEnv('production');
    const { verifyAuth, isAdminConfigured } = await import('@/lib/firebase/admin');
    expect(isAdminConfigured).toBe(false);
    const req = { headers: {} } as NextApiRequest;
    const result = await verifyAuth(req);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(503);
      expect(result.error).toMatch(/not enabled/i);
    }
  });
});
