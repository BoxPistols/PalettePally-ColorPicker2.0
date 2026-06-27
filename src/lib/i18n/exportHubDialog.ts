export const exportHubDialog = {
  exportPreviewAriaLabel: 'Export preview',
  title: 'Export Palette',
  // 行数とファイル拡張子を表示するメタ行
  lineCountLabel: (lineCount: number, ext: string) =>
    `${lineCount} lines · .${ext}`,
  pngLight: 'PNG (Light)',
  pngDark: 'PNG (Dark)',
  copy: 'Copy',
  download: 'Download',
  copiedToClipboard: 'Copied to clipboard',
};
