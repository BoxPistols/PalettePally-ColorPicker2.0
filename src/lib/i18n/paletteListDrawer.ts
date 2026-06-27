export const paletteListDrawer = {
  loadError: 'パレットの読み込みに失敗しました',
  title: 'My Palettes',
  reload: '再読み込み',
  emptyState: 'No saved palettes',
  // バージョン番号と更新日時を結合した secondary 表示
  versionDate: (version: number, date: string) => `v${version} — ${date}`,
};
