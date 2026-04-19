// Firebase Admin SDK – server-only。API ルートで ID トークンを検証する。
// env 未設定時の挙動:
//   - dev (NODE_ENV !== 'production'): 認証スキップ + 警告ログ
//   - prod: 起動時に throw して fail-closed
//
// 必要 env:
//   FIREBASE_ADMIN_CLIENT_EMAIL
//   FIREBASE_ADMIN_PRIVATE_KEY  （JSON 由来の \n を含むため改行のエスケープに注意）
//   FIREBASE_ADMIN_PROJECT_ID   （省略時は NEXT_PUBLIC_FIREBASE_PROJECT_ID にフォールバック）

import type { NextApiRequest } from 'next';
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';

const isProd = process.env.NODE_ENV === 'production';

const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
const privateKey = rawPrivateKey?.replace(/\\n/g, '\n');
const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const isConfigured = Boolean(clientEmail && privateKey && projectId);

if (!isConfigured && isProd) {
  throw new Error(
    'firebase-admin: required env not set (FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY / FIREBASE_ADMIN_PROJECT_ID)'
  );
}

let app: App | null = null;
if (isConfigured) {
  app = getApps()[0] ?? initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export type AuthResult =
  | { ok: true; uid: string; token: DecodedIdToken }
  | { ok: false; status: number; error: string };

export async function verifyAuth(req: NextApiRequest): Promise<AuthResult> {
  if (!isConfigured) {
    // dev escape hatch — fail-open のみ
    // eslint-disable-next-line no-console
    console.warn('[verifyAuth] firebase-admin not configured — bypassing in non-production');
    return { ok: true, uid: 'dev-anonymous', token: {} as DecodedIdToken };
  }

  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return { ok: false, status: 401, error: 'Missing Authorization: Bearer <id-token>' };
  }
  const idToken = header.slice('Bearer '.length).trim();
  if (!idToken) {
    return { ok: false, status: 401, error: 'Empty bearer token' };
  }

  try {
    const decoded = await getAuth(app!).verifyIdToken(idToken);
    return { ok: true, uid: decoded.uid, token: decoded };
  } catch (err) {
    return {
      ok: false,
      status: 401,
      error: err instanceof Error ? `Invalid token: ${err.message}` : 'Invalid token',
    };
  }
}
