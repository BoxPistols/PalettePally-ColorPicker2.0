// HarmonyDialog の UI 文字列を集約
export const harmonyDialog = {
  title: 'Generate Harmony',
  description: (count: number) =>
    `ベースカラーから配色理論に基づいて ${count} 色のパレットを生成します。`,
  baseColor: 'Base color',
  harmonyScheme: 'Harmony Scheme',
  preview: 'Preview',
  overwriteWarning: '現在のパレットが上書きされます。',
  cancel: 'Cancel',
  apply: 'Apply',
};
