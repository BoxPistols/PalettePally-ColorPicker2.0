## 技術スタック
- Next.js 13 (Pages Router)
- TypeScript 4.x
- MUI 5 + Emotion
- chroma-js（色操作）
- @material/material-color-utilities（Material You カラースキーム生成）
- react-color（カラーピッカー UI）

## コーディング規約
- コンポーネントは関数コンポーネント + TypeScript
- スタイルは MUI の sx prop / styled() を使用
- 命名規則: PascalCase（コンポーネント）、camelCase（変数・関数）
- コメントは日本語OK

## プロジェクト構成
- `src/components/` — UI コンポーネント（ColorPicker, PaletteGrid 等）
- `src/lib/` — テーマ設定（theme.ts, colorToken.ts）
- `pages/` — Next.js ページ

## UI/UX 原則
- タッチターゲットは最小 44x44px
- コントラスト比 4.5:1 以上（通常テキスト）
- フォーカス状態は必ず視覚的に区別

## カラーパレット生成
- シードカラーから Material You の TonalPalette を使い light/dark 両方を自動生成
- MUI 互換の5色構成: lighter, light, main, dark, contrastText
<!-- claude-memory-sync: auto-generated -->

## グローバル設計方針

# グローバル設計方針

## コンポーネント設計
- 単一責任。1コンポーネント1責務
- Props は必ず型定義。any 禁止
- 副作用は hooks に分離する

## 命名規則
- コンポーネント: PascalCase
- hooks: use プレフィックス
- 定数: UPPER_SNAKE_CASE

## Claude への指示スタイル
- 差分だけ返す。ファイル全体を返さない
- 変更理由を1行コメントで添える
- 選択肢がある場合は推奨を1つ明示してから提示する

## 禁止パターン
- any の使用
- console.log の commit
- ハードコードされた文字列（i18n対象はすべて定数化）

---
<!-- このファイルは claude-memory-sync が管理します -->
<!-- 自由に編集してください。cm コマンドで同期されます -->

## プロジェクト固有の記憶（pallett-pally）

# pallett-pally プロジェクト記憶

## 技術スタック
- Next.js 13 (Pages Router) + TypeScript
- MUI 5 + Emotion（スタイリング）
- chroma-js（色操作）
- @material/material-color-utilities（Material You カラースキーム生成）
- react-color（カラーピッカー UI）

## カラーパレット生成ロジック
- シードカラーから Material You の TonalPalette を使い light/dark 両方を自動生成
- MUI 互換の5色構成: lighter, light, main, dark, contrastText

## コンポーネント構成
- ColorPicker: シードカラー選択 UI
- PaletteGrid: 生成されたパレットの表示グリッド
- colorUtils.ts: 色操作ユーティリティ（新規追加中）

## 設計方針
- MUI の sx prop / styled() を使用
- スタイルは Tailwind ではなく MUI ベース

---
<!-- このファイルは claude-memory-sync が管理します -->

