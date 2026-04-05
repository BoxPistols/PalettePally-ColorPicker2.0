# Palette Pally — Handover Document

最終更新: 2026-04-06
最新コミット: `7327ff8` (Greyscale mode)

## 🚀 現在の稼働状況

- **本番 URL**: https://boxpistols.github.io/PalettePally-ColorPicker2.0/
- **デプロイ**: main push で GitHub Actions が自動実行
- **テスト**: 216 tests passing (18 suites)
- **Bundle size**: First Load 30KB / App 108KB (制限内)

## 📦 主要機能一覧

### コア
- Material You ベースのパレット生成 (24色まで)
- Action Colors (main/dark/light/lighter/contrastText) × light/dark
- Grey Scale (50-900) + Utility Tokens (text/background/surface/action/divider/common)
- カスタムトークングループ追加/削除/リネーム

### エディティング
- Edit Dialog (ネイティブピッカー + HEX 入力 + WCAG バッジ)
- Undo/Redo (⌘Z / ⌘⇧Z, 履歴50段)
- ContrastMode トグル (A11y / White / Black)
- レガシー色名 (color1 → primary) 移行ボタン

### 送受信 (10フォーマット)
- Export: JSON / DTCG / CSS / SCSS / MUI Theme / Tailwind / Tokens Studio / MCP Prompt / PNG
- Import: 自動判定 (JSON / DTCG / Tokens Studio)
- Firebase Firestore: Save/Load/Share/Version History
- Figma Variables REST API

### UI
- Example Dialog (MUI 全要素プレビュー light/dark)
- Help Dialog (日本語 7ステップガイド + FAQ)
- Greyscale モード (色覚シミュレーション, CSS filter)
- 横スクロール Color Strip + Theme Tokens

## 🎯 一時非表示 (TODO)

以下はコメントアウト済み。UX 説明が不十分なため要検討:

- **Harmony Generator** (6種類の配色理論)
  - `src/components/ColorPicker.tsx` L644-663 (コメントアウト)
  - コード本体は `src/components/harmony/HarmonyDialog.tsx` 残存
  - テスト `src/__tests__/HarmonyDialog.test.tsx` 残存
  - 再有効化するには上記コメントを解除
- **Compare Dialog** (別パレット JSON 比較)
  - 同上 L644-663
  - 本体 `src/components/compare/CompareDialog.tsx` 残存

## 📋 未解決 Issues

GitHub Issues で管理: https://github.com/BoxPistols/PalettePally-ColorPicker2.0/issues

| # | Priority | 内容 |
|---|---|---|
| #9 | Medium | Proper app-level dark mode with MUI theme integration |
| #10 | **High (Security)** | Firestore security rules deployment required |
| #11 | **High (Security)** | Figma API routes need Firebase Admin auth verification |
| #12 | Medium | E2E tests with Playwright for critical user flows |
| #13 | Low | Lighthouse CI for performance regression detection |

## 🔐 ユーザー環境設定 (未完了)

以下はユーザー側での作業が必要:

1. **Firebase プロジェクト作成** (`docs/firebase-setup.md` 参照)
   - Auth (Email/Password) 有効化
   - Firestore Database 作成 (asia-northeast1)
   - `.env.local` に config 配置
2. **Firestore Security Rules デプロイ** (Issue #10)
3. **Figma Personal Access Token 取得** (Enterprise プランのみ)

## 🧪 テストカバレッジ

| ファイル | Coverage |
|---|---|
| wcag.ts | 100% 全項目 |
| harmony.ts | 100% 全項目 |
| colorUtils.ts | 100% Lines/Functions |
| useHistory.ts | 100% Lines/Functions |
| formatters.ts | 99.48% / 97.92% branches |
| dtcg.ts | 97.91% / 93.27% branches |

### テスト対象 (18 suites, 216 tests)
- **Pure functions**: colorUtils / formatters / dtcg / wcag / harmony
- **Hooks**: useHistory
- **Dialogs**: Confirm / Harmony / Save / Compare / Export / Import / Login / FigmaConnect / Share / VersionHistory / ListDrawer
- **A11y**: 4 dialogs via jest-axe (0 violations)

## 🛠 開発コマンド

```bash
# 開発サーバー
yarn dev

# ビルド
yarn build

# テスト
yarn test
yarn test:watch
yarn test:coverage

# 型チェック
npx tsc --noEmit

# Bundle size
yarn size

# Lint
yarn lint
yarn fix        # lint + prettier auto fix
```

## 📁 ファイル構成

```
src/
├── __tests__/              # 18 テストファイル (216 tests)
├── components/
│   ├── ColorPicker.tsx     # メインコンテナ (約1100行)
│   ├── PaletteGrid.tsx     # カードグリッド + EditDialog
│   ├── ThemeTokenCards.tsx # Grey + Utility + AddGroup
│   ├── auth/               # Firebase Auth UI
│   ├── palette/            # Save/List/Version/Share
│   ├── export/             # Export/Import Hub
│   ├── harmony/            # 一時非表示
│   ├── compare/            # 一時非表示
│   ├── example/            # Example showcase Dialog
│   ├── help/               # Help Dialog
│   ├── figma/              # Figma Connect/Import/Export
│   └── common/             # ConfirmDialog
├── hooks/
│   ├── useAuth.ts          # Firebase auth state
│   ├── useAppTheme.ts      # Greyscale mode
│   ├── useHistory.ts       # Undo/Redo
│   └── useConfirmDialog.ts # 確認 Dialog promise-based
├── lib/
│   ├── formatters.ts       # 8 format converters
│   ├── harmony.ts          # 6 schemes
│   ├── wcag.ts             # Contrast ratio
│   ├── imageExport.ts      # PNG export
│   ├── firebase/           # config/auth/firestore
│   ├── figma/              # types/dtcg/variableMapper
│   └── theme/              # buildMuiTheme
pages/
├── api/figma/              # variables/push REST wrappers
├── example.tsx             # 直接 URL アクセス用
├── help.tsx                # 直接 URL アクセス用
└── shared/[shareId].tsx    # 公開パレットページ
```

## 💡 次の一手候補 (優先度順)

1. **Firestore security rules デプロイ** (Issue #10) — 本番稼働前に必須
2. **Figma API routes の auth 強化** (Issue #11) — セキュリティ
3. **app dark mode の再実装** (Issue #9) — UX
4. **Harmony/Compare の有効化** — 説明文追加 or 削除判断
5. **E2E テスト導入** (Issue #12)
6. **Lighthouse CI** (Issue #13)
