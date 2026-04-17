# PalettePally Bridge (Figma Plugin)

PalettePally が生成した DTCG JSON を Figma の Variable Collections に反映する／逆方向に書き出す Figma プラグイン。

Figma Variables REST API は **Enterprise プラン限定** ですが、Plugin API は全プランで利用可能です。このプラグインはその差分を埋めるためのブリッジです。

## 機能

### Import（PalettePally → Figma）
PalettePally の `Export Hub → DTCG` からコピーした JSON を貼り付けると、以下を自動生成します：

- `action-colors` Collection（`primary/light/main`, `primary/dark/contrastText` など）
- `grey` Collection（`light/50`, `dark/900` など）
- `utility` Collection（`light/text/primary` など）

各 Collection に `light` / `dark` の 2 モードを作成し、`valuesByMode` を設定します。既存の同名 Variable は値のみ更新、新規は追加されます。

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

## パス命名規則

Import で期待する DTCG 構造：

```json
{
  "action-colors": {
    "primary": {
      "light": { "main": { "$value": "#1976d2" }, "contrastText": { "$value": "#ffffff" }, ... },
      "dark":  { "main": { "$value": "#64b5f6" }, ... }
    }
  },
  "grey": {
    "light": { "50": { "$value": "#fafafa" }, ... },
    "dark":  { "50": { "$value": "#121212" }, ... }
  },
  "utility": {
    "light": { "text": { "primary": { "$value": "#1a1a2e" } } },
    "dark":  { "text": { "primary": { "$value": "#ffffff" } } }
  }
}
```

ネスト階層はスラッシュ連結した Variable 名（例: `primary/light/main`）として Figma に保存されるので、PalettePally の import アダプタが同じ規約でパースして MUI 構造に戻します。

## 往復の保証

- Export が書く変数名は `{group}/{mode}/{shade}`（3 階層）
- Import が復元する構造も同じ 3 階層を前提
- PalettePally 側の `src/lib/figma/variableMapper.ts` の `parsedVariablesToPalette` が同じ規約を使う

この 3 点が揃っていれば、PalettePally ↔ Figma の双方向で色情報が失われません。

## 制約

- ネットワーク通信なし（manifest の `allowedDomains: ["none"]`）。PAT 不要。
- スコープ／エイリアス変数には未対応（今後追加予定）。
- Variable の削除は行いません（手動削除が必要）。
