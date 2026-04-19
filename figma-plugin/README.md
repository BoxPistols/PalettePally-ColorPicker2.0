# PalettePally Bridge (Figma Plugin)

PalettePally が生成した DTCG JSON を Figma の Variable Collections に反映する／逆方向に書き出す Figma プラグイン。

Figma Variables REST API は **Enterprise プラン限定** ですが、Plugin API は全プランで利用可能です。このプラグインはその差分を埋めるためのブリッジです。

## 機能

### Import（PalettePally → Figma）
PalettePally の `Export Hub → DTCG` からコピーした JSON を貼り付けると、以下を自動生成します：

- `action-colors` Collection（`primary/main`, `primary/contrastText` など）
- `grey` Collection（`50`, `900` など）
- `utility` Collection（`text/primary`, `background/default` など）

各 Collection に `light` / `dark` の 2 モードを作成し、Variable ごとに両モードの値を設定します。既存の同名 Variable は値のみ更新、新規は追加されます。

### Export（Figma → PalettePally）
現在の File のローカル Variable Collections を DTCG JSON 形式で書き出します。PalettePally の `Import Hub → DTCG` にペーストすれば、MUI 5 シェード構造（main/dark/light/lighter/contrastText）に自動復元されます。

## 開発

```bash
cd figma-plugin
npm install
npm run build      # code.ts → code.js に TypeScript コンパイル
npm run watch      # 監視モード
```

## Figma への読み込み

1. Figma デスクトップを開く
2. `Plugins` → `Development` → `Import plugin from manifest...`
3. `figma-plugin/manifest.json` を選択

## 命名規則

**設計方針**: `light` / `dark` は **Figma の Variable Mode** 側で表現し、変数名には含めない（Figma Variables の本来の使い方）。結果として Variable 数が半減し、モード切替が Figma 標準機能でそのまま使える。

| Collection | 変数名 | 例 |
| --- | --- | --- |
| `action-colors` | `{name}/{shade}` | `primary/main`, `secondary/contrastText` |
| `grey` | `{tone}` | `50`, `500`, `900` |
| `utility` | `{group}/{key}` | `text/primary`, `background/default` |

Import で期待する DTCG 構造（いずれも `light` / `dark` を DTCG 側でも保持）：

```json
{
  "action-colors": {
    "primary": {
      "light": { "main": { "$value": "#1976d2" }, "contrastText": { "$value": "#ffffff" } },
      "dark":  { "main": { "$value": "#64b5f6" }, "contrastText": { "$value": "#000000" } }
    }
  },
  "grey": {
    "light": { "50": { "$value": "#fafafa" } },
    "dark":  { "50": { "$value": "#121212" } }
  },
  "utility": {
    "light": { "text": { "primary": { "$value": "#1a1a2e" } } },
    "dark":  { "text": { "primary": { "$value": "#ffffff" } } }
  }
}
```

Import では DTCG の `light` / `dark` サブツリーを抽出し、それぞれを Figma Mode に格納します（変数名には mode セグメントを含めません）。Export はこの逆変換を行います。

## 往復の保証

- DTCG の `{collection}.{...}.light.{shade}` / `{collection}.{...}.dark.{shade}` を 1 つの Variable に畳み込む
- 変数名は `{name}/{shade}` / `{tone}` / `{group}/{key}` の 2 階層以下
- PalettePally の `parsedVariablesToPalette` も同じ規約で逆変換

3 点が揃っており、`buildPushPayload` → Figma → Export → `parsedVariablesToPalette` の往復でも値が保持されます（`variableMapper.test.ts` の round-trip ケースで検証済み）。

## 制約

- ネットワーク通信なし（manifest の `allowedDomains: ["none"]`）。PAT 不要。
- スコープ／エイリアス変数には未対応（今後追加予定）。
- Variable の削除は行いません（手動削除が必要）。
