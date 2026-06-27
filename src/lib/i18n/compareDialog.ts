// CompareDialog の UI 文字列を集約
export const compareDialog = {
  title: 'Compare Palettes',
  description:
    '比較したい Palette Pally JSON をペーストすると、現在のパレットと並べて差分を表示します。',
  placeholder: 'Paste Palette Pally JSON (Export Hub → JSON)',
  errorNotValidPalette: 'Not a valid Palette Pally JSON',
  errorInvalidJson: 'Invalid JSON',
  currentColors: (count: number) => `Current (${count} colors)`,
  importedColors: (count: number) => `Imported (${count} colors)`,
  missing: '(missing)',
};
