# Firebase Setup Guide - Palette Pally

> **Firebase は opt-in 機能です。** env 未設定のままでもアプリ本体（ColorPicker / Palette 生成 / Export / Import Hub）は動作します。Firebase を設定しない場合の挙動:
>
> - 本番 (`NODE_ENV=production`): `/api/figma/*` ルートのみ **503 Service Unavailable** を返す。他の UI / API は通常動作
> - 開発 (`yarn dev`): `/api/figma/*` も fail-open で動く（警告ログは出る）
>
> 以下の手順は「将来的に Firebase で認証 + パレット保存 + Figma API 中継を有効化する」ときの導入ガイドです。

## 1. Firebase Project Creation

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Project name: `palette-pally` (or any name)
4. Google Analytics: optional (disable for simplicity)
5. Click "Create project"

## 2. Authentication Setup

1. Left sidebar: **Build > Authentication**
2. Click "Get started"
3. **Sign-in method** tab > **Email/Password** > Enable > Save

## 3. Firestore Database Setup

1. Left sidebar: **Build > Firestore Database**
2. Click "Create database"
3. Mode: **Start in production mode**
4. Location: `asia-northeast1` (Tokyo)
5. Click "Enable"

## 4. Register Web App

1. Left sidebar: **Project Overview** (gear icon) > **Project settings**
2. Scroll to "Your apps" > Click web icon (`</>`)
3. App nickname: `palette-pally-web`
4. Firebase Hosting: skip (unchecked)
5. Click "Register app"
6. Copy the config object:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "palette-pally.firebaseapp.com",
  projectId: "palette-pally",
  storageBucket: "palette-pally.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 5. Generate Admin SDK Key (for API Routes)

1. **Project settings > Service accounts** tab
2. Click "Generate new private key"
3. Save the JSON file securely (DO NOT commit)
4. Extract `client_email` and `private_key` from the JSON

## 6. Environment Variables

Create `.env.local` in the project root:

```env
# Firebase Client SDK (public, exposed to browser)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=palette-pally.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=palette-pally
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=palette-pally.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin SDK (server-side only, NOT exposed to browser)
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@palette-pally.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv..."
```

> `.env.local` is already in `.gitignore`. Never commit this file.

## 7. Firestore Security Rules

Deploy the following rules from Firebase Console > Firestore > Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /palettes/{paletteId} {
      // Owner: full access
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.ownerUid;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.ownerUid;

      // Shared: read-only if shareId exists
      allow read: if resource.data.shareId != null;

      // Version history
      match /versions/{versionId} {
        allow read, write: if request.auth != null
          && request.auth.uid == get(
            /databases/$(database)/documents/palettes/$(paletteId)
          ).data.ownerUid;
      }
    }
  }
}
```

## 8. Firestore Indexes

Create composite indexes in Firebase Console > Firestore > Indexes:

| Collection | Fields | Order |
|---|---|---|
| `palettes` | `ownerUid` ASC, `updatedAt` DESC | Composite |
| `palettes` | `shareId` ASC | Single field (auto) |

Or deploy via CLI:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # select existing project
firebase deploy --only firestore:rules,firestore:indexes
```

### Automated deploy via GitHub Actions

`firestore.rules` / `firestore.indexes.json` / `firebase.json` がリポジトリにコミット済み。
`.github/workflows/firebase-deploy.yml` が main へのプッシュ時に自動デプロイする。

有効化に必要な GitHub Secrets:

| Secret | 値 |
| --- | --- |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Console > Project Settings > Service accounts > Generate new private key の JSON 全体 |
| `FIREBASE_PROJECT_ID` | プロジェクト ID（例: `palette-pally`） |

未設定の場合、ワークフローは警告を出してスキップする（fork でも安全）。

## 9. Figma API Token (for Phase 5)

1. Open [Figma Account Settings](https://www.figma.com/settings)
2. Scroll to **Personal access tokens**
3. Click "Generate new token"
4. Name: `palette-pally`
5. Scopes: `File content` (read/write), `Variables` (read/write)
6. Copy the token

Add to `.env.local`:

```env
# Figma (user enters per-session, or store here for dev)
FIGMA_PERSONAL_ACCESS_TOKEN=figd_...
```

> Production: users will enter their own Figma token via the UI.

## 10. Verify Setup

After configuring `.env.local`:

```bash
yarn dev
```

Check the browser console for:
- No Firebase initialization errors
- Auth sign-up/sign-in works
- Firestore read/write works

## Firestore Schema Reference

```
/palettes/{paletteId}
  ownerUid: string
  name: string
  description: string
  currentVersion: number
  createdAt: Timestamp
  updatedAt: Timestamp
  shareId: string | null
  sharePermission: 'view' | 'duplicate' | null
  tags: string[]
  data: {
    numColors: number
    colors: string[]
    names: string[]
    palette: { [name]: ColorPalette }[]
    themeTokens: ThemeTokens | null
  }

  /versions/{versionId}
    version: number
    createdAt: Timestamp
    label: string
    data: PaletteData
    changeNote: string
```
