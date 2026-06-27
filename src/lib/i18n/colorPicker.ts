// ColorPicker のユーザー向け文言（ハードコード文字列の定数化）
export const colorPicker = {
  // ヘッダー / タイトル
  appTitle: 'Palette Pally',
  appSubtitle: 'MUI Color Palette Generator',
  colorsLabel: 'Colors',

  // ツールバー Tooltip / Button
  undoTooltip: 'Undo (⌘Z)',
  redoTooltip: 'Redo (⌘⇧Z)',
  resetAllColors: 'Reset all colors',
  harmonyTooltip: 'Harmony — 補色・三角・類似など配色理論からシードカラーを生成',
  harmonyButton: 'Harmony',
  compareTooltip: 'Compare — 別パレット(JSON)を読み込んで現在のパレットと並べて比較',
  compareButton: 'Compare',
  renameLegacyTooltip: 'Rename color1/color2... to semantic names',
  renameLabel: 'Rename',

  // Contrast text 戦略トグル
  contrastStrategyTooltip: 'Contrast text 戦略 (light mode のみ適用 / dark mode は常に A11y 自動選択)',
  contrastStrategyAria: 'Contrast text strategy',
  contrastAuto: 'A11y',
  contrastWhite: 'White',
  contrastBlack: 'Black',
  contrastOptionAria: (label: string) => `Contrast: ${label}`,

  // A11y 許容しきい値トグル
  a11yThresholdTooltip:
    'A11y 許容しきい値（通常テキスト 14-16px 想定）: None (無効) / A (≥3:1, 大きい文字向け) / AA (≥4.5:1, WCAG 標準) / AAA (≥7:1, 強化)',
  a11yThresholdAria: 'A11y contrast threshold',
  thresholdNone: 'None',
  thresholdOptionAria: (label: string) => `A11y threshold: ${label}`,

  // ナビゲーション
  exampleButton: 'Example',
  greyscaleOnTooltip: 'Greyscale ON (click to disable)',
  greyscaleOffTooltip: 'Greyscale mode (monochrome preview)',

  // Figma
  importFromFigma: 'Import from Figma',
  figmaImportButton: 'Figma Import',
  pushToFigma: 'Push to Figma',
  figmaPushButton: 'Figma Push',
  connectFigmaTooltip: 'Connect Figma',
  figmaButton: 'Figma',

  // Export / Import / Help
  exportTooltip: 'Export (JSON/DTCG/CSS/SCSS/MUI/Tailwind/MCP)',
  exportAria: 'Export palette',
  exportButton: 'Export',
  importTooltip: 'Import (JSON/DTCG/Tokens Studio)',
  importAria: 'Import palette',
  importLabel: 'Import',
  helpButton: 'Help',

  // Cloud / Auth
  updateToCloudTooltip: 'Update to cloud',
  saveToCloudTooltip: 'Save to cloud',
  updateLabel: 'Update',
  saveLabel: 'Save',
  sharePaletteTooltip: 'Share palette',
  shareButton: 'Share',
  versionHistoryTooltip: 'Version history',
  historyButton: 'History',
  loginButton: 'Login',

  // カラーストリップ
  colorNameAria: (n: number) => `Color ${n} name`,

  // Theme Tokens セクション
  themeTokensHeading: 'Theme Tokens',
  derivedFrom: (name: string) => `derived from ${name}`,

  // 確認ダイアログ
  updatePaletteTitle: 'Update Palette',
  updatePaletteMessage: (name: string) => `"${name}" を上書きしますか？`,
  deletePaletteTitle: 'Delete Palette',
  deletePaletteMessage: (name: string) => `"${name}" を完全に削除しますか？この操作は取り消せません。`,
  deleteLabel: 'Delete',
  restoreVersionTitle: 'Restore Version',
  restoreVersionMessage: (version: number) =>
    `v${version} に復元しますか？現在の変更は新しいバージョンとして保存されます。`,
  restoreLabel: 'Restore',
  revokeShareTitle: 'Revoke Share Link',
  revokeShareMessage: 'このリンクを無効にしますか？既に共有された相手はアクセスできなくなります。',
  revokeLabel: 'Revoke',
  resetAllColorsTitle: 'Reset All Colors',
  resetAllColorsMessage: '全てのカラーを初期状態にリセットしますか？',
  resetLabel: 'Reset',
  renameSemanticTitle: 'Rename to Semantic Names',
  renameSemanticMessage: 'color1/color2... を primary/secondary/success/warning/info/error に変更しますか？',
  pushToFigmaMessage: 'Figma Variables を上書きします。この操作は取り消せません。',
  pushLabel: 'Push',
  importFromFigmaMessage: '現在のパレットが Figma の Variables で置き換えられます。',
  importPaletteTitle: 'Import Palette',
  importPaletteMessage: '現在のパレットを上書きしますか？',
};
