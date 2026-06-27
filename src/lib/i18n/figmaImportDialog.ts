// FigmaImportDialog のユーザー向け文字列定数
export const figmaImportDialog = {
  dialogTitle: 'Import from Figma Variables',
  noColorVariables: 'No color variables found in this file',
  colorVariablesFound: (count: number) => `${count} color variables found:`,
  andMore: (count: number) => `...and ${count} more`,
  overwriteWarningIntro: '現在のパレットが Figma の Variables で上書きされます。 命名規則 ',
  overwriteWarningActionColors: '（action-colors）/',
  overwriteWarningGrey: '（grey）/ ',
  overwriteWarningRest:
    '（utility）に 従う Variables は MUI 5 シェード構造 (main/dark/light/lighter/contrastText) に 自動復元されます。light/dark は Figma Mode から取得します。',
  enterpriseIntro: 'REST API Import は Enterprise プラン限定です。非 Enterprise では',
  pluginName: ' PalettePally Figma Plugin ',
  enterpriseOutro: 'から DTCG JSON をエクスポートし、Import Hub でペーストしてください。',
  cancel: 'Cancel',
  importVariables: (count: number) => `Import ${count} Variables`,
  failedStatus: (status: number) => `Failed (${status})`,
  failedToLoad: 'Failed to load',
};
