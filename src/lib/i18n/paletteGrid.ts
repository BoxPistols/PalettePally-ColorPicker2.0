// PaletteGrid コンポーネントの UI 文字列名前空間
export const paletteGrid = {
  // スウォッチ（クリックでコピー）
  copySwatchAria: (shade: string, colorValue: string) =>
    `${shade} ${colorValue} をコピー`,
  swatchTitle: (shade: string, colorValue: string) =>
    `${shade}: ${colorValue} — click to copy`,

  // コントラストプレビュー
  previewHeading: 'Preview',
  previewBadgePassTooltip: (threshold: string, thresholdLabel: string) =>
    `main + contrastText は ${threshold} 基準 (${thresholdLabel}) を満たしています。\n※ 枠 2 の "main をテキスト色として使うケース" は main カラー自体の特性で決まり、A11y toggle の対象外です。`,
  previewBadgeFailTooltip: (threshold: string, thresholdLabel: string) =>
    `main + contrastText が ${threshold} 基準 (${thresholdLabel}) 未満です`,
  previewBadgePass: (threshold: string) => `✓ ${threshold}`,
  previewBadgeFail: (threshold: string) => `✗ ${threshold}`,
  makeContrastTitle: (
    label: string,
    fg: string,
    bgHex: string,
    ratio: number,
    lvl: string,
    thresholdActive: boolean,
    pass: boolean,
    threshold: string,
    thresholdLabel: string,
    extra?: string
  ) =>
    `${label}\n文字色: ${fg}\n背景色: ${bgHex}\nコントラスト比: ${ratio.toFixed(2)}:1 (${lvl})\n` +
    (thresholdActive
      ? (pass ? `✓ ${threshold} 基準 (${thresholdLabel}) を満たしています`
              : `✗ ${threshold} 基準 (${thresholdLabel}) 未満です`)
      : 'しきい値: none (チェック無効)') +
    (extra ? `\n\n${extra}` : ''),
  previewLabelMainContrast: 'main 背景 + contrastText 文字',
  previewLabelMainAsText: (pageBg: string) =>
    `main をテキスト色として使うケース（ページ背景 ${pageBg}）`,
  previewMainAsTextNote:
    'この枠は main カラー自体の特性を表す情報表示です。A11y / White / Black toggle は contrastText (枠 1) を制御する設定なので、この値は toggle で変化しません。',
  sampleTextLabel: 'text',
  sampleMainTextLabel: 'main text',

  // スキームカラム
  copyAllColorsTitle: 'Click to copy all colors',

  // WCAG バッジ
  wcagBadgeTooltip: (ratio: number, level: string) =>
    `${ratio.toFixed(2)}:1 — ${level}`,

  // 編集ダイアログ
  dialogHeaderLight: 'Light',
  dialogHeaderDark: 'Dark',
  dialogHeaderWcag: 'WCAG',
  dialogContrastNote: 'Contrast ratio with contrastText · AAA ≥ 7 · AA ≥ 4.5 · AA-Large ≥ 3',

  // パレットカード
  groupCopiedMessage: 'Group copied!',
  copyAllVariantsTitle: 'Click to copy all variants',
  editColorsTitle: 'Edit colors',
  copiedMessage: (copiedText: string) => `Copied: ${copiedText}`,
};
